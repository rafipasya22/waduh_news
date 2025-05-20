from sqlalchemy.orm import Session
from fastapi import HTTPException, Request
import models, schemas, utilities
import os

def get_items(db: Session):
    return db.query(models.Item).all()

def get_item(db: Session, item_id: int):
    return db.query(models.Item).filter(models.Item.id == item_id).first()

def get_accs(db: Session):
    return db.query(models.Akun).all()

def get_acc(db: Session, akun_id: int):
    return db.query(models.Akun).filter(models.Akun.id == akun_id).first()

def create_item(db: Session, item: schemas.ItemCreate):
    db_item = models.Item(name=item.name, description=item.description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def create_akun(db: Session, akun: schemas.Akun_create):
    hash_password = utilities.hash_password(akun.Password);
    db_akun = models.Akun(First_name = akun.First_name, Last_name = akun.Last_name, Email = akun.Email, Username=akun.Username, Password = hash_password)
    db.add(db_akun)
    db.commit()
    db.refresh(db_akun)
    return db_akun

def update_item(db: Session, item: schemas.ItemUpdate, item_id: int):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()

    if not db_item:
        raise HTTPException(status_code=404, detail=f"Item Not Found")
    
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    
    return db_item

def update_acc(request: Request, db: Session, First_name: str, Last_name: str, email_new: str):
    user_session = request.session.get("user")
    if not(user_session):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    email_old = user_session["email"]
    user = db.query(models.Akun).filter(models.Akun.Email == email_old).first()

    if not(user):
        raise HTTPException(status_code=404, detail="Account Not Found")

    if First_name.strip():
        user.First_name = First_name

    if Last_name.strip():
        user.Last_name = Last_name

    if email_new.strip():
        user.Email = email_new
        request.session["user"]["email"] = email_new

    db.commit()
    db.refresh(user)

    return user


def valid(db: Session, item_name: str):
    db_item = db.query(models.Item).filter(models.Item.name == item_name).first()

    if not db_item:
        raise HTTPException(status_code=404, detail=f"Item Not Found")
    return {"message": "kotnol"}


def delete_item(db: Session, item_id: int):
    db_item = get_item(db, item_id)
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item

def check_email_exists(db: Session, email: str):
    return db.query(models.Akun).filter(models.Akun.Email == email).first() is not None

def delete_photo(db: Session, request: Request):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="Not authenticated")

    email = user_session["email"]
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_photo_path = user.ProfilePhoto

    if old_photo_path and os.path.exists(old_photo_path):
        try:
            os.remove(old_photo_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gagal hapus file: {e}")

    user.ProfilePhoto = None
    db.commit()

    return user