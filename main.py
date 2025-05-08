from fastapi import FastAPI, Depends, Form, HTTPException, Query, Request, UploadFile, File, requests
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy import delete
from sqlalchemy.orm import Session
from datetime import datetime
import urllib
import models, schemas, crud, utilities
from database import engine, Base, get_db
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
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

        
load_dotenv()

app = FastAPI()

nltk.download('punkt_tab')
nltk.download("stopwords")

def extract_keywords(texts):
    stop_words = set(stopwords.words("english"))
    words = []

    for text in texts:
        if not text:
            continue
        tokens = word_tokenize(text.lower())
        filtered = [
            word for word in tokens
            if word.isalnum() and word not in stop_words and word not in string.punctuation
        ]
        words.extend(filtered)

    return Counter(words).most_common(10)

app.add_middleware(SessionMiddleware, secret_key= os.getenv("SESSION_MIDDLEWARE_CLIENT_SECRET"))

Base.metadata.create_all(bind=engine)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

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
        return RedirectResponse(url="/", status_code=303)
    else:
        token = utilities.encrypt_user_data({
        "first_name": given_name,
        "last_name": family_name,
        "email": email
        })
        redirect_url = f"/auth?token={token}"
        return RedirectResponse(url=redirect_url)

@app.get("/")
def home(request: Request, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        return templates.TemplateResponse("index.html", {"request": request, "Logged_in": False})
    
    email = user_session.get("email")
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()

    return templates.TemplateResponse("index.html", {
        "request": request,
        "user": user,
        "Logged_in": True
        })

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

@app.get("/index/profile/{username}")
async def profile(username: str, request: Request, db: Session = Depends(get_db)):
    user = db.query(models.Akun).filter(models.Akun.Username == username).first()
    
    if not user:
        return RedirectResponse(url="/login", status_code=303)
    
    return templates.TemplateResponse("profile.html", {
        "request": request,
        "user": user,
        "Logged_in": True
    })

@app.get("/auth", response_class=HTMLResponse)
async def auth(request: Request, token: str = Query(None)):
    if token:
        try:
            user_data = utilities.decrypt_user_data(token)
            return templates.TemplateResponse("Login_Signup/Login.html", {
                "request": request,
                "prefill": user_data  
            })
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid or expired token")
    else:
        return templates.TemplateResponse("Login_Signup/Login.html", {"request": request})

@app.post("/login")
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
    return RedirectResponse(url="/", status_code=303)

@app.post("/signup")
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

@app.get("/logout")
async def logout(request: Request):
    utilities.logout(request)
    return RedirectResponse(url="/", status_code=303)

@app.post("/edit")
def upload_profile_picture(
    request: Request,
    db: Session = Depends(get_db),
    Location: str = Form(...),
    file: UploadFile = File(...),
):
    crud.upload_photo(db, request, file)
    crud.update_loc(request, db, Location)
    return RedirectResponse(url="/index/profile", status_code=303)

@app.post("/delete-photo")
def delete_profile_picture(
    request: Request,
    db: Session = Depends(get_db),
):
    crud.delete_photo(db, request)
    return RedirectResponse(url="/index/profile", status_code=303)

@app.post("/edit/personal-info")
def update_akun(
    request: Request,
    First_name: str = Form(...),
    Last_name: str = Form(...),
    email_new: str = Form(""),
    Username: str = Form(...),
    db: Session = Depends(get_db)
    ): 
    crud.update_acc(request, db, First_name, Last_name, email_new, Username)
    return RedirectResponse("/index/profile", status_code=303)

@app.post("/edit/password")
def editpass(
    request: Request,
    db: Session = Depends(get_db),
    Old_pass: str = Form(...),
    New_pass: str = Form(...),
    Confirm_pass: str = Form(...)
):
    crud.updatepass(request, db, Old_pass, New_pass, Confirm_pass)
    utilities.logout(request)
    return RedirectResponse(url="/auth", status_code=303)
    

@app.post("/api/save-preferences")
async def save_preferences(
    request: Request,
    body: schemas.UserPreferenceRequest,
    db: Session = Depends(get_db)
):
    user_session = request.session.get("user") 
    if not user_session:
        return {"error": "User not logged in"}
    
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
        return {"error": "User not logged in"}
    
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

@app.get("/api/ambil_news")
async def ambilnews(category: str = 'general'):
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

@app.get("/api/ambil_news/sports")
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

@app.get("/api/ambil_news/popular")
async def ambilnews(category: str = 'general'):
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

@app.get("/api/baca-news/{query}/{title}", response_class=HTMLResponse)
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
        raise HTTPException(status_code=503, detail=e)

    articles = response.get("articles", [])

    for article in articles:
        raw_image_url = article.get("urlToImage")
        image_url = raw_image_url.strip() if raw_image_url else ""
        if not image_url:
            continue

        url = article.get("url")
        title = article.get("title")
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

        except Exception as e:
            print(f"Failed Parsing Article: {e}")
            full_text = article.get("content") or "Unable to load content"

        user_session = request.session.get("user")
        
        if not user_session:
            return templates.TemplateResponse("news-page.html", {
            "request": request,
            "title": title,
            "author": article.get("author"),
            "category": decoded_query,
            "publishedAt": article_date,
            "imageUrl": image_url,
            "content": full_text,
            "source_url": url,
            "source_name": article.get('source', {}).get('name', '')
        })

        email = user_session.get("email")
        user = db.query(models.Akun).filter(models.Akun.Email == email).first()

        return templates.TemplateResponse("news-page.html", {
            "request": request,
            "title": title,
            "author": article.get("author"),
            "category": decoded_query,
            "publishedAt": article_date,
            "imageUrl": image_url,
            "content": full_text,
            "source_url": url,
            "source_name": article.get('source', {}).get('name', ''),
            "user": user,
            "Logged_in": True
        })

    raise HTTPException(status_code=404, detail="No article found with image")

        
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

        user_session = request.session.get("user")
        if not user_session:
            return templates.TemplateResponse("news-page.html", {
            "request": request,
            "title": title,
            "author": author,
            "publishedAt": article_date,
            "imageUrl": image_url,
            "category": decoded_query,
            "content": full_text,
            "source_url": url,
            "source_name": source_name
        })

        email = user_session.get("email")
        user = db.query(models.Akun).filter(models.Akun.Email == email).first()

        return templates.TemplateResponse("news-page.html", {
            "request": request,
            "title": title,
            "author": author,
            "publishedAt": article_date,
            "imageUrl": image_url,
            "category": decoded_query,
            "content": full_text,
            "source_url": url,
            "source_name": source_name,
            "user": user,
            "Logged_in": True
        })

    raise HTTPException(status_code=404, detail="No complete article found")

@app.get("/news/category/{cat}", response_class=HTMLResponse)
async def newscat(request: Request, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        return templates.TemplateResponse("cat-page.html", {"request": request})
    
    email = user_session.get("email")
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()

    return templates.TemplateResponse("cat-page.html", {"request": request, "user": user, "Logged_in": True})


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

@app.get("/news/search", response_class=HTMLResponse)
async def newscat(request: Request, db: Session = Depends(get_db), q: str = Query(None)):
    user_session = request.session.get("user")
    if not user_session:
        return templates.TemplateResponse("search-index.html", {"request": request})
    
    email = user_session.get("email")
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()

    return templates.TemplateResponse("search-index.html", {"request": request, "user": user, "Logged_in": True, "query": q})

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

        user_session = request.session.get("user")
        if not user_session:
            return templates.TemplateResponse("news-page.html", {
            "request": request,
            "title": title,
            "author": author,
            "publishedAt": article_date,
            "imageUrl": image_url,
            "category": decoded_query,
            "content": full_text,
            "source_url": url,
            "source_name": source_name
        })

        email = user_session.get("email")
        user = db.query(models.Akun).filter(models.Akun.Email == email).first()

        return templates.TemplateResponse("news-page.html", {
            "request": request,
            "title": title,
            "author": author,
            "publishedAt": article_date,
            "imageUrl": image_url,
            "category": decoded_query,
            "content": full_text,
            "source_url": url,
            "source_name": source_name,
            "user": user,
            "Logged_in": True
        })

    raise HTTPException(status_code=404, detail="No complete article found")

@app.get("/api/popular-keywords/{cat}")
async def get_popular_keywords(cat: str):
    decoded_cat = urllib.parse.unquote(cat)
    url = f"https://newsapi.org/v2/top-headlines?category={decoded_cat}&apiKey={newsapi_client_key}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url)
            res.raise_for_status()
            data = res.json()
    except httpx.ConnectTimeout:
        return {"error": "Koneksi timeout ke NewsAPI."}
    except httpx.HTTPStatusError as exc:
        return {"error": f"Error dari NewsAPI: {exc.response.status_code}"}
    except Exception as e:
        return {"error": f"Gagal mengambil data: {str(e)}"}

    articles = data.get("articles", [])
    combined_texts = [article.get("title", "") for article in articles]
    top_keywords = extract_keywords(combined_texts)

    return {
        "top_keywords": [{"word": w, "count": c} for w, c in top_keywords]
    }

@app.get("/news/more-categories/search/", response_class=HTMLResponse)
async def newscat(request: Request, query:str = "", category:str = "", db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        return templates.TemplateResponse("search-index.html", {"request": request})
    
    email = user_session.get("email")
    user = db.query(models.Akun).filter(models.Akun.Email == email).first()

    return templates.TemplateResponse("search-more-cat.html", {"request": request, "user": user, "Logged_in": True, "query": query, "category": category})

@app.get("/api/search/more-categories/baca-news/{query}/{title}", response_class=HTMLResponse)
async def baca_news(request: Request, query: str, title: str, db: Session = Depends(get_db)):
    decoded_query = urllib.parse.unquote(query)
    decoded_title = urllib.parse.unquote(title)

    try:
        url = f"https://newsapi.org/v2/top-headlines?q={decoded_title}&category={decoded_query}&apiKey={newsapi_client_key}"
        async with httpx.AsyncClient() as client:
            data = await client.get(url)
            response = data.json()
    except Exception as e:
        print("Fetching news failed:", e)
        raise HTTPException(status_code=404, detail="Topic not found")

    articles = response.get("articles", [])

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

        user_session = request.session.get("user")
        if not user_session:
            return templates.TemplateResponse("news-page.html", {
            "request": request,
            "title": title,
            "author": author,
            "publishedAt": article_date,
            "imageUrl": image_url,
            "category": decoded_query,
            "content": full_text,
            "source_url": url,
            "source_name": source_name
        })

        email = user_session.get("email")
        user = db.query(models.Akun).filter(models.Akun.Email == email).first()

        return templates.TemplateResponse("news-page.html", {
            "request": request,
            "title": title,
            "author": author,
            "publishedAt": article_date,
            "imageUrl": image_url,
            "category": decoded_query,
            "content": full_text,
            "source_url": url,
            "source_name": source_name,
            "user": user,
            "Logged_in": True
        })

    raise HTTPException(status_code=404, detail="No complete article found")

@app.post("/api/check-bookmarks")
def check_bookmarks(request: Request, data: schemas.BookmarkBatchRequest, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    titles = data.Titles  

    print("Titles dari frontend:", data.Titles)

    bookmarks = db.query(models.Bookmark.Title).filter(
        models.Bookmark.Bookmarked_by == email,
        models.Bookmark.Title.in_(titles)
    ).all()

    bookmarked_titles = [b.Title for b in bookmarks]

    return {"bookmarked": bookmarked_titles}

@app.post("/api/bookmark")
def save_bookmark(request: Request, data: schemas.BookmarkRequest, db=Depends(get_db)):
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
        Title=data.Title,
        Created_at=datetime.now().strftime("%d %B %Y %H:%M")
    )
    db.add(bookmark)
    db.commit()
    return {"message": "Bookmark saved"}

@app.delete("/api/remove-bookmark")
async def remove_bookmark(request: Request, data: schemas.BookmarkRequest, db=Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="User not logged in")

    email = user_session.get("email")
    if not email:
        return {"error": "Email not found in session."}
    bookmark = db.query(models.Bookmark).filter(
        models.Bookmark.Bookmarked_by == email,
        models.Bookmark.Title == data.Title
    ).first()

    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(bookmark)
    db.commit()

    return {"status": "Bookmark removed"}