from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException
from pydantic import BaseModel, Field

class CommentLikeResponse(BaseModel):
    post_title: str
    comment: str
    commented_by: str

class CommentDislikeResponse(BaseModel):
    post_title: str
    comment: str
    commented_by: str

class CommentResponse(BaseModel):
    post_title: str
    post_category: str
    post_source: str
    post_comments: str

class GetCommentResponse(BaseModel):
    post_title: str

class DeleteCommentResponse(BaseModel):
    post_title: str
    post_comments: str
    
class DislikeResponse(BaseModel):
    post_title: str
    post_category: str
    post_source: str

class CheckDislikeResponse(BaseModel):
    post_title: str

class LikeResponse(BaseModel):
    post_title: str
    post_category: str
    post_source: str

class CheckLikeResponse(BaseModel):
    post_title: str

class BookmarkRequest(BaseModel):
    Title: str
    Author: Optional[str] = None 
    Category: str
    Published_at: str
    Image_url: str
    Content: str
    Source_url: str
    Source_name: str

class DeleteBookmarkRequest(BaseModel):
    Title: str

class DeleteUserPostRequest(BaseModel):
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


class ArticleResponse(BaseModel):
    Title: str
    Author: str
    Category: str
    Published_at: str
    Image_url: str
    Content: str
    Source_url: Optional[str] = None 
    Source_name: Optional[str] = None 

class UserPreferenceRequest(BaseModel):
    topics: List[str]

class BookmarkBatchRequest(BaseModel):
    Titles: List[str]

class LikeBatchRequest(BaseModel):
    post_titles: List[str]

