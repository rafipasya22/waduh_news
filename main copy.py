from fastapi import FastAPI, Depends, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import models, schemas, crud
from database import engine, Base, get_db
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI()

Base.metadata.create_all(bind=engine)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

class UserSignup(BaseModel):
    First_name: str
    Last_name: str
    Email: str
    Password: str
    Confirm_Password: str
    
    def validate_password_match(self):
        if self.Password != self.Confirm_Password:
            raise HTTPException(status_code=400, detail="Passwords do not match")
        return self

@app.get("/")
def home(request: Request, db: Session = Depends(get_db)):
    items = crud.get_items(db)
    accounts = crud.get_accs(db)
    return templates.TemplateResponse("index.html", {"request": request, "items": items, "accounts": accounts})

@app.get("/login", response_class=HTMLResponse)
async def login(request: Request):
    return templates.TemplateResponse("Login_Signup/Login.html", {"request": request})

@app.post("/signup")
def signup(user: UserSignup, db: Session = Depends(get_db)):
    user.validate_password_match()

    new_user = crud.create_akun(db, user)
    return {"message": "User created successfully", "user_id": new_user.id}


@app.get("/items", response_model=list[schemas.ItemResponse])
def get_items(db: Session = Depends(get_db)):
    return crud.get_items(db)

@app.post("/items", response_model=schemas.ItemResponse)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    return crud.create_item(db, item)

@app.put("/items/{item_id}")
def update_item(item_id: int, item: schemas.ItemUpdate, db: Session = Depends(get_db)):
    updated_item = crud.update_item(db, item, item_id)
    if updated_item is None: 
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item updated successfully"}

@app.get("/search")
def search_item(name: str, db: Session = Depends(get_db)):
    crud.valid(db, name)

@app.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    deleted_item = crud.delete_item(db, item_id)
    if deleted_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

@app.get("/akun", response_model=list[schemas.AkunResponse])
def get_accs(db: Session = Depends(get_db)):
    return crud.get_accs(db)

@app.post("/akun", response_model=schemas.AkunResponse)
def buat_akun(akun: schemas.Akun_create, db: Session = Depends(get_db)):
    return crud.create_akun(db, akun)

@app.put("/akun/{akun_id}")
def update_akun(akun_id: int, akun: schemas.Akun_Update, db: Session = Depends(get_db)):
    updated_akun = crud.update_acc(db, akun, akun_id)
    if updated_akun is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account updated successfully"}
