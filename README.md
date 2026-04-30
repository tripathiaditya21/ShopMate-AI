# 📦 ShopMate AI

## 🚀 Overview
**ShopMate AI** is a **Generative AI-powered shopping assistant** that provides personalized product recommendations using **RAG (Retrieval-Augmented Generation)** and real-time data.

It combines:
- 🧠 User memory (FAISS)
- 🌐 Live product trends (Firecrawl)
- 🤖 LLM intelligence (Llama 3.3 via Groq)

---

## 🖼️ Application Preview

### 🔐 Authentication (Login / Signup)
![Login UI](./assets/login.png)

---

### 💬 Chat Interface (Sidebar + AI Assistant)
![Chat UI](./assets/chat-dashboard.png)

---

### 🛍️ AI Product Recommendations
![Product Cards](./assets/product-recommendations.png)

---

## 🎯 Key Features

### 🧩 RAG-Based Memory System
- FAISS vector database for storing chat history  
- Context-aware multi-turn conversations  
- Embeddings using HuggingFace (`all-MiniLM-L6-v2`)  

---

### 🌍 Real-Time Product Intelligence
- Integrated Firecrawl  
- Fetches live product trends and data  
- Avoids outdated recommendations  

---

### 🤖 LLM Orchestration
- Powered by Groq (Llama 3.3 – 70B)  
- Structured JSON responses  
- Enables dynamic UI rendering  

---

### 🎨 Modern UI/UX
- Built with React (Vite) + Tailwind CSS  
- Dark theme interface  
- Sidebar with chat history  
- Dynamic product cards  

---

## 🏗️ System Architecture
User → React Frontend → FastAPI Backend → LLM + FAISS + Firecrawl
↓
Structured JSON
↓
Dynamic UI Rendering


---

## ⚙️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS  

### Backend
- FastAPI  
- FAISS  
- HuggingFace Transformers  

### AI & APIs
- Groq (Llama 3.3)  
- Firecrawl  

---

## 🔄 Workflow

1. User enters a query  
2. Backend retrieves past context (FAISS)  
3. Fetches real-time data (Firecrawl)  
4. LLM processes query + context + live data  
5. Returns structured JSON  
6. Frontend renders product recommendations  

---

## 🧪 How to Run

### 1. Clone Repository
```bash
git clone https://github.com/your-username/shopmate-ai.git
cd shopmate-ai


cd backend
pip install -r requirements.txt
uvicorn main:app --reload

cd frontend
npm install
npm run dev

