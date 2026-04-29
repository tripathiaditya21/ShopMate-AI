from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables with override so .env changes are always picked up
load_dotenv(override=True)

from services.llm_service import generate_recommendations
from services.firecrawl_service import fetch_trending_products
from db.vector_store import vector_db

app = FastAPI(title="ShopMate AI API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

USERS_DB_FILE = "db/users.json"
if not os.path.exists("db"):
    os.makedirs("db")
if not os.path.exists(USERS_DB_FILE):
    with open(USERS_DB_FILE, "w") as f:
        json.dump({}, f)

def load_users():
    with open(USERS_DB_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_DB_FILE, "w") as f:
        json.dump(users, f)

otp_store = {}

class SignupRequest(BaseModel):
    email: str
    password: str

class SigninRequest(BaseModel):
    email: str
    password: str

class SendOTPRequest(BaseModel):
    email: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

@app.post("/auth/signup")
async def signup(req: SignupRequest):
    users = load_users()
    if req.email in users:
        raise HTTPException(status_code=400, detail="User already exists")
    users[req.email] = {"password": req.password}
    save_users(users)
    return {"message": "User created successfully", "username": req.email.split('@')[0]}

@app.post("/auth/signin")
async def signin(req: SigninRequest):
    users = load_users()
    if req.email not in users or users[req.email]["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"message": "Signed in successfully", "username": req.email.split('@')[0]}

def send_email_otp(to_email: str, otp: str):
    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    if not sender_email or not sender_password:
        print("Warning: SMTP_EMAIL or SMTP_PASSWORD not set in .env. Falling back to console logging.")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = to_email
        msg['Subject'] = "Your ShopMate AI Login OTP"

        body = f"Your One-Time Password (OTP) for ShopMate AI is: {otp}\n\nThis OTP is valid for your current session."
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_sms_otp(phone_number: str, otp: str):
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_from = os.getenv("TWILIO_FROM_NUMBER")

    if not twilio_sid or not twilio_token or not twilio_from:
        print("Warning: Twilio credentials not set in .env. Falling back to console logging.")
        return False
        
    try:
        import urllib.request
        import urllib.parse
        import base64
        
        url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
        data = urllib.parse.urlencode({
            'To': phone_number,
            'From': twilio_from,
            'Body': f"Your ShopMate AI Login OTP is: {otp}"
        }).encode('utf-8')
        
        req = urllib.request.Request(url, data=data)
        auth = base64.b64encode(f"{twilio_sid}:{twilio_token}".encode('utf-8')).decode('utf-8')
        req.add_header('Authorization', f'Basic {auth}')
        
        urllib.request.urlopen(req)
        return True
    except Exception as e:
        print(f"Failed to send SMS: {e}")
        return False

@app.post("/auth/send-otp")
async def send_otp(req: SendOTPRequest):
    otp = str(random.randint(100000, 999999))
    identifier = req.email
    otp_store[identifier] = otp
    print(f"DEBUG - OTP for {identifier}: {otp}")
    
    is_email = "@" in identifier
    
    if is_email:
        email_sent = send_email_otp(identifier, otp)
        if email_sent:
            return {"message": "OTP sent successfully. Please check your email."}
        else:
            return {"message": f"Email not configured. Your DEV OTP is {otp}", "otp": otp, "type": "email"}
    else:
        sms_sent = send_sms_otp(identifier, otp)
        if sms_sent:
            return {"message": "OTP sent successfully. Please check your phone."}
        else:
            return {"message": f"SMS not configured. Your DEV OTP is {otp}", "otp": otp, "type": "phone"}

@app.post("/auth/verify-otp")
async def verify_otp(req: VerifyOTPRequest):
    if req.email not in otp_store or otp_store[req.email] != req.otp:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")
    
    del otp_store[req.email]

    users = load_users()
    if req.email not in users:
        users[req.email] = {"password": ""}
        save_users(users)
    
    return {"message": "OTP verified successfully", "username": req.email.split('@')[0]}


class ChatRequest(BaseModel):
    query: str
    preferences: dict = {}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    query = request.query
    preferences = request.preferences
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        # 1. Retrieve similar past queries
        past_queries = vector_db.search_similar_queries(query, top_k=3)
        
        # 2. Fetch trending products via Firecrawl
        trends = fetch_trending_products(query)
        
        # 3. Generate recommendation with LLM
        response_data = generate_recommendations(query, past_queries, trends, preferences)
        
        # 4. Save current query to memory
        vector_db.add_query(query)

        if "error" in response_data:
            raise HTTPException(status_code=500, detail=response_data["error"])

        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
