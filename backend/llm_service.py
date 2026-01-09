from groq import Groq
import os
import json
from typing import Dict, Any

API_KEY = os.getenv("GROQ_API_KEY")

async def process_review_with_llm(rating: int, text: str) -> Dict[str, str]:
    if not API_KEY:
        print("GROQ_API_KEY not found. Returning fallback AI response.")
        return {
            "summary": "AI Summary Unavailable (Missing Key)",
            "suggestedAction": "Check manually",
            "response": "Thank you for your feedback."
        }

    client = Groq(api_key=API_KEY)
    
    prompt = f"""
    You are a helpful assistant for a business.
    A user has left a review with rating {rating}/5 and text: "{text}".

    Please generate a valid JSON object with the following fields:
    1. "summary": A concise summary of the review (max 15 words).
    2. "suggestedAction": A recommended short action for the admin (max 10 words).
    3. "response": A polite, professional response to the user.
    4. "sentiment": One of "Positive", "Neutral", "Negative".
    5. "aspects": A JSON list of relevant aspects mentioned (e.g., ["Service", "Food", "Ambience", "Time", "Price"]). return [] if none.

    Return ONLY the valid JSON, no markdown formatting.
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            response_format={"type": "json_object"} # Force JSON mode
        )

        content = chat_completion.choices[0].message.content
        return json.loads(content)

    except Exception as e:
        print(f"LLM Error: {e}")
        return {
            "summary": "Error processing review",
            "suggestedAction": "Manual review required",
            "response": "Thank you for your review (System Error)."
        }
