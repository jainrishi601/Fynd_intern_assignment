from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta
from database import get_session
from models import Admin
from auth import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_password_hash

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(Admin).where(Admin.username == form_data.username)
    user = session.exec(statement).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/setup-admin")
async def create_initial_admin(admin_data: Admin, session: Session = Depends(get_session)):
    # This endpoint should probably be protected or removed in production, but key for setup
    # Check if any admin exists
    statement = select(Admin)
    results = session.exec(statement).all()
    if len(results) > 0:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    hashed_pwd = get_password_hash(admin_data.hashed_password) # Client sends plain password in this field for simplicity of this setup call
    new_admin = Admin(username=admin_data.username, hashed_password=hashed_pwd)
    session.add(new_admin)
    session.commit()
    return {"msg": "Admin created"}
