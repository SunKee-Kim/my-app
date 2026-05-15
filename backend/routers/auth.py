from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import hashlib
from database import get_db
import models

router = APIRouter(prefix="/api/auth", tags=["auth"])


def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


class LoginRequest(BaseModel):
    user_id: str
    password: str


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(user_id=body.user_id).first()
    if not user or user.password_hash != hash_password(body.password):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")
    if not user.use_yn:
        raise HTTPException(status_code=403, detail="사용 중지된 계정입니다.")
    return {
        "user_id": user.user_id,
        "user_name": user.user_name,
        "email": user.email,
        "org_id": user.org_id,
    }
