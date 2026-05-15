from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from database import get_db
import models

router = APIRouter(prefix="/api/common-codes", tags=["common-code"])


class GroupCreate(BaseModel):
    group_code: str
    group_name: str
    description: Optional[str] = None
    use_yn: bool = True


class GroupUpdate(BaseModel):
    group_name: Optional[str] = None
    description: Optional[str] = None
    use_yn: Optional[bool] = None


class CodeCreate(BaseModel):
    code: str
    code_name: str
    sort_order: int = 0
    use_yn: bool = True


class CodeUpdate(BaseModel):
    code_name: Optional[str] = None
    sort_order: Optional[int] = None
    use_yn: Optional[bool] = None


@router.get("/groups")
def list_groups(db: Session = Depends(get_db)):
    return db.query(models.CommonCodeGroup).all()


@router.post("/groups", status_code=201)
def create_group(body: GroupCreate, db: Session = Depends(get_db)):
    if db.query(models.CommonCodeGroup).filter_by(group_code=body.group_code).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 그룹코드입니다.")
    group = models.CommonCodeGroup(**body.model_dump())
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.put("/groups/{group_code}")
def update_group(group_code: str, body: GroupUpdate, db: Session = Depends(get_db)):
    group = db.query(models.CommonCodeGroup).filter_by(group_code=group_code).first()
    if not group:
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다.")
    for key, value in body.model_dump(exclude_none=True).items():
        setattr(group, key, value)
    db.commit()
    db.refresh(group)
    return group


@router.delete("/groups/{group_code}", status_code=204)
def delete_group(group_code: str, db: Session = Depends(get_db)):
    group = db.query(models.CommonCodeGroup).filter_by(group_code=group_code).first()
    if not group:
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다.")
    db.delete(group)
    db.commit()


@router.get("/groups/{group_code}/codes")
def list_codes(group_code: str, db: Session = Depends(get_db)):
    return db.query(models.CommonCode).filter_by(group_code=group_code).order_by(models.CommonCode.sort_order).all()


@router.post("/groups/{group_code}/codes", status_code=201)
def create_code(group_code: str, body: CodeCreate, db: Session = Depends(get_db)):
    if not db.query(models.CommonCodeGroup).filter_by(group_code=group_code).first():
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다.")
    if db.query(models.CommonCode).filter_by(group_code=group_code, code=body.code).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 코드입니다.")
    code = models.CommonCode(group_code=group_code, **body.model_dump())
    db.add(code)
    db.commit()
    db.refresh(code)
    return code


@router.put("/groups/{group_code}/codes/{code}")
def update_code(group_code: str, code: str, body: CodeUpdate, db: Session = Depends(get_db)):
    item = db.query(models.CommonCode).filter_by(group_code=group_code, code=code).first()
    if not item:
        raise HTTPException(status_code=404, detail="코드를 찾을 수 없습니다.")
    for key, value in body.model_dump(exclude_none=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/groups/{group_code}/codes/{code}", status_code=204)
def delete_code(group_code: str, code: str, db: Session = Depends(get_db)):
    item = db.query(models.CommonCode).filter_by(group_code=group_code, code=code).first()
    if not item:
        raise HTTPException(status_code=404, detail="코드를 찾을 수 없습니다.")
    db.delete(item)
    db.commit()
