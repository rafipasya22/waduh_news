from fastapi import Request
from fastapi.responses import RedirectResponse
from passlib.context import CryptContext
from itsdangerous import URLSafeSerializer

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
    

SECRET_KEY = "awopvinawpoivknmaowi124"
serializer = URLSafeSerializer(SECRET_KEY)

def encrypt_user_data(data: dict) -> str:
    return serializer.dumps(data)

def decrypt_user_data(token: str) -> dict:
    return serializer.loads(token)

def logout(request: Request):
    request.session.clear()
