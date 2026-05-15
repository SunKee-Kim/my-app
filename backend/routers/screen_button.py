from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from database import get_db
import models

router = APIRouter(prefix="/api/screen-buttons", tags=["screen-button"])


class ButtonCreate(BaseModel):
    button_id: str
    menu_id: str
    button_name: str
    button_code: str
    sort_order: int = 0
    use_yn: bool = True


class ButtonUpdate(BaseModel):
    button_name: Optional[str] = None
    button_code: Optional[str] = None
    sort_order: Optional[int] = None
    use_yn: Optional[bool] = None


@router.get("")
def list_buttons(menu_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.ScreenButton)
    if menu_id:
        query = query.filter_by(menu_id=menu_id)
    return query.order_by(models.ScreenButton.sort_order).all()


@router.post("", status_code=201)
def create_button(body: ButtonCreate, db: Session = Depends(get_db)):
    if db.query(models.ScreenButton).filter_by(button_id=body.button_id).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 버튼ID입니다.")
    if not db.query(models.Menu).filter_by(menu_id=body.menu_id).first():
        raise HTTPException(status_code=404, detail="메뉴를 찾을 수 없습니다.")
    button = models.ScreenButton(**body.model_dump())
    db.add(button)
    db.commit()
    db.refresh(button)
    return button


@router.put("/{button_id}")
def update_button(button_id: str, body: ButtonUpdate, db: Session = Depends(get_db)):
    button = db.query(models.ScreenButton).filter_by(button_id=button_id).first()
    if not button:
        raise HTTPException(status_code=404, detail="버튼을 찾을 수 없습니다.")
    for key, value in body.model_dump(exclude_none=True).items():
        setattr(button, key, value)
    db.commit()
    db.refresh(button)
    return button


@router.delete("/{button_id}", status_code=204)
def delete_button(button_id: str, db: Session = Depends(get_db)):
    button = db.query(models.ScreenButton).filter_by(button_id=button_id).first()
    if not button:
        raise HTTPException(status_code=404, detail="버튼을 찾을 수 없습니다.")
    db.delete(button)
    db.commit()
