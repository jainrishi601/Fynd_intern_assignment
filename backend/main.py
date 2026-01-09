from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv()

from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import create_db_and_tables
from routers import reviews, analytics, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    
    # Auto-create default admin if not exists
    from sqlmodel import Session, select
    from database import engine
    from models import Admin
    from auth import get_password_hash
    
    with Session(engine) as session:
        existing_admin = session.exec(select(Admin).where(Admin.username == "admin")).first()
        if not existing_admin:
            hashed_pwd = get_password_hash("password123")
            new_admin = Admin(username="admin", hashed_password=hashed_pwd)
            session.add(new_admin)
            session.commit()
            print("✅ Default admin user created (admin/password123)")
            
    yield

app = FastAPI(lifespan=lifespan, title="Review Dashboard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reviews.router)
app.include_router(analytics.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Review Dashboard API"}
