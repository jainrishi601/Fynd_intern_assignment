from fastapi import APIRouter, Depends
from sqlmodel import Session, select, text
from database import get_session
from models import Review, Admin
from auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

from typing import Optional
from sqlalchemy import func

@router.get("/dashboard")
async def get_dashboard_metrics(
    min_rating: Optional[int] = None,
    search: Optional[str] = None,
    month: Optional[str] = None,
    sentiment: Optional[str] = None,
    aspect: Optional[str] = None,
    session: Session = Depends(get_session), 
    current_user: Admin = Depends(get_current_user)
):
    # Base Query
    query = select(Review)
    
    if min_rating:
        query = query.where(Review.rating == min_rating)
        
    if search:
        query = query.where(Review.content.contains(search))

    if month:
        query = query.where(func.strftime('%Y-%m', Review.createdAt) == month)

    if sentiment:
        query = query.where(Review.sentiment == sentiment)

    if aspect:
        query = query.where(Review.aspects.contains(aspect))
        
    # Execute query
    total_reviews = session.exec(query).all()
    count = len(total_reviews)
    
    # Average Rating
    avg_rating = sum(r.rating for r in total_reviews) / count if count > 0 else 0
    
    # Rating Distribution (1-5 stars)
    distribution = {i: 0 for i in range(1, 6)}
    for r in total_reviews:
        distribution[r.rating] += 1
        
    # Monthly Trend (Python Aggregation)
    from collections import defaultdict
    from datetime import datetime

    monthly_stats = defaultdict(lambda: {"count": 0, "total_rating": 0, "positive": 0, "neutral": 0, "negative": 0})
    
    for r in total_reviews:
        # Assuming r.createdAt is a datetime object
        month_key = r.createdAt.strftime('%Y-%m')
        
        stats = monthly_stats[month_key]
        stats["count"] += 1
        stats["total_rating"] += r.rating
        
        if r.rating >= 4:
            stats["positive"] += 1
        elif r.rating == 3:
            stats["neutral"] += 1
        else:
            stats["negative"] += 1

    monthly_trend = []
    for month in sorted(monthly_stats.keys()):
        stats = monthly_stats[month]
        monthly_trend.append({
            "month": month,
            "count": stats["count"],
            "avg_rating": round(stats["total_rating"] / stats["count"], 2) if stats["count"] > 0 else 0,
            "positive": stats["positive"],
            "neutral": stats["neutral"],
            "negative": stats["negative"]
        })

    return {
        "total_reviews": count,
        "average_rating": round(avg_rating, 2),
        "rating_distribution": distribution,
        "monthly_trend": monthly_trend
    }

from datetime import timedelta, datetime
from llm_service import process_review_with_llm # Note: we might need a new function for summary
from groq import Groq
import os

@router.get("/weekly-insight")
async def get_weekly_insight(session: Session = Depends(get_session), current_user: Admin = Depends(get_current_user)):
    today = datetime.utcnow()
    last_week = today - timedelta(days=7)
    prev_week = today - timedelta(days=14)
    
    # helper
    def get_reviews_between(start, end):
        q = select(Review).where(Review.createdAt >= start).where(Review.createdAt < end)
        return session.exec(q).all()

    current_reviews = get_reviews_between(last_week, today)
    prev_reviews = get_reviews_between(prev_week, last_week)
    
    current_text = "\n".join([f"- {r.rating}/5: {r.content}" for r in current_reviews])
    prev_text = "\n".join([f"- {r.rating}/5: {r.content}" for r in prev_reviews])
    
    API_KEY = os.getenv("GROQ_API_KEY")
    if not API_KEY:
        return {"summary": "AI Insights unavailable (key missing)."}
        
    client = Groq(api_key=API_KEY)
    
    prompt = f"""
    Analyze these two weeks of reviews for a business.
    
    Current Week:
    {current_text[:2000]} # Truncate to avoid context limit
    
    Previous Week:
    {prev_text[:2000]}
    
    Generate a short 2-sentence summary comparing performance. 
    Highlight: New complaints, repeated issues, or improvements.
    Style: "This week customers complained mostly about..., while..."
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.5
        )
        summary = completion.choices[0].message.content
        return {"summary": summary}
    except Exception as e:
        return {"summary": "Could not generate insight."}

from fastapi.responses import Response
from fpdf import FPDF
import io

@router.get("/report/{month}")
async def generate_monthly_report(
    month: str, 
    min_rating: Optional[int] = None,
    search: Optional[str] = None,
    sentiment: Optional[str] = None,
    aspect: Optional[str] = None,
    session: Session = Depends(get_session), 
    current_user: Admin = Depends(get_current_user)
):
    # 1. Fetch Data
    query = select(Review).where(func.strftime('%Y-%m', Review.createdAt) == month)
    
    if min_rating:
        query = query.where(Review.rating == min_rating)
    
    if search:
        query = query.where(Review.content.contains(search))
        
    if sentiment:
        query = query.where(Review.sentiment == sentiment)
        
    if aspect:
        query = query.where(Review.aspects.contains(aspect))

    reviews = session.exec(query).all()
    
    if not reviews:
        return Response(content="No data for this month", media_type="text/plain", status_code=404)

    total = len(reviews)
    avg = sum(r.rating for r in reviews) / total if total > 0 else 0
    
    pos = sum(1 for r in reviews if r.rating >= 4)
    neu = sum(1 for r in reviews if r.rating == 3)
    neg = sum(1 for r in reviews if r.rating <= 2)
    
    # 2. AI Summary of the month
    reviews_text = "\n".join([f"- {r.rating} stars: {r.content}" for r in reviews[:30]]) # limit context
    
    ai_summary = "AI Summary unavailable"
    top_complaints = "N/A"
    highlights = "N/A"
    actions = "N/A"

    API_KEY = os.getenv("GROQ_API_KEY")
    if API_KEY:
        client = Groq(api_key=API_KEY)
        prompt = f"""
        Analyze these reviews for {month}:
        {reviews_text[:3000]}
        
        Provide a JSON with:
        1. "summary": Short paragraph summary.
        2. "complaints": Top complaints.
        3. "highlights": Positive highlights.
        4. "actions": Recommended actions.
        """
        try:
            completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"}
            )
            import json
            data = json.loads(completion.choices[0].message.content)
            ai_summary = data.get("summary", "")
            top_complaints = data.get("complaints", "")
            highlights = data.get("highlights", "")
            actions = data.get("actions", "")
        except Exception:
            pass

    # 3. PDF Gen
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('helvetica', 'B', 20)
    pdf.cell(0, 10, f'Monthly Report: {month}', new_x="LMARGIN", new_y="NEXT", align='C')
    pdf.ln(10)
    
    pdf.set_font('helvetica', '', 12)
    pdf.cell(0, 10, f'Total Reviews: {total}   |   Average Rating: {avg:.2f} / 5', new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 10, f'Sentiment: {pos} Positive, {neu} Neutral, {neg} Negative', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)
    
    def section(title, body):
        pdf.set_font('helvetica', 'B', 14)
        pdf.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        pdf.set_font('helvetica', '', 11)
        pdf.multi_cell(0, 7, str(body))
        pdf.ln(5)

    section("AI Executive Summary", ai_summary)
    section("Top Complaints", top_complaints)
    section("Positive Highlights", highlights)
    section("Recommended Actions", actions)
    
    pdf_bytes = pdf.output()
    
    # Return PDF
    return Response(
        content=bytes(pdf_bytes), 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=report_{month}.pdf"}
    )
