from sqlalchemy.orm import Session
from fastapi import HTTPException, Request, UploadFile
import models, schemas, utilities
import os
from datetime import datetime
import shutil

def get_accs(db: Session):
    return db.query(models.Akun).all()

def get_acc(db: Session, akun_id: int):
    return db.query(models.Akun).filter(models.Akun.id == akun_id).first()

def create_akun(db: Session, akun: schemas.Akun_create):
    hash_password = utilities.hash_password(akun.Password);

    current_date = datetime.now()
    joined_str = current_date.strftime("%B %Y")

    user = models.Akun(
        First_name = akun.First_name, 
        Last_name = akun.Last_name, 
        Email = akun.Email, 
        Username=akun.Username, 
        Password = hash_password,
        Joined = joined_str
        )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_acc(request: Request, db: Session, First_name: str, Last_name: str, Username: str):
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


    if Username.strip():
        user.Username = Username

    db.commit()
    db.refresh(user)

    return user

def update_loc(request: Request, db: Session, Location: str):
    user_session = request.session.get("user")
    if not(user_session):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    email = user_session["email"]
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()

    if not(user):
        raise HTTPException(status_code=404, detail="Account Not Found")

    if Location.strip():
        user.Location = Location

    db.commit()
    db.refresh(user)

    return user

def check_email_exists(db: Session, email: str):
    return db.query(models.Akun).filter(models.Akun.Email == email).first() is not None

def check_username(db: Session, username: str):
    return db.query(models.Akun).filter(models.Akun.Username == username).first() is not None

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
            raise HTTPException(status_code=500, detail=f"Delete Failed: {e}")

    user.ProfilePhoto = None
    db.commit()
    db.refresh(user)

    return user

def upload_photo(db: Session, request: Request, file: UploadFile = None):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="Not authenticated")

    email = user_session["email"]
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if file and file.filename.strip():
        upload_dir = "front-end/public/profile"
        shortened_dir = "/profile"
        os.makedirs(upload_dir, exist_ok=True)

        filename = f"{user.id}_{file.filename}"
        file_location = os.path.join(upload_dir, filename)
        file_loc_shortened = os.path.join(shortened_dir, filename)

        with open(file_location, "wb") as f:
            shutil.copyfileobj(file.file, f)

        user.ProfilePhoto = file_loc_shortened
        db.commit()
        db.refresh(user)

    return user

def updatepass(request: Request,db: Session,Old_pass: str,New_pass: str,Confirm_pass: str):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="Not authenticated")

    email = user_session["email"]
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if New_pass.strip() and Confirm_pass.strip() and utilities.verify_password(Old_pass, user.Password):
        if New_pass != Confirm_pass:
                raise HTTPException(status_code=400, detail="Passwords do not match")
        hash_password = utilities.hash_password(New_pass)
        user.Password = hash_password
    else:
        raise HTTPException(status_code=401, detail="Password incorrect") 
    
    db.commit()
    db.refresh(user)

    return user
