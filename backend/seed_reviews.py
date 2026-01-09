
import csv
import random
from datetime import datetime, timedelta
import json
from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import Review

# Aspect options
ASPECTS = ["Food", "Service", "Ambience", "Price", "Cleanliness", "Location"]

def seed_reviews():
    print("🌱 Seeding database with reviews from yelp.csv...")
    records = []
    
    # Read CSV
    try:
        with open("../yelp.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            all_rows = list(reader)
            # Pick 60 random reviews to ensure good distribution
            if len(all_rows) > 60:
                selected_rows = random.sample(all_rows, 60)
            else:
                selected_rows = all_rows
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    # Create DB tables if not exist
    create_db_and_tables()

    with Session(engine) as session:
        for i, row in enumerate(selected_rows):
            try:
                stars = int(row.get("stars", 5))
                text = row.get("text", "")
                
                # Infer Sentiment
                if stars >= 4:
                    sentiment = "Positive"
                elif stars <= 2:
                    sentiment = "Negative"
                else:
                    sentiment = "Neutral"
                    
                # Randomize Date (Last 12 months)
                days_ago = random.randint(0, 365)
                fake_date = datetime.now() - timedelta(days=days_ago)
                
                # Randomize Aspects (1 to 3 aspects)
                num_aspects = random.randint(1, 3)
                review_aspects = random.sample(ASPECTS, num_aspects)
                
                new_review = Review(
                    content=text[:1000],  # Fixed field name
                    rating=stars,         # Fixed field name
                    sentiment=sentiment,
                    aspects=json.dumps(review_aspects),
                    response=f"Thank you for your {stars}-star review! (Auto-generated reply)",
                    createdAt=fake_date   # Fixed field name
                )
                session.add(new_review)
            except Exception as e:
                print(f"Skipping row {i}: {e}")
                continue
        
        session.commit()
        print(f"✅ Successfully added {len(selected_rows)} reviews to the database!")

if __name__ == "__main__":
    seed_reviews()
