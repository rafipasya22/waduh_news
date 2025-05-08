from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base

user_preferences = Table(
    "user_preferences",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("Akun.id")),
    Column("topic_id", Integer, ForeignKey("Topics.id"))
)

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)

class Akun(Base):
    __tablename__= "Akun"

    id = Column(Integer, primary_key = True, index = True)
    First_name = Column(String(255), nullable=False)
    Last_name = Column(String(255), nullable=False)
    Email = Column(String(255), nullable=False)
    Username = Column(String(255), nullable=False)
    Password = Column(String(255), nullable=False)
    Joined = Column(String(255), nullable=True)
    Location = Column(Text, nullable=True)
    Liked = Column(Integer, nullable=True)
    Bookmarked = Column(Integer, nullable=True)
    ProfilePhoto = Column(Text, nullable=True)

    topics = relationship("Topics", secondary=user_preferences, back_populates="users")

class Topics(Base):
    __tablename__= "Topics"
    
    id = Column(Integer, primary_key = True, index = True)
    Topic_Name = Column(String(255), nullable=False)

    users = relationship("Akun", secondary=user_preferences, back_populates="topics")

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    Bookmarked_by = Column(String(100))
    Title = Column(String(255))
    Created_at = Column(String(255), nullable=True)