import asyncio
from math import ceil
import random
from fastapi import FastAPI, Depends, Form, HTTPException, Query, Request, UploadFile, File, requests
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy import delete, desc, func
from sqlalchemy.orm import Session
from datetime import datetime
import urllib
import models, schemas, crud, utilities
from database import engine, Base, get_db
import httpx
from dotenv import load_dotenv
from starlette.middleware.sessions import SessionMiddleware
import os
from fastapi import FastAPI
from newsapi import NewsApiClient
from newspaper import Article
import urllib.parse
from dateutil.parser import parse as parse_date
from datetime import datetime
from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import string
from sqlalchemy.orm import joinedload
import spacy
from collections import Counter

        
load_dotenv()

app = FastAPI()
nlp = spacy.load("en_core_web_sm") 

nltk.download('punkt_tab')
nltk.download("stopwords")

app.add_middleware(SessionMiddleware, secret_key= os.getenv("SESSION_MIDDLEWARE_CLIENT_SECRET"))

Base.metadata.create_all(bind=engine)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

newsapi = NewsApiClient(api_key= os.getenv("NEWS_API_CLIENT_KEY"))
newsapi_client_key = os.getenv("NEWS_API_CLIENT_KEY")

def parse_date(date_str):
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return dt.replace(tzinfo=None)  
    except Exception:
        raise ValueError(f"Invalid published date format: {date_str}")

def get_reco(titles: list[str], quan: int = 5) -> list[str]:
    queries = []

    for title in titles:
        if not title:
            continue
        doc = nlp(title)
        queries += [
            ent.text.strip() for ent in doc.ents
            if ent.label_ in ["PERSON", "ORG", "GPE", "EVENT"]
        ]

    counter = Counter(queries)
    top_entities = [e for e, _ in counter.most_common(quan)]
    return top_entities

@app.get("/auth/google")
def login_with_google():
    return RedirectResponse(
        url=f"https://accounts.google.com/o/oauth2/v2/auth"
            f"?client_id={GOOGLE_CLIENT_ID}"
            f"&response_type=code"
            f"&redirect_uri={GOOGLE_REDIRECT_URI}"
            f"&scope=openid%20email%20profile"
            
    )

@app.get("/auth/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not found")

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": GOOGLE_REDIRECT_URI

    }

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(token_url, data=data)
        token_data = token_resp.json()

    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Failed to obtain access token")

    async with httpx.AsyncClient() as client:
        user_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info = user_resp.json()

    email = user_info.get("email")
    given_name = user_info.get("given_name")
    family_name = user_info.get("family_name")

    existing_user = crud.check_email_exists(db, email)

    if existing_user:
        request.session["user"] = {
            "first_name": given_name,
            "last_name": family_name,
            "email": email
        }
        return RedirectResponse(url="http://localhost:5173/", status_code=303)
    else:
        token = utilities.encrypt_user_data({
        "first_name": given_name,
        "last_name": family_name,
        "email": email
        })
        redirect_url = f"http://localhost:5173/auth?token={token}"
        return RedirectResponse(url=redirect_url)

@app.get("/api/user")
def get_user_info(request: Request, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        return {"logged_in": False}

    email = user_session.get("email")
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()
    
    return {
        "logged_in": True,
        "user": user
    }


@app.get("/index/profile")
async def home(request: Request, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        return RedirectResponse(url="/login", status_code=303)
    
    email = user_session.get("email")
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()
    
    if user:
        return RedirectResponse(url=f"/index/profile/{user.Username}", status_code=303)
    
    return RedirectResponse(url="/login", status_code=303)


@app.get("/api/auth")
async def auth(token: str = Query(None)):
    if token:
        try:
            user_data = utilities.decrypt_user_data(token)
            return {"status": "ok", "prefill": user_data}
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid or expired token")
    else:
        return {"status": "no_token"}

@app.post("/api/login")
def login(
    request: Request,
    db: Session = Depends(get_db),
    Email: str = Form(...),
    Password: str = Form(...)
):
    user = db.query(models.Akun).filter(models.Akun.Email == Email).first()
    if not user or not utilities.verify_password(Password, user.Password):
        raise HTTPException(status_code=401, detail="Email or password incorrect")
    
    request.session["user"] = {
        "first_name": user.First_name,
        "last_name": user.Last_name,
        "email": user.Email
    }

    return {"message": "Login successful"}

@app.post("/api/signup")
def signup(
    First_name: str = Form(...),
    Last_name: str = Form(...),
    Email: str = Form(...),
    Username: str = Form(...),
    Password: str = Form(...),
    Confirm_Password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = schemas.Akun_create(
        First_name=First_name,
        Last_name=Last_name,
        Email=Email,
        Username=Username,
        Password=Password,
        Confirm_Password=Confirm_Password,
    )

    user.validate_password_match()

    if crud.check_email_exists(db, user.Email):
        raise HTTPException(status_code=400, detail="Email Already Exist!")
    if crud.check_username(db, user.Username):
        raise HTTPException(status_code=400, detail="Username Already Exist!")

    new_user = crud.create_akun(db, user)
    return {"message": "User created successfully", "user_id": new_user.id}


@app.get("/api/session")
def get_session(request: Request):
    user = request.session.get("user")
    if not user:
        return {"logged_in": False}
    return {"logged_in": True, "user": user}

@app.get("/api/logout")
async def logout(request: Request):
    utilities.logout(request)
    return {"message": "Logged out successfully"}

@app.post("/api/edit")
def upload_profile_picture(
    request: Request,
    db: Session = Depends(get_db),
    Location: str = Form(...),
    file: UploadFile = File(default=None),
):
    crud.upload_photo(db, request, file)
    crud.update_loc(request, db, Location)
    return JSONResponse(content={"message": "Profile updated successfully"})


@app.post("/api/delete-photo")
def delete_profile_picture(
    request: Request,
    db: Session = Depends(get_db),
):
    crud.delete_photo(db, request)
    return JSONResponse(content={"message": "Profile updated successfully"})

@app.post("/api/edit/personal-info")
def update_akun(
    request: Request,
    First_name: str = Form(...),
    Last_name: str = Form(...),
    Username: str = Form(...),
    db: Session = Depends(get_db)
    ): 
    crud.update_acc(request, db, First_name, Last_name, Username)
    return JSONResponse(content={"message": "Profile updated successfully"})

@app.post("/api/edit/password")
def editpass(
    request: Request,
    db: Session = Depends(get_db),
    Old_pass: str = Form(...),
    New_pass: str = Form(...),
    Confirm_pass: str = Form(...)
):
    crud.updatepass(request, db, Old_pass, New_pass, Confirm_pass)
    utilities.logout(request)
    return JSONResponse(content={"message": "Profile updated successfully"})

    

@app.post("/api/save-preferences")
async def save_preferences(
    request: Request,
    body: schemas.UserPreferenceRequest,
    db: Session = Depends(get_db)
):
    user_session = request.session.get("user") 
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")
    
    email = user_session["email"]
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()
    
    if not user:
        return {"error": "User not found"}

    topics = db.query(models.Topics).filter(models.Topics.Topic_Name.in_(body.topics)).all()
    user.topics = topics  
    db.commit()
    return {"status": "success", "selected": body.topics}

@app.get("/api/user-preferences")
async def get_user_preferences(request: Request, db: Session = Depends(get_db)):
    user_session = request.session.get("user")  
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")
    
    email = user_session["email"]
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()
    if not user:
        return {"error": "User not found"}

    preferred_topics = [topics.Topic_Name for topics in user.topics]
    
    return {"preferred_topics": preferred_topics}

@app.delete("/api/remove-preference/{topic_name}")
async def remove_preference(topic_name: str, request: Request, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session["email"]
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    topic = db.query(models.Topics).filter(models.Topics.Topic_Name == topic_name).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    stmt = delete(models.user_preferences).where(
        models.user_preferences.c.user_id == user.id,
        models.user_preferences.c.topic_id == topic.id
    )

    db.execute(stmt)
    db.commit()

    return {"status": "removed", "topic": topic_name}


#fetch news
async def ambil_headline(category:str = 'general'):
    try:
        response = newsapi.get_top_headlines(category=category)
    except Exception as e:
        return {"error": f"Error fetching news: {str(e)}"}

    if response['status'] != 'ok':
        return {"error": "Failed to fetch news"}

    news_list = []
    for article in response.get('articles', []):
        if article.get("urlToImage") and article.get("content"):
            news_item = {
                "title": article.get("title"),
                "publishedAt": article.get("publishedAt"),
                "author": article.get("author"),
                "imageUrl": article.get("urlToImage"),
                "content": article.get("content"),
                "url": article.get("url"),
                "category": category  
            }
            news_list.append(news_item)

    return {"news": news_list}

async def ambil_popular(category: str = 'general'):
    try:
        response = newsapi.get_everything(q="category", sort_by="popularity")
    except Exception as e:
        return {"error": f"Error fetching news: {str(e)}"}

    if response['status'] != 'ok':
        return {"error": "Failed to fetch news"}

    news_list = []
    for article in response.get('articles', []):
        if article.get("urlToImage") and article.get("content"):
            news_item = {
                "title": article.get("title"),
                "publishedAt": article.get("publishedAt"),
                "author": article.get("author"),
                "imageUrl": article.get("urlToImage"),
                "content": article.get("content"),
                "url": article.get("url"),
                "category": category 
            }
            news_list.append(news_item)

    return {"news": news_list}

async def ambilnews_sports(category: str = "sports"):
    try:
        response = newsapi.get_top_headlines(category="sports")
    except Exception as e:
        return {"error": f"Error fetching news: {str(e)}"}

    if response['status'] != 'ok':
        return {"error": "Failed to fetch news"}

    news_list = []
    for article in response.get('articles', []):
        if article.get("urlToImage") and article.get("content"):
            news_item = {
                "title": article.get("title"),
                "publishedAt": article.get("publishedAt"),
                "author": article.get("author"),
                "imageUrl": article.get("urlToImage"),
                "content": article.get("content"),
                "category": category,
                "url": article.get("url") 
            }
            news_list.append(news_item)

    return {"news": news_list}

async def ambil_reco_actv(bookmarks, likes):
    texts = []

    for b in bookmarks:
        if b.title:
            texts.append(b.title)
        if b.content:
            texts.append(b.content)

    for l in likes:
        if l.post_title:
            texts.append(l.post_title)

    if not texts:
        return {"query": "", "message": "No news articles found for extracted topics."}
    q_list = get_reco(texts)

    news_list = []

    for que in q_list:
        try:
            response = newsapi.get_everything(q = que, page_size=10)
        except Exception as e:
            continue

        if response['status'] != 'ok':
            return {"error": "Failed to fetch news"}

        for article in response.get('articles', []):
            if article.get("urlToImage") and article.get("content"):
                news_item = {
                    "title": article.get("title"),
                    "publishedAt": article.get("publishedAt"),
                    "author": article.get("author"),
                    "imageUrl": article.get("urlToImage"),
                    "content": article.get("content"),
                    "url": article.get("url"),
                    "category": "general"  
                }
                news_list.append(news_item)
        
        if not news_list:
            return {"news": [], "message": "No news articles found for extracted topics."}

    random.shuffle(news_list)
    return {"news": news_list}

async def ambil_reco(getPref):
    catList = [cat[0] for cat in getPref]

    news_list = []

    for cat in catList:
        cat = cat.lower()
        print(cat)
        try:
            response = newsapi.get_top_headlines(category = cat)
        except Exception as e:
            return {"error": f"Error fetching news: {str(e)}"}

        if response['status'] != 'ok':
            return {"error": "Failed to fetch news"}

        for article in response.get('articles', []):
            if article.get("urlToImage") and article.get("content"):
                news_item = {
                    "title": article.get("title"),
                    "publishedAt": article.get("publishedAt"),
                    "author": article.get("author"),
                    "imageUrl": article.get("urlToImage"),
                    "content": article.get("content"),
                    "url": article.get("url"),
                    "category": cat  
                }
                news_list.append(news_item)

    random.shuffle(news_list)
    return {"news": news_list}

async def ambilnews_category(cat):
    try:
        response = newsapi.get_top_headlines(category = cat)
    except Exception as e:
        return {"error": f"Error fetching news: {str(e)}"}

    if response['status'] != 'ok':
        return {"error": "Failed to fetch news"}

    news_list = []
    for article in response.get('articles', []):
        if article.get("urlToImage") and article.get("content"):
            news_item = {
                "title": article.get("title"),
                "publishedAt": article.get("publishedAt"),
                "author": article.get("author"),
                "imageUrl": article.get("urlToImage"),
                "content": article.get("content"),
                "url": article.get("url"),
                "category": cat  
            }
            news_list.append(news_item)

    return {"news": news_list}

async def ambilnews_newest(cat, page, page_size):
    try:
        response = newsapi.get_top_headlines(category=cat)
    except Exception as e:
        return {"error": f"Error fetching news: {str(e)}"}

    if response['status'] != 'ok':
        return {"error": "Failed to fetch news"}

    news_list = []
    for article in response.get('articles', []):
        if article.get("urlToImage") and article.get("content") and article.get("publishedAt"):
            try:
                published_date = datetime.strptime(article["publishedAt"], "%Y-%m-%dT%H:%M:%SZ")
            except ValueError:
                continue

            news_list.append({
                "title": article.get("title"),
                "publishedAt": article.get("publishedAt"),
                "publishedAt_dt": published_date,
                "author": article.get("author"),
                "source_name": article.get("source", {}).get("name"),
                "imageUrl": article.get("urlToImage"),
                "content": article.get("content"),
                "url": article.get("url"),
                "category": cat
            })

    news_list.sort(key=lambda x: x["publishedAt_dt"], reverse=True)

    start = (page - 1) * page_size
    end = start + page_size
    paginated = news_list[start:end]

    for item in paginated:
        del item["publishedAt_dt"]

    return {
        "page": page,
        "page_size": page_size,
        "total_items": len(news_list),
        "total_pages": (len(news_list) + page_size - 1) // page_size,
        "news": paginated
    }

async def emptylist():
    news_list = []
    return {"news": news_list}

@app.get("/api/homepage_news")
async def ambilhomepagenews(request: Request, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        news_headline, news_popular, news_sports, reco_actv, news_reco = await asyncio.gather(
            ambil_headline(),
            ambil_popular(),
            ambilnews_sports(),
            emptylist(),
            emptylist()
        )

        return {
                "headlineNews": news_headline,
                "popularNews": news_popular,
                "sportsNews": news_sports,
                "newsRecoActv": reco_actv,
                "newsReco": news_reco
            }

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}
    bookmarks = db.query(models.Bookmark).filter(models.Bookmark.Bookmarked_by == email).limit(20).all()
    likes = db.query(models.Likes).filter(models.Likes.liked_by == email).limit(20).all()
    getPref = db.query(models.Topics.Topic_Name).join(models.user_preferences, models.Topics.id == models.user_preferences.c.topic_id).join(models.Akun, models.Akun.id == models.user_preferences.c.user_id).filter(models.Akun.Email == email).all()

    news_headline, news_popular, news_sports, reco_actv, news_reco = await asyncio.gather(
        ambil_headline(),
        ambil_popular(),
        ambilnews_sports(),
        ambil_reco_actv(bookmarks, likes),
        ambil_reco(getPref)
    )

    return {
            "headlineNews": news_headline,
            "popularNews": news_popular,
            "sportsNews": news_sports,
            "newsRecoActv": reco_actv,
            "newsReco": news_reco
        }

@app.get("/api/catpage/{cat}")
async def ambilcatpagenews(cat:str, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=50)):
    cat_headline, cat_news = await asyncio.gather(
        ambilnews_category(cat),
        ambilnews_newest(cat, page, page_size)
    )
    cat_news_all = cat_news.get("news", [])

    newest_page_size = 5
    newest_start = (page - 1) * newest_page_size
    newest_end = newest_start + newest_page_size
    newest_paginated = cat_news_all[newest_start:newest_end]

    cat_newest = {
        "news": newest_paginated,
        "page": page,
        "page_size": newest_page_size,
        "total_items": len(cat_news_all),
        "total_pages": (len(cat_news_all) + newest_page_size - 1) // newest_page_size,
    }

    mv_page_size = 10
    mv_start = (page - 1) * mv_page_size
    mv_end = mv_start + mv_page_size
    mv_paginated = cat_news_all[mv_start:mv_end]

    cat_mostviewed = {
        "news": mv_paginated,
        "page": page,
        "page_size": mv_page_size,
        "total_items": len(cat_news_all),
        "total_pages": (len(cat_news_all) + mv_page_size - 1) // mv_page_size,
    }

    return {
            "catHeadline": cat_headline,
            "catNewest": cat_newest,
            "catMostViewed": cat_mostviewed
        }

@app.get("/api/ambil_nxtnews/{cat}")
async def ambilnews(cat: str):
    try:
        response = newsapi.get_top_headlines(category = cat)
    except Exception as e:
        return {"error": f"Error fetching news: {str(e)}"}

    if response['status'] != 'ok':
        return {"error": "Failed to fetch news"}

    news_list = []
    for article in response.get('articles', []):
        if article.get("urlToImage") and article.get("content"):
            news_item = {
                "title": article.get("title"),
                "publishedAt": article.get("publishedAt"),
                "author": article.get("author"),
                "imageUrl": article.get("urlToImage"),
                "content": article.get("content"),
                "url": article.get("url"),
                "category": cat  
            }
            news_list.append(news_item)

    return {"news": news_list}

@app.get("/api/ambil-news2/{query}/{title}", response_class=JSONResponse)
async def baca_news(request: Request, query: str, title: str, db: Session = Depends(get_db)):
    decoded_query = urllib.parse.unquote(query)
    decoded_title = urllib.parse.unquote(title)

    try:
        response = newsapi.get_everything(
            qintitle=decoded_title,
            language="en",
            sort_by="publishedAt",
            page_size=10
        )
    except Exception as e:
        print("Fetching news failed:", e)
        raise HTTPException(status_code=503, detail=str(e))

    user_session = request.session.get("user")
    if not user_session:
        return JSONResponse(status_code=401, content={"error": "User not logged in"})

    email = user_session.get("email")
    news_list = []

    for article in response.get("articles", []):
        if not article.get("title") or not article.get("url") or not article.get("content") or not article.get("urlToImage"):
            print("Skipping article with missing data:", article.get("title"))
            continue

        try:
            article_url = article["url"]
            article_title = article["title"]
            image_url = article["urlToImage"].strip()

            news_article = Article(article_url)
            news_article.download()
            news_article.parse()
            full_text = news_article.text or article.get("content") or article.get("description") or article.get("title")

            date = article["publishedAt"]
            date_format = datetime.fromisoformat(date.replace("Z", "+00:00")).replace(tzinfo=None)
            article_date = date_format.strftime("%d %B %Y")

        except Exception as e:
            print(f"Failed Parsing Article: {e}")
            full_text = article.get("content") or "Unable to load content"
            article_date = article.get("publishedAt", "")

        news_item = {
            "title": article_title,
            "author": article.get("author"),
            "category": decoded_query,
            "published_at": article_date,
            "image_url": image_url,
            "content": full_text,
            "source_url": article_url,
            "source_name": article.get("source", {}).get("name", ""),
            "Bookmarked_by": email  
        }

        news_list.append(news_item)

    return JSONResponse(content={"news": news_list})

@app.get("/api/ambil-news2/headline/{query}/{title}", response_class=JSONResponse)
async def baca_news(request: Request, query: str, title: str, db: Session = Depends(get_db)):
    decoded_query = urllib.parse.unquote(query)
    decoded_title = urllib.parse.unquote(title)

    try:
        response = newsapi.get_top_headlines(
            q=decoded_title,
            category = decoded_query
        )
    except Exception as e:
        print("Fetching news failed:", e)
        raise HTTPException(status_code=503, detail=str(e))

    user_session = request.session.get("user")
    if not user_session:
        return JSONResponse(status_code=401, content={"error": "User not logged in"})

    email = user_session.get("email")
    news_list = []

    for article in response.get("articles", []):
        if not article.get("title") or not article.get("url") or not article.get("content") or not article.get("urlToImage"):
            print("Skipping article with missing data:", article.get("title"))
            continue

        try:
            article_url = article["url"]
            article_title = article["title"]
            image_url = article["urlToImage"].strip()

            news_article = Article(article_url)
            news_article.download()
            news_article.parse()
            full_text = news_article.text or article.get("content") or article.get("description") or article.get("title")

            date = article["publishedAt"]
            date_format = datetime.fromisoformat(date.replace("Z", "+00:00")).replace(tzinfo=None)
            article_date = date_format.strftime("%d %B %Y")

        except Exception as e:
            print(f"Failed Parsing Article: {e}")
            full_text = article.get("content") or "Unable to load content"
            article_date = article.get("publishedAt", "")

        news_item = {
            "title": article_title,
            "author": article.get("author"),
            "category": decoded_query,
            "published_at": article_date,
            "image_url": image_url,
            "content": full_text,
            "source_url": article_url,
            "source_name": article.get("source", {}).get("name", ""),
            "Bookmarked_by": email 
        }


        news_list.append(news_item)
        print(news_list)

    return JSONResponse(content={"news": news_list})

@app.get("/api/baca-news/{query}/{title}", response_class=HTMLResponse)
async def baca_news(query: str, title: str):
    
    decoded_query = urllib.parse.unquote(query)
    decoded_title = urllib.parse.unquote(title)
    print("Menerima permintaan:", decoded_query, decoded_title)


    try:
        response = newsapi.get_everything(
            qintitle=decoded_title,
            language="en",
            sort_by="publishedAt",
            page_size=10
        )
    except Exception as e:
        print("Fetching news failed:", e)
        raise HTTPException(status_code=503, detail=str(e))

    articles = response.get("articles", [])
    news_list = []

    for article in articles:
        raw_image_url = article.get("urlToImage")
        image_url = raw_image_url.strip() if raw_image_url else ""
        if not image_url:
            continue

        url = article.get("url")
        title = article.get("title")
        article_date = "Unknown"  

        try:
            url = article["url"]
            title = article["title"]
            image_url = article["urlToImage"].strip()

            news_article = Article(url)
            news_article.download()
            news_article.parse()
            full_text = (
                news_article.text
                or article.get("content")
                or article.get("description")
                or article.get("title")
            )

            date = article["publishedAt"]
            date_format = datetime.fromisoformat(date.replace("Z", "+00:00")).replace(tzinfo=None)
            article_date = date_format.strftime("%d %B %Y")

        except Exception as e:
            print(f"Failed Parsing Article: {e}")
            full_text = article.get("content") or "Unable to load content"

        news_item = {
            "title": title,
            "author": article.get("author"),
            "category": decoded_query,
            "published_at": article_date,
            "image_url": image_url,
            "content": full_text,
            "source_url": url,
            "source_name": article.get('source', {}).get('name', '')
        }
        news_list.append(news_item)

    return JSONResponse(content={"news": news_list})
        
@app.get("/api/baca-news/headline/{query}/{title}", response_class=HTMLResponse)
async def baca_news(request: Request, query: str, title: str, db: Session = Depends(get_db)):
    decoded_query = urllib.parse.unquote(query)
    decoded_title = urllib.parse.unquote(title)

    try:
        response = newsapi.get_top_headlines(
            category=decoded_query,
            q=decoded_title
        )
    except Exception as e:
        print("Fetching news failed:", e)
        raise HTTPException(status_code=404, detail="Topic not found")

    articles = response.get("articles", [])
    news_list = []

    for article in articles:
        if not all([
            article.get("urlToImage"),
            article.get("url"),
            article.get("title"),
            article.get("publishedAt"),
            article.get("content") or article.get("description") or article.get("title")
        ]):
            continue

        try:
            url = article["url"]
            title = article["title"]
            image_url = article["urlToImage"].strip()

            news_article = Article(url)
            news_article.download()
            news_article.parse()
            full_text = news_article.text or article.get("content") or article.get("description") or article.get("title")

            date = article["publishedAt"]
            date_format = datetime.fromisoformat(date.replace("Z", "+00:00")).replace(tzinfo=None)
            article_date = date_format.strftime("%d %B %Y")

            author = article.get("author") or "Unknown"
            source_name = article.get("source", {}).get("name") or "Unknown"
        except Exception as e:
            print(f"Failed Parsing Article: {e}")
            continue  

        news_item = {
            "title": title,
            "author": article.get("author"),
            "category": decoded_query,
            "published_at": article_date,
            "image_url": image_url,
            "content": full_text,
            "source_url": url,
            "source_name": article.get('source', {}).get('name', '')
        }
        news_list.append(news_item)

    return JSONResponse(content={"news": news_list})

@app.get("/api/news/category/{cat}")
async def ambilnews(cat: str):
    try:
        response = newsapi.get_top_headlines(category = cat)
    except Exception as e:
        return {"error": f"Error fetching news: {str(e)}"}

    if response['status'] != 'ok':
        return {"error": "Failed to fetch news"}

    news_list = []
    for article in response.get('articles', []):
        if article.get("urlToImage") and article.get("content"):
            news_item = {
                "title": article.get("title"),
                "publishedAt": article.get("publishedAt"),
                "author": article.get("author"),
                "imageUrl": article.get("urlToImage"),
                "content": article.get("content"),
                "url": article.get("url"),
                "category": cat  
            }
            news_list.append(news_item)

    return {"news": news_list}

@app.get("/api/news/category/newest/{cat}")
async def ambilnews(cat: str, page: int = Query(1, ge=1), page_size: int = Query(5, ge=1, le=50)):
    try:
        response = newsapi.get_top_headlines(category=cat)
    except Exception as e:
        return {"error": f"Error fetching news: {str(e)}"}

    if response['status'] != 'ok':
        return {"error": "Failed to fetch news"}

    news_list = []
    for article in response.get('articles', []):
        if article.get("urlToImage") and article.get("content") and article.get("publishedAt"):
            try:
                published_date = datetime.strptime(article["publishedAt"], "%Y-%m-%dT%H:%M:%SZ")
            except ValueError:
                continue

            news_list.append({
                "title": article.get("title"),
                "publishedAt": article.get("publishedAt"),
                "publishedAt_dt": published_date,
                "author": article.get("author"),
                "source_name": article.get("source", {}).get("name"),
                "imageUrl": article.get("urlToImage"),
                "content": article.get("content"),
                "url": article.get("url"),
                "category": cat
            })

    news_list.sort(key=lambda x: x["publishedAt_dt"], reverse=True)

    start = (page - 1) * page_size
    end = start + page_size
    paginated = news_list[start:end]

    for item in paginated:
        del item["publishedAt_dt"]

    return {
        "page": page,
        "page_size": page_size,
        "total_items": len(news_list),
        "total_pages": (len(news_list) + page_size - 1) // page_size,
        "news": paginated
    }

@app.get("/api/news/search/{query}")
async def ambilnews(query: str, page: int = Query(1, ge=1), page_size: int = Query(5, ge=1, le=50), cat = "general"):
    try:
        url = f"https://newsapi.org/v2/top-headlines?q={query}&apiKey={newsapi_client_key}"
        async with httpx.AsyncClient() as client:
            data = await client.get(url)
            response = data.json()
        
    except Exception as e:
        return {"error": f"Error fetching news: {str(e)}"}

    if response['status'] != 'ok':
        return {"error": "Failed to fetch news"}

    news_list = []

    for article in response.get('articles', []):
        try:
            published_date = parse_date(article["publishedAt"])
        except ValueError:
            print(f"Skipping article with invalid date: {article}")
            continue

        if not article.get("title") or not article.get("url"):
            print(f"Skipping article due to missing title or url: {article}")
            continue
        if not article.get("content"):
            print(f"Skipping article due to missing content: {article}")
            continue

        if not article.get("urlToImage"):
            print(f"Skipping article due to missing news image: {article}")
            continue
        

        news_list.append({
            "title": article.get("title"),
            "publishedAt": article.get("publishedAt"),
            "publishedAt_dt": published_date,
            "author": article.get("author"),
            "source_name": article.get("source", {}).get("name"),
            "imageUrl": article.get("urlToImage"),
            "content": article.get("content"),
            "url": article.get("url"),
            "category": cat
        })

    print("News List Length:", len(news_list))

    news_list.sort(key=lambda x: x["publishedAt_dt"], reverse=True)

    start = (page - 1) * page_size
    end = start + page_size
    paginated = news_list[start:end]

    for item in paginated:
        del item["publishedAt_dt"]

    return {
        "page": page,
        "page_size": page_size,
        "total_items": len(news_list),
        "total_pages": (len(news_list) + page_size - 1) // page_size,
        "news": paginated
    }

@app.get("/api/news/search/{query}/{cat}")
async def ambilnews(query: str, cat: str = "general", page: int = Query(1, ge=1), page_size: int = Query(5, ge=1, le=50)):
    try:
        url = f"https://newsapi.org/v2/top-headlines?q={query}&category={cat}&apiKey={newsapi_client_key}"
        async with httpx.AsyncClient() as client:
            data = await client.get(url)
            response = data.json()
        
    except Exception as e:
        return {"error": f"Error fetching news: {str(e)}"}

    if response['status'] != 'ok':
        return {"error": "Failed to fetch news"}

    news_list = []

    for article in response.get('articles', []):
        try:
            published_date = parse_date(article["publishedAt"])
        except ValueError:
            print(f"Skipping article with invalid date: {article}")
            continue

        if not article.get("title") or not article.get("url"):
            print(f"Skipping article due to missing title or url: {article}")
            continue
        
        if not article.get("content"):
            print(f"Skipping Article Cause content does not exist")
            continue
        if not article.get("urlToImage"):
            print(f"Skipping article due to missing news image: {article}")
            continue

        news_list.append({
            "title": article.get("title"),
            "publishedAt": article.get("publishedAt"),
            "publishedAt_dt": published_date,
            "author": article.get("author"),
            "source_name": article.get("source", {}).get("name"),
            "imageUrl": article.get("urlToImage"),
            "content": article.get("content"),
            "url": article.get("url"),
            "category": cat
        })

    print("News List Length:", len(news_list))

    news_list.sort(key=lambda x: x["publishedAt_dt"], reverse=True)

    start = (page - 1) * page_size
    end = start + page_size
    paginated = news_list[start:end]

    for item in paginated:
        del item["publishedAt_dt"]

    return {
        "page": page,
        "page_size": page_size,
        "total_items": len(news_list),
        "total_pages": (len(news_list) + page_size - 1) // page_size,
        "news": paginated
    }

@app.get("/api/news/advsearch/{query}/{cat}")
async def ambilnews(
    query: str,
    from_date: str,
    to_date: str,
    cat: str = "general",
    page: int = Query(1, ge=1),
    page_size: int = Query(5, ge=1, le=50)
):
    try:
        url = f"https://newsapi.org/v2/top-headlines?q={query}&category={cat}&apiKey={newsapi_client_key}"
        async with httpx.AsyncClient() as client:
            data = await client.get(url)
            response = data.json()
    except Exception as e:
        return {"error": f"Error fetching news: {str(e)}"}

    if response['status'] != 'ok':
        return {"error": "Failed to fetch news"}

    news_list = []
    for article in response.get('articles', []):
        try:
            published_date = parse_date(article["publishedAt"])
        except ValueError:
            continue

        if not article.get("title") or not article.get("url"):
            continue
        if not article.get("content"):
            print(f"Skipping Article Cause content does not exist")
            continue
        if not article.get("urlToImage"):
            print(f"Skipping article due to missing news image: {article}")
            continue

        try:
            from_dt = parse_date(from_date) if from_date else None
            to_dt = parse_date(to_date) if to_date else None
        except ValueError as e:
            return {"error": str(e)}

        if from_dt and published_date < from_dt:
            continue

        if to_dt and published_date > to_dt:
            continue

        news_list.append({
            "title": article.get("title"),
            "publishedAt": article.get("publishedAt"),
            "publishedAt_dt": published_date,
            "author": article.get("author"),
            "source_name": article.get("source", {}).get("name"),
            "imageUrl": article.get("urlToImage"),
            "content": article.get("content"),
            "url": article.get("url"),
            "category": cat
        })

    news_list.sort(key=lambda x: x["publishedAt_dt"], reverse=True)

    start = (page - 1) * page_size
    end = start + page_size
    paginated = news_list[start:end]

    for item in paginated:
        del item["publishedAt_dt"]

    return {
        "page": page,
        "page_size": page_size,
        "total_items": len(news_list),
        "total_pages": (len(news_list) + page_size - 1) // page_size,
        "news": paginated
    }

@app.get("/api/news/advsearch/{query}")
async def ambilnews(query: str, from_date: str, to_date: str, page: int = Query(1, ge=1), page_size: int = Query(5, ge=1, le=50), cat = "general"):
    try:
        url = f"https://newsapi.org/v2/top-headlines?q={query}&apiKey={newsapi_client_key}"
        async with httpx.AsyncClient() as client:
            data = await client.get(url)
            response = data.json()
        
    except Exception as e:
        return {"error": f"Error fetching news: {str(e)}"}

    if response['status'] != 'ok':
        return {"error": "Failed to fetch news"}

    news_list = []

    for article in response.get('articles', []):
        try:
            published_date = parse_date(article["publishedAt"])
        except ValueError:
            print(f"Skipping article with invalid date: {article}")
            continue

        if not article.get("title") or not article.get("url"):
            print(f"Skipping article due to missing title or url: {article}")
            continue
        if not article.get("content"):
            print(f"Skipping Article Cause content does not exist")
            continue
        if not article.get("urlToImage"):
            print(f"Skipping article due to missing news image: {article}")
            continue

        try:
            from_dt = parse_date(from_date) if from_date else None
            to_dt = parse_date(to_date) if to_date else None
        except ValueError as e:
            return {"error": str(e)}

        if from_dt and published_date < from_dt:
            continue

        if to_dt and published_date > to_dt:
            continue

        news_list.append({
            "title": article.get("title"),
            "publishedAt": article.get("publishedAt"),
            "publishedAt_dt": published_date,
            "author": article.get("author"),
            "source_name": article.get("source", {}).get("name"),
            "imageUrl": article.get("urlToImage"),
            "content": article.get("content"),
            "url": article.get("url"),
            "category": cat
        })

    print("News List Length:", len(news_list))

    news_list.sort(key=lambda x: x["publishedAt_dt"], reverse=True)

    start = (page - 1) * page_size
    end = start + page_size
    paginated = news_list[start:end]

    for item in paginated:
        del item["publishedAt_dt"]

    return {
        "page": page,
        "page_size": page_size,
        "total_items": len(news_list),
        "total_pages": (len(news_list) + page_size - 1) // page_size,
        "news": paginated
    }

@app.get("/api/search/baca-news/{query}/{title}", response_class=HTMLResponse)
async def baca_news(request: Request, query: str, title: str, db: Session = Depends(get_db)):
    decoded_query = urllib.parse.unquote(query)
    decoded_title = urllib.parse.unquote(title)

    try:
        url = f"https://newsapi.org/v2/top-headlines?q={decoded_title}&apiKey={newsapi_client_key}"
        async with httpx.AsyncClient() as client:
            data = await client.get(url)
            response = data.json()
    except Exception as e:
        print("Fetching news failed:", e)
        raise HTTPException(status_code=404, detail="Topic not found")

    articles = response.get("articles", [])
    news_list = []

    for article in articles:
        if not all([
            article.get("urlToImage"),
            article.get("url"),
            article.get("title"),
            article.get("publishedAt"),
            article.get("content") or article.get("description") or article.get("title")
        ]):
            continue

        try:
            url = article["url"]
            title = article["title"]
            image_url = article["urlToImage"].strip()

            news_article = Article(url)
            news_article.download()
            news_article.parse()
            full_text = news_article.text or article.get("content") or article.get("description") or article.get("title")

            date = article["publishedAt"]
            date_format = datetime.fromisoformat(date.replace("Z", "+00:00")).replace(tzinfo=None)
            article_date = date_format.strftime("%d %B %Y")

            author = article.get("author") or "Unknown"
            source_name = article.get("source", {}).get("name") or "Unknown"
        except Exception as e:
            print(f"Failed Parsing Article: {e}")
            continue  

        news_item = {
            "title": title,
            "author": article.get("author"),
            "category": decoded_query,
            "published_at": article_date,
            "image_url": image_url,
            "content": full_text,
            "source_url": url,
            "source_name": article.get('source', {}).get('name', '')
        }
        news_list.append(news_item)

    return JSONResponse(content={"news": news_list})

#bookmarks & likes

@app.post("/api/check-bookmarks")
def check_bookmarks(request: Request, data: schemas.BookmarkBatchRequest, db: Session = Depends(get_db)):
    print("test")
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    titles = data.Titles  

    print("Titles dari frontend:", data.Titles)

    bookmarks = db.query(models.Bookmark.title).filter(
        models.Bookmark.Bookmarked_by == email,
        models.Bookmark.title.in_(titles)
    ).all()

    bookmarked_titles = [b.title for b in bookmarks]

    return {"bookmarked": bookmarked_titles}

@app.post("/api/bookmark")
def save_bookmark(request: Request, data: schemas.BookmarkRequest, db=Depends(get_db)):
    print(f"Received data: {data.model_dump()}")
    user_session = request.session.get("user")
    if not user_session:
        return RedirectResponse(url="/auth", status_code=303)

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}

    user = db.query(models.Akun).filter(models.Akun.Email == email).first()
    if not user:
        return {"error": "User not found."}

    bookmark = models.Bookmark(
        Bookmarked_by=email,
        title=data.Title,
        author=data.Author,
        category=data.Category,
        published_at=data.Published_at,
        image_url=data.Image_url,
        content=data.Content,
        source_url=data.Source_url,
        source_name=data.Source_name
    )

    isExist = db.query(models.Bookmark).filter(
    models.Bookmark.Bookmarked_by == email,
    models.Bookmark.title == data.Title
    ).first()

    if isExist:
        return {"error": "Bookmark already exists."}

    db.add(bookmark)
    db.commit()
    return {"message": "Bookmark saved"}

@app.delete("/api/remove-bookmark")
async def remove_bookmark(request: Request, data: schemas.DeleteBookmarkRequest, db=Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}
    bookmark = db.query(models.Bookmark).filter(
        models.Bookmark.Bookmarked_by == email,
        models.Bookmark.title == data.Title
    ).first()

    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(bookmark)
    db.commit()

    return {"status": "Bookmark removed"}

@app.get("/api/user-bookmarks")
async def get_user_bookmarks(
    request: Request,
    page: int = Query(1, gt=0),
    page_size: int = Query(5, gt=0),
    db: Session = Depends(get_db)
):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")
    
    email = user_session["email"]
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()
    
    if not user:
        return {"error": "User not found"}

    total_items = db.query(models.Bookmark).filter(
        models.Bookmark.Bookmarked_by == email
    ).count()
    total_pages = ceil(total_items / page_size)

    bookmark_query = db.query(models.Bookmark).filter(
        models.Bookmark.Bookmarked_by == email
    ).offset((page - 1) * page_size).limit(page_size).all()

    bookmarks = []
    for b in bookmark_query:
        bookmarks.append({
            "title": b.title,
            "author": b.author,
            "category": b.category,
            "publishedAt": b.published_at,  
            "imageUrl": b.image_url,
            "content": b.content,
            "source_url": b.source_url,
            "source_name": b.source_name
        })

    return {
        "bookmarks": bookmarks,
        "total_items": total_items,
        "total_pages": total_pages,
        "current_page": page
    }

@app.get("/api/baca-news/article/bookmarks/{title}")
async def baca_bookmark(request: Request, title:str, db: Session = Depends(get_db)):
        decode_title = urllib.parse.unquote(title)
        print(decode_title)

        user_session = request.session.get("user") 
        if not user_session:
            raise HTTPException(status_code=401, detail="User not logged in")
        
        email = user_session["email"]
        user = db.query(models.Akun).filter(models.Akun.Email == email).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        try:
            bookmark_query = db.query(models.Bookmark).filter(
                models.Bookmark.Bookmarked_by == email,
                models.Bookmark.title == decode_title
            ).first()

            if not bookmark_query:
                raise HTTPException(status_code=404, detail="No complete article found")

            return JSONResponse(content={"news": {
                "title": bookmark_query.title,
                "author": bookmark_query.author,
                "category": bookmark_query.category,
                "published_at": bookmark_query.published_at,
                "image_url": bookmark_query.image_url,
                "content": bookmark_query.content,
                "source_url": bookmark_query.source_url,
                "source_name": bookmark_query.source_name,
            }})

        except Exception as e:
            print(f"Failed Fetching Article {e}")
            raise HTTPException(status_code=404, detail="No complete article found")
        
@app.get("/api/profile/get_total_bookmarks")
async def get_total_profile_bookmarks(request: Request, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}
    
    get_total_bookmarks = db.query(models.Bookmark).filter(
        models.Bookmark.Bookmarked_by == email
    ).count()

    return {"total_bookmarks_by": get_total_bookmarks}

@app.post("/api/check-likes")
def check_likes(request: Request, data: schemas.CheckLikeResponse, db: Session = Depends(get_db)):
    print("test")
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    title = data.post_title 

    print("Titles dari frontend:", title)

    likes = db.query(models.Likes.post_title).filter(
        models.Likes.liked_by == email,
        models.Likes.post_title == title
    ).first()

    if not likes:
        return {"likes": ""} 

    return {"likes": likes.post_title}

@app.post("/api/addlike")
def add_like(request: Request, data: schemas.LikeResponse, db=Depends(get_db)):
    print(f"Received data: {data.model_dump()}")
    user_session = request.session.get("user")
    if not user_session:
        return RedirectResponse(url="/auth", status_code=303)

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}

    user = db.query(models.Akun).filter(models.Akun.Email == email).first()
    if not user:
        return {"error": "User not found."}

    likes = models.Likes(
        liked_by=email,
        post_title=data.post_title,
        post_category=data.post_category,
        post_source=data.post_source
    )

    isExist = db.query(models.Likes).filter(
        models.Likes.liked_by == email,
        models.Likes.post_title == data.post_title
    ).first()

    if isExist:
        return {"error": "Bookmark already exists."}

    db.add(likes)
    db.commit()
    return {"message": "Bookmark saved"}

@app.delete("/api/remove-like")
async def remove_like(request: Request, data: schemas.CheckLikeResponse, db=Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}
    likes = db.query(models.Likes).filter(
        models.Likes.liked_by == email,
        models.Likes.post_title == data.post_title
    ).first()

    if not likes:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(likes)
    db.commit()

    return {"status": "Like removed"}

@app.post("/api/total_likes")
async def get_total_likes(
    data: schemas.CheckLikeResponse,
    db: Session = Depends(get_db)
):  
    print(f"Titles data to fetch likes: {data.model_dump()}")

    total_items = db.query(models.Likes).filter(
        models.Likes.post_title == data.post_title
    ).count()

    return {"total_likes": total_items}

@app.get("/api/profile/get_total_likes")
async def get_total_profile_likes(request: Request, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}
    
    get_total_likes = db.query(models.Likes).filter(
        models.Likes.liked_by == email
    ).count()

    return {"total_likes_by": get_total_likes}

@app.post("/api/add-dislike")
def add_like(request: Request, data: schemas.DislikeResponse, db=Depends(get_db)):
    print(f"Received data: {data.model_dump()}")
    user_session = request.session.get("user")
    if not user_session:
        return RedirectResponse(url="/auth", status_code=303)

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}

    user = db.query(models.Akun).filter(models.Akun.Email == email).first()
    if not user:
        return {"error": "User not found."}

    dislikes = models.Dislikes(
        disliked_by=email,
        post_title=data.post_title,
        post_category=data.post_category,
        post_source=data.post_source
    )

    isExist = db.query(models.Dislikes).filter(
        models.Dislikes.disliked_by == email,
        models.Dislikes.post_title == data.post_title
    ).first()

    if isExist:
        return {"error": "Bookmark already exists."}

    db.add(dislikes)
    db.commit()
    return {"message": "Bookmark saved"}

@app.delete("/api/remove-dislike")
async def remove_like(request: Request, data: schemas.CheckDislikeResponse, db=Depends(get_db)):
    print(f"Received data: {data.model_dump()}")
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}
    dislikes = db.query(models.Dislikes).filter(
        models.Dislikes.disliked_by == email,
        models.Dislikes.post_title == data.post_title
    ).first()

    if not dislikes:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(dislikes)
    db.commit()

    return {"status": "Like removed"}

@app.delete("/api/delete-comment")
def delete_comment(request: Request, data: schemas.DeleteCommentResponse, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}
    
    print(email)
    print(data.post_title)
    print(data.post_comments)

    comment = db.query(models.Comments).filter(
        models.Comments.commented_by == email,
        models.Comments.post_title == data.post_title,
        models.Comments.post_comments == data.post_comments
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(comment)
    db.commit()

    return JSONResponse(content={"message": "Comment deleted"})

@app.post("/api/check-dislikes")
def check_likes(request: Request, data: schemas.CheckDislikeResponse, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    title = data.post_title 

    print("Titles dari frontend:", title)

    dislikes = db.query(models.Dislikes).filter(
        models.Dislikes.disliked_by == email,
        models.Dislikes.post_title == title
    ).first()

    if not dislikes:
        return {"dislikes": ""} 

    return {"dislikes": dislikes.post_title}

@app.post("/api/baca-news/add-comment")
def add_comment(request: Request, data: schemas.CommentResponse, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    title = data.post_title 

    user = db.query(models.Akun).filter(models.Akun.Email == email).first()
    if not user:
        return {"error": "User not found."}

    print("Titles dari frontend:", title)

    comments = models.Comments(
        commented_by=email,
        post_title=data.post_title,
        post_category=data.post_category,
        post_source=data.post_source,
        post_comments = data.post_comments,
        user_id = user.id,
        created_at = datetime.now()
    )

    db.add(comments)
    db.commit()
    return {"message": "Comment Sent"}

@app.post("/api/total_comments")
async def get_total_comments(
    data: schemas.CheckLikeResponse,
    db: Session = Depends(get_db)
):  
    print(f"Titles data to fetch likes: {data.model_dump()}")

    total_items = db.query(models.Comments).filter(
        models.Comments.post_title == data.post_title
    ).count()

    return {"total_comments": total_items}

@app.post("/api/like-comment")
async def like_a_comment(
    request: Request,
    data: schemas.CommentLikeResponse,
    db: Session = Depends(get_db)
):
    print(f"Comment to be deleted:  {data.model_dump()}")
    user_session = request.session.get("user")
    if not user_session:
        return {"error": "Please Log in First."}

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}

    user = db.query(models.Akun).filter(models.Akun.Email == email).first()
    if not user:
        return {"error": "User not found."}

    commentLike = models.CommLikes(
        liked_by=email,
        post_title=data.post_title,
        comment=data.comment,
        commented_by=data.commented_by
    )

    isExist = db.query(models.CommLikes).filter(
        models.CommLikes.liked_by == email,
        models.CommLikes.comment == data.comment,
        models.CommLikes.commented_by == data.commented_by,
        models.CommLikes.post_title == data.post_title
    ).first()

    if isExist:
        return {"error": "Comment already liked."}

    db.add(commentLike)
    db.commit()
    return {"message": "comment liked"}

@app.post("/api/dislike-comment")
async def dislike_a_comment(
    request: Request,
    data: schemas.CommentDislikeResponse,
    db: Session = Depends(get_db)
):
    print(f"Comment to be deleted:  {data.model_dump()}")
    user_session = request.session.get("user")
    if not user_session:
        return {"error": "Please Log in First."}

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}

    user = db.query(models.Akun).filter(models.Akun.Email == email).first()
    if not user:
        return {"error": "User not found."}

    commentDislike = models.CommdisLikes(
        disliked_by=email,
        post_title=data.post_title,
        comment=data.comment,
        commented_by=data.commented_by
    )

    isExist = db.query(models.CommdisLikes).filter(
        models.CommdisLikes.disliked_by == email,
        models.CommdisLikes.comment == data.comment,
        models.CommdisLikes.commented_by == data.commented_by,
        models.CommdisLikes.post_title == data.post_title
    ).first()

    if isExist:
        return {"error": "Comment already disliked."}

    db.add(commentDislike)
    db.commit()
    return {"message": "comment disliked"}

@app.post("/api/check-likes-comment")
def check_likes_comment(data: schemas.CommentLikeResponse, db: Session = Depends(get_db)):
    title = data.post_title 

    print("Titles dari frontend:", title)

    commlikes = db.query(models.CommLikes).filter(
        models.CommLikes.commented_by== data.commented_by,
        models.CommLikes.comment == data.comment,
        models.CommLikes.post_title == title
    ).first()

    if not commlikes:
        return {"comment_likes": ""} 

    return {"comment_likes": commlikes}

@app.post("/api/check-total-likes-comment")
def check_totallikes_comment(data: schemas.CommentLikeResponse, db: Session = Depends(get_db)):
    title = data.post_title 

    print("Titles dari frontend:", title)

    totalcommlikes = db.query(models.CommLikes).filter(
        models.CommLikes.commented_by== data.commented_by,
        models.CommLikes.comment == data.comment,
        models.CommLikes.post_title == title
    ).count()

    if not totalcommlikes:
        return {"total_comment_likes": ""} 

    return {"total_comment_likes": totalcommlikes}

@app.post("/api/check-dislikes-comment")
def check_dislikes_comment(data: schemas.CommentDislikeResponse, db: Session = Depends(get_db)):
    title = data.post_title 

    print("Titles dari frontend:", title)

    dislikes = db.query(models.CommdisLikes).filter(
        models.CommdisLikes.commented_by== data.commented_by,
        models.CommdisLikes.comment == data.comment,
        models.CommdisLikes.post_title == title
    ).first()

    if not dislikes:
        return {"comment_dislikes": ""} 

    return {"comment_dislikes": dislikes}

@app.post("/api/check-total-dislikes-comment")
def check_totaldislikes_comment(data: schemas.CommentDislikeResponse, db: Session = Depends(get_db)):
    title = data.post_title 

    print("Titles dari frontend:", title)

    totalcommdislikes = db.query(models.CommdisLikes).filter(
        models.CommdisLikes.commented_by== data.commented_by,
        models.CommdisLikes.comment == data.comment,
        models.CommdisLikes.post_title == title
    ).count()

    if not totalcommdislikes:
        return {"total_comment_dislikes": ""} 

    return {"total_comment_dislikes": totalcommdislikes}

@app.delete("/api/remove-comment-dislike")
async def remove_comment_dislike(request: Request, data: schemas.CommentDislikeResponse, db=Depends(get_db)):
    print(f"Received data: {data.model_dump()}")
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}
    dislikes = db.query(models.CommdisLikes).filter(
        models.CommdisLikes.disliked_by == email,
        models.CommdisLikes.comment == data.comment,
        models.CommdisLikes.commented_by == data.commented_by,
        models.CommdisLikes.post_title == data.post_title
    ).first()

    if not dislikes:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(dislikes)
    db.commit()

    return {"status": "Dislike removed"}

@app.delete("/api/remove-comment-like")
async def remove_comment_like(request: Request, data: schemas.CommentLikeResponse, db=Depends(get_db)):
    print(f"Received data: {data.model_dump()}")
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}
    remove_comm_likes = db.query(models.CommLikes).filter(
        models.CommLikes.liked_by == email,
        models.CommLikes.comment == data.comment,
        models.CommLikes.commented_by == data.commented_by,
        models.CommLikes.post_title == data.post_title
    ).first()

    if not remove_comm_likes:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(remove_comm_likes)
    db.commit()

    return {"status": "Dislike removed"}

@app.post("/api/get_comments")
def get_comments(data: schemas.GetCommentResponse, db: Session = Depends(get_db)):
    print("Titles dari www:", datetime.now())

    comments = db.query(models.Comments).filter(
        models.Comments.post_title == data.post_title
    ).all()

    result = []
    for comment in comments:
        result.append({
            "comment": comment.post_comments,
            "commented_by": comment.commented_by,
            "post_title": comment.post_title,
            "created_at": comment.created_at,
            "post_category": comment.post_category,
            "post_source": comment.post_source,
            "user": {
                "username": comment.user_data.Username,
                "first_name": comment.user_data.First_name,
                "last_name": comment.user_data.Last_name,
                "profile_photo": comment.user_data.ProfilePhoto,
            }
        })

    return {"comments": result}

@app.post("/api/get_comments/sorted-newest")
def get_comments(data: schemas.GetCommentResponse, db: Session = Depends(get_db)):
    print("Titles dari www:", datetime.now())

    comments = db.query(models.Comments).filter(
        models.Comments.post_title == data.post_title
    ).order_by(models.Comments.created_at.desc()).all()

    result = []
    for comment in comments:
        result.append({
            "comment": comment.post_comments,
            "commented_by": comment.commented_by,
            "post_title": comment.post_title,
            "created_at": comment.created_at,
            "post_category": comment.post_category,
            "post_source": comment.post_source,
            "user": {
                "username": comment.user_data.Username,
                "first_name": comment.user_data.First_name,
                "last_name": comment.user_data.Last_name,
                "profile_photo": comment.user_data.ProfilePhoto,
            }
        })

    return {"comments": result}

@app.post("/api/get_comments/sorted-most-liked")
def get_comments(data: schemas.GetCommentResponse, db: Session = Depends(get_db)):
    print("Titles dari www:", datetime.now())

    comments = db.query(models.Comments).\
        options(joinedload(models.Comments.user_data)).\
        outerjoin(
            models.CommLikes,
            (models.Comments.post_comments == models.CommLikes.comment) &
            (models.Comments.commented_by == models.CommLikes.commented_by) &
            (models.Comments.post_title == models.CommLikes.post_title)
        ).\
        filter(models.Comments.post_title == data.post_title).\
        group_by(models.Comments.id).\
        order_by(
            desc(func.count(models.CommLikes.id)),
            desc(models.Comments.created_at)
        ).\
        all()

    result = []
    for comment in comments:
        result.append({
            "comment": comment.post_comments,
            "commented_by": comment.commented_by,
            "post_title": comment.post_title,
            "created_at": comment.created_at,
            "post_category": comment.post_category,
            "post_source": comment.post_source,
            "user": {
                "username": comment.user_data.Username,
                "first_name": comment.user_data.First_name,
                "last_name": comment.user_data.Last_name,
                "profile_photo": comment.user_data.ProfilePhoto,
            }
        })

    return {"comments": result}

@app.get("/api/recommended")
def recommend(request: Request, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}
    
    getPref = db.query(models.Topics.Topic_Name).join(models.user_preferences, models.Topics.id == models.user_preferences.c.topic_id).join(models.Akun, models.Akun.id == models.user_preferences.c.user_id).filter(models.Akun.Email == email).all()
    
    catList = [cat[0] for cat in getPref]

    news_list = []

    for cat in catList:
        cat = cat.lower()
        print(cat)
        try:
            response = newsapi.get_top_headlines(category = cat)
        except Exception as e:
            return {"error": f"Error fetching news: {str(e)}"}

        if response['status'] != 'ok':
            return {"error": "Failed to fetch news"}

        for article in response.get('articles', []):
            if article.get("urlToImage") and article.get("content"):
                news_item = {
                    "title": article.get("title"),
                    "publishedAt": article.get("publishedAt"),
                    "author": article.get("author"),
                    "imageUrl": article.get("urlToImage"),
                    "content": article.get("content"),
                    "url": article.get("url"),
                    "category": cat  
                }
                news_list.append(news_item)

    random.shuffle(news_list)
    return {"news": news_list}

@app.get("/api/user-query")
def get_newsapi_query(request: Request, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}
    bookmarks = db.query(models.Bookmark).filter(models.Bookmark.Bookmarked_by == email).limit(20).all()
    likes = db.query(models.Likes).filter(models.Likes.liked_by == email).limit(20).all()

    texts = []

    for b in bookmarks:
        if b.title:
            texts.append(b.title)
        if b.content:
            texts.append(b.content)

    for l in likes:
        if l.post_title:
            texts.append(l.post_title)

    if not texts:
        return {"query": "", "message": "No news articles found for extracted topics."}
    q_list = get_reco(texts)

    news_list = []

    for que in q_list:
        try:
            response = newsapi.get_everything(q = que, page_size=10)
        except Exception as e:
            continue

        if response['status'] != 'ok':
            return {"error": "Failed to fetch news"}

        for article in response.get('articles', []):
            if article.get("urlToImage") and article.get("content"):
                news_item = {
                    "title": article.get("title"),
                    "publishedAt": article.get("publishedAt"),
                    "author": article.get("author"),
                    "imageUrl": article.get("urlToImage"),
                    "content": article.get("content"),
                    "url": article.get("url"),
                    "category": "general"  
                }
                news_list.append(news_item)
        
        if not news_list:
            return {"news": [], "message": "No news articles found for extracted topics."}

    random.shuffle(news_list)
    return {"news": news_list}