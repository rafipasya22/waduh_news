from datetime import datetime
from typing import List
from fastapi import HTTPException
from pydantic import BaseModel, Field

class BookmarkRequest(BaseModel):
    Title: str

class ItemBase(BaseModel):
    name: str
    description: str | None = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    pass

class ItemValidation(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int

    class Config:
        orm_mode = True

class AkunBase(BaseModel):
    First_name: str
    Last_name: str
    Email: str
    Username: str
    Password: str
    Confirm_Password: str
    Joined: str = Field(default_factory=lambda: datetime.now().strftime("%B %Y"))
    Location: str = "Unknown"
    Liked: int = 0
    Bookmarked: int = 0
    ProfilePhoto: str = ""

class Akun_create(AkunBase):
    pass

    def validate_password_match(self):
            if self.Password != self.Confirm_Password:
                raise HTTPException(status_code=400, detail="Passwords do not match")
            return self

class Akun_Update(AkunBase):
    pass

class AkunResponse(AkunBase):
    id: int

    class Config:
        orm_mode = True


class UserPreferenceRequest(BaseModel):
    topics: List[str]