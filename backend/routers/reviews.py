from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List, Optional
from database import get_session
from models import Review, ReviewCreate, ReviewRead
from llm_service import process_review_with_llm

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("/", response_model=ReviewRead)
async def create_review(review: ReviewCreate, session: Session = Depends(get_session)):
    # 1. Save initial review
    review_data = review.dict(exclude_unset=True)
    if review.createdAt is None:
        review_data.pop("createdAt", None)
        
    db_review = Review(**review_data)
    session.add(db_review)
    session.commit()
    session.refresh(db_review)

    # 2. Process with LLM
    try:
        ai_result = await process_review_with_llm(review.rating, review.content)
        
        db_review.summary = ai_result.get("summary")
        db_review.suggestedAction = ai_result.get("suggestedAction")
        db_review.response = ai_result.get("response")
        db_review.sentiment = ai_result.get("sentiment")
        
        aspects_list = ai_result.get("aspects", [])
        import json
        db_review.aspects = json.dumps(aspects_list) if isinstance(aspects_list, list) else json.dumps([])
        
        session.add(db_review)
        session.commit()
        session.refresh(db_review)
    except Exception as e:
        print(f"Error processing LLM: {e}")
        # Start fresh just in case
        session.refresh(db_review)
        
    return db_review

from models import AdminNote
from datetime import datetime

@router.post("/{review_id}/notes", response_model=AdminNote)
async def add_admin_note(review_id: int, note_content: str, admin_id: Optional[int] = None, session: Session = Depends(get_session)):
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # In a real app, admin_id would come from current_user dependency
    note = AdminNote(review_id=review_id, admin_id=admin_id, content=note_content, created_at=datetime.utcnow())
    session.add(note)
    session.commit()
    session.refresh(note)
    return note

@router.get("/{review_id}/notes", response_model=List[AdminNote])
async def get_admin_notes(review_id: int, session: Session = Depends(get_session)):
    statement = select(AdminNote).where(AdminNote.review_id == review_id).order_by(AdminNote.created_at.desc())
    notes = session.exec(statement).all()
    return notes

from typing import Optional

@router.get("/", response_model=List[ReviewRead])
async def read_reviews(
    offset: int = 0, 
    limit: int = 20, 
    min_rating: Optional[int] = None,
    search: Optional[str] = None,
    month: Optional[str] = None,
    sentiment: Optional[str] = None,
    aspect: Optional[str] = None,
    session: Session = Depends(get_session)
):
    query = select(Review).order_by(Review.id.desc())
    
    if min_rating:
        query = query.where(Review.rating == min_rating)
        
    if search:
        query = query.where(Review.content.contains(search))

    if month:
        # SQLite specific: strftime('%Y-%m', createdAt)
        query = query.where(func.strftime('%Y-%m', Review.createdAt) == month)
    
    if sentiment:
        query = query.where(Review.sentiment == sentiment)

    if aspect:
        query = query.where(Review.aspects.contains(aspect))
        
    reviews = session.exec(query.offset(offset).limit(limit)).all()
    return reviews
