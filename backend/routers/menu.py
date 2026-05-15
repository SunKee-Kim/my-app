from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from database import get_db
import models

router = APIRouter(prefix="/api/menus", tags=["menu"])


class MenuCreate(BaseModel):
    menu_id: str
    menu_name: str
    parent_menu_id: Optional[str] = None
    url: Optional[str] = None
    icon: Optional[str] = None
    sort_order: int = 0
    use_yn: bool = True


class MenuUpdate(BaseModel):
    menu_name: Optional[str] = None
    parent_menu_id: Optional[str] = None
    url: Optional[str] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = None
    use_yn: Optional[bool] = None


@router.get("")
def list_menus(db: Session = Depends(get_db)):
    return db.query(models.Menu).order_by(models.Menu.sort_order).all()


@router.post("", status_code=201)
def create_menu(body: MenuCreate, db: Session = Depends(get_db)):
    if db.query(models.Menu).filter_by(menu_id=body.menu_id).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 메뉴ID입니다.")
    menu = models.Menu(**body.model_dump())
    db.add(menu)
    db.commit()
    db.refresh(menu)
    return menu


@router.put("/{menu_id}")
def update_menu(menu_id: str, body: MenuUpdate, db: Session = Depends(get_db)):
    menu = db.query(models.Menu).filter_by(menu_id=menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="메뉴를 찾을 수 없습니다.")
    for key, value in body.model_dump(exclude_none=True).items():
        setattr(menu, key, value)
    db.commit()
    db.refresh(menu)
    return menu


@router.delete("/{menu_id}", status_code=204)
def delete_menu(menu_id: str, db: Session = Depends(get_db)):
    menu = db.query(models.Menu).filter_by(menu_id=menu_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="메뉴를 찾을 수 없습니다.")
    db.delete(menu)
    db.commit()
