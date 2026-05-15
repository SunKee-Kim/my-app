from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from database import get_db
import models

router = APIRouter(prefix="/api/permissions", tags=["permission"])


class MenuPermissionItem(BaseModel):
    menu_id: str
    can_read: bool = False
    can_write: bool = False
    can_update: bool = False
    can_delete: bool = False


class ButtonPermissionItem(BaseModel):
    button_id: str
    granted: bool = False


@router.get("/menu/{user_id}")
def get_user_menu_permissions(user_id: str, db: Session = Depends(get_db)):
    if not db.query(models.User).filter_by(user_id=user_id).first():
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    perms = db.query(models.UserMenuPermission).filter_by(user_id=user_id).all()
    return perms


@router.put("/menu/{user_id}")
def save_user_menu_permissions(user_id: str, items: List[MenuPermissionItem], db: Session = Depends(get_db)):
    if not db.query(models.User).filter_by(user_id=user_id).first():
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    for item in items:
        perm = db.query(models.UserMenuPermission).filter_by(user_id=user_id, menu_id=item.menu_id).first()
        if perm:
            perm.can_read = item.can_read
            perm.can_write = item.can_write
            perm.can_update = item.can_update
            perm.can_delete = item.can_delete
        else:
            perm = models.UserMenuPermission(user_id=user_id, **item.model_dump())
            db.add(perm)
    db.commit()
    return {"message": "저장되었습니다."}


@router.get("/button/{user_id}")
def get_user_button_permissions(user_id: str, db: Session = Depends(get_db)):
    if not db.query(models.User).filter_by(user_id=user_id).first():
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    perms = db.query(models.UserButtonPermission).filter_by(user_id=user_id).all()
    return perms


@router.put("/button/{user_id}")
def save_user_button_permissions(user_id: str, items: List[ButtonPermissionItem], db: Session = Depends(get_db)):
    if not db.query(models.User).filter_by(user_id=user_id).first():
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    for item in items:
        perm = db.query(models.UserButtonPermission).filter_by(user_id=user_id, button_id=item.button_id).first()
        if perm:
            perm.granted = item.granted
        else:
            perm = models.UserButtonPermission(user_id=user_id, **item.model_dump())
            db.add(perm)
    db.commit()
    return {"message": "저장되었습니다."}
