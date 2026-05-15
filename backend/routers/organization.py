from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from database import get_db
import models

router = APIRouter(prefix="/api/organizations", tags=["organization"])


class OrgCreate(BaseModel):
    org_id: str
    org_name: str
    parent_org_id: Optional[str] = None
    sort_order: int = 0
    use_yn: bool = True


class OrgUpdate(BaseModel):
    org_name: Optional[str] = None
    parent_org_id: Optional[str] = None
    sort_order: Optional[int] = None
    use_yn: Optional[bool] = None


@router.get("")
def list_organizations(db: Session = Depends(get_db)):
    return db.query(models.Organization).all()


@router.post("", status_code=201)
def create_organization(body: OrgCreate, db: Session = Depends(get_db)):
    if db.query(models.Organization).filter_by(org_id=body.org_id).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 조직ID입니다.")
    org = models.Organization(**body.model_dump())
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@router.put("/{org_id}")
def update_organization(org_id: str, body: OrgUpdate, db: Session = Depends(get_db)):
    org = db.query(models.Organization).filter_by(org_id=org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="조직을 찾을 수 없습니다.")
    for key, value in body.model_dump(exclude_none=True).items():
        setattr(org, key, value)
    db.commit()
    db.refresh(org)
    return org


@router.delete("/{org_id}", status_code=204)
def delete_organization(org_id: str, db: Session = Depends(get_db)):
    org = db.query(models.Organization).filter_by(org_id=org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="조직을 찾을 수 없습니다.")
    db.delete(org)
    db.commit()
