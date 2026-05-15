from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr
import hashlib
from database import get_db
import models

router = APIRouter(prefix="/api/users", tags=["user"])


def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


class UserCreate(BaseModel):
    user_id: str
    user_name: str
    email: str
    password: str
    org_id: Optional[str] = None
    use_yn: bool = True


class UserUpdate(BaseModel):
    user_name: Optional[str] = None
    email: Optional[str] = None
    org_id: Optional[str] = None
    use_yn: Optional[bool] = None


@router.get("")
def list_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [
        {
            "user_id": u.user_id,
            "user_name": u.user_name,
            "email": u.email,
            "org_id": u.org_id,
            "use_yn": u.use_yn,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.post("", status_code=201)
def create_user(body: UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(user_id=body.user_id).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 사용자ID입니다.")
    if db.query(models.User).filter_by(email=body.email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")
    user = models.User(
        user_id=body.user_id,
        user_name=body.user_name,
        email=body.email,
        password_hash=hash_password(body.password),
        org_id=body.org_id,
        use_yn=body.use_yn,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"user_id": user.user_id, "user_name": user.user_name, "email": user.email}


@router.put("/{user_id}")
def update_user(user_id: str, body: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(user_id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    for key, value in body.model_dump(exclude_none=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return {"user_id": user.user_id, "user_name": user.user_name, "email": user.email}


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(user_id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    db.delete(user)
    db.commit()
