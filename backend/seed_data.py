import requests
import pandas as pd
import time
import os
import sys

# Ensure backend directory is in path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session, select
from database import engine
from models import Admin
from passlib.context import CryptContext

API_URL = "http://localhost:8000"
CSV_PATH = "../yelp.csv"

# Hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password):
    return pwd_context.hash(password)

def create_admin_direct():
    print("Creating admin user directly in DB...")
    with Session(engine) as session:
        statement = select(Admin).where(Admin.username == "admin")
        results = session.exec(statement).first()
        if results:
            print("INFO: Admin already exists in DB.")
            return

        try:
            hashed_pwd = get_password_hash("password123")
            new_admin = Admin(username="admin", hashed_password=hashed_pwd)
            session.add(new_admin)
            session.commit()
            print("✅ Admin user created directly in DB.")
        except Exception as e:
            print(f"❌ Error creating admin in DB: {e}")

import random
from datetime import datetime, timedelta
from database import engine
from models import Review

def seed_reviews():
    print(f"Reading {CSV_PATH}...")
    try:
        if not os.path.exists(CSV_PATH):
            print(f"❌ File not found: {CSV_PATH}")
            return

        df = pd.read_csv(CSV_PATH)
        if 'stars' in df.columns and 'text' in df.columns:
            # Take 50 reviews for better variance
            reviews = df[['stars', 'text']].head(50).to_dict('records')
        else:
            print("⚠️ CSV columns not found. Using mock data.")
            reviews = [{"stars": 5, "text": "Great service!"}] * 20

        print(f"Seeding {len(reviews)} reviews directly to DB with historical dates...")
        
        with Session(engine) as session:
            for i, r in enumerate(reviews):
                # Random date within last 365 days
                days_ago = random.randint(0, 365)
                created_at = datetime.utcnow() - timedelta(days=days_ago)
                
                # Create review object directly
                review = Review(
                    rating=int(r['stars']),
                    content=str(r['text'])[:500],
                    createdAt=created_at,
                    summary="Seeded review summary.",
                    suggestedAction="Seeded action.",
                    response="Seeded response."
                )
                session.add(review)
                
            session.commit()
            print(f"✅ Successfully seeded {len(reviews)} reviews with historical dates.")
        
    except Exception as e:
        print(f"❌ Error seeding reviews: {e}")

if __name__ == "__main__":
    create_admin_direct()
    seed_reviews()
