"""
TheroPy AI Backend — FastAPI Server
Provides chat, memory, emotion detection, and AI provider proxy endpoints.
"""
import os
import json
import uuid
import asyncio
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

import aiosqlite
import httpx

# ===== App Setup =====
app = FastAPI(title="TheroPy AI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "theropy.db")

# ===== Models =====
class ChatCreate(BaseModel):
    title: str = "New Conversation"

class MessageCreate(BaseModel):
    content: str
    provider: str = "gemini"
    model: str = "gemini-2.0-flash"
    api_key: str = ""

class EmotionAnalyzeRequest(BaseModel):
    text: str

class SettingsUpdate(BaseModel):
    api_keys: dict = {}
    active_provider: str = "gemini"
    auto_fallback: bool = True

class MemoryEntry(BaseModel):
    key: str
    value: str
    memory_type: str = "long_term"  # short_term, long_term, semantic

# ===== Database Setup =====
async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS chats (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                emotion TEXT DEFAULT 'neutral',
                active_dataset TEXT
            );

            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                chat_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                emotion TEXT,
                is_memory_aware INTEGER DEFAULT 0,
                FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS user_memory (
                id TEXT PRIMARY KEY,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                memory_type TEXT DEFAULT 'long_term',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS datasets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                source TEXT NOT NULL,
                file_path TEXT,
                row_count INTEGER,
                columns TEXT,
                created_at TEXT NOT NULL
            );
        """)
        await db.commit()

@app.on_event("startup")
async def startup():
    await init_db()

# ===== Emotion Detection =====
EMOTION_KEYWORDS = {
    "anxious": ["anxious", "anxiety", "worried", "nervous", "panic", "fear", "scared", "overthinking"],
    "stressed": ["stressed", "stress", "overwhelmed", "pressure", "burnout", "exhausted", "overworked"],
    "sad": ["sad", "depressed", "down", "unhappy", "hopeless", "lonely", "grief", "loss", "crying"],
    "angry": ["angry", "furious", "rage", "frustrated", "irritated", "mad", "annoyed"],
    "happy": ["happy", "joy", "grateful", "excited", "wonderful", "amazing", "blessed", "great"],
}

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die",
    "self-harm", "hurt myself", "no reason to live", "better off dead"
]

def detect_emotion(text: str) -> str:
    lower = text.lower()
    for emotion, keywords in EMOTION_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return emotion
    return "neutral"

def detect_crisis(text: str) -> bool:
    lower = text.lower()
    return any(kw in lower for kw in CRISIS_KEYWORDS)

# ===== Chat Endpoints =====
@app.get("/api/chats")
async def list_chats():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM chats ORDER BY updated_at DESC")
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

@app.post("/api/chats")
async def create_chat(data: ChatCreate):
    chat_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO chats (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (chat_id, data.title, now, now)
        )
        await db.commit()
    return {"id": chat_id, "title": data.title, "created_at": now}

@app.get("/api/chats/{chat_id}")
async def get_chat(chat_id: str):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM chats WHERE id = ?", (chat_id,))
        chat = await cursor.fetchone()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")

        cursor = await db.execute(
            "SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC",
            (chat_id,)
        )
        messages = [dict(row) for row in await cursor.fetchall()]
        return {**dict(chat), "messages": messages}

@app.delete("/api/chats/{chat_id}")
async def delete_chat(chat_id: str):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM messages WHERE chat_id = ?", (chat_id,))
        await db.execute("DELETE FROM chats WHERE id = ?", (chat_id,))
        await db.commit()
    return {"status": "deleted"}

# ===== Message Endpoint =====
@app.post("/api/chats/{chat_id}/messages")
async def send_message(chat_id: str, data: MessageCreate):
    emotion = detect_emotion(data.content)
    is_crisis = detect_crisis(data.content)
    now = datetime.utcnow().isoformat()
    msg_id = str(uuid.uuid4())

    async with aiosqlite.connect(DB_PATH) as db:
        # Save user message
        await db.execute(
            "INSERT INTO messages (id, chat_id, role, content, timestamp, emotion) VALUES (?, ?, ?, ?, ?, ?)",
            (msg_id, chat_id, "user", data.content, now, emotion)
        )
        # Update chat emotion
        await db.execute(
            "UPDATE chats SET emotion = ?, updated_at = ? WHERE id = ?",
            (emotion, now, chat_id)
        )
        await db.commit()

    # Generate AI response (placeholder — connects to provider when API key present)
    ai_response = await generate_ai_response(data.content, emotion, data.provider, data.model, data.api_key)

    ai_msg_id = str(uuid.uuid4())
    ai_now = datetime.utcnow().isoformat()

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO messages (id, chat_id, role, content, timestamp, emotion, is_memory_aware) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (ai_msg_id, chat_id, "ai", ai_response, ai_now, emotion, 1)
        )
        await db.commit()

    return {
        "user_message": {"id": msg_id, "content": data.content, "emotion": emotion, "is_crisis": is_crisis},
        "ai_message": {"id": ai_msg_id, "content": ai_response, "emotion": emotion},
    }

# ===== AI Provider Proxy =====
THERAPEUTIC_RESPONSES = {
    "anxious": "I can sense you're feeling anxious. Let's try a grounding exercise: Name 5 things you can see, 4 you can touch, 3 you can hear. I'm here with you.",
    "stressed": "It sounds like you're carrying a lot. Remember, you don't have to tackle everything at once. What feels most pressing right now?",
    "sad": "I'm sorry you're feeling this way. Your feelings are valid. Would you like to talk about what's weighing on your heart?",
    "angry": "I can feel the frustration. Anger often signals that a boundary has been crossed. What happened?",
    "happy": "It's wonderful to hear you're feeling good! What's bringing you joy lately?",
    "neutral": "Thank you for sharing. I'm here to listen. What would you like to explore today?",
}

async def generate_ai_response(user_msg: str, emotion: str, provider: str, model: str, api_key: str) -> str:
    """Try to call the real AI provider, fall back to therapeutic template."""
    if api_key:
        try:
            if provider == "gemini":
                return await call_gemini(user_msg, model, api_key)
            elif provider == "groq":
                return await call_groq(user_msg, model, api_key)
            elif provider == "openrouter":
                return await call_openrouter(user_msg, model, api_key)
            elif provider == "nvidia":
                return await call_nvidia(user_msg, model, api_key)
        except Exception as e:
            print(f"AI provider error ({provider}): {e}")

    # Fallback to template
    return THERAPEUTIC_RESPONSES.get(emotion, THERAPEUTIC_RESPONSES["neutral"])

SYSTEM_PROMPT = """You are TheroPy AI, a compassionate therapeutic chatbot. You provide emotional support, 
use evidence-based techniques (CBT, mindfulness, grounding), and respond with empathy. 
You are NOT a replacement for professional therapy. Always suggest professional help for serious issues.
Keep responses warm, supportive, and concise."""

async def call_gemini(msg: str, model: str, api_key: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json={
            "contents": [{"parts": [{"text": f"{SYSTEM_PROMPT}\n\nUser: {msg}"}]}]
        })
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]

async def call_groq(msg: str, model: str, api_key: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": msg},
                ],
            }
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

async def call_openrouter(msg: str, model: str, api_key: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": msg},
                ],
            }
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

async def call_nvidia(msg: str, model: str, api_key: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": msg},
                ],
            }
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

# ===== Emotion Endpoint =====
@app.post("/api/emotions/analyze")
async def analyze_emotion(data: EmotionAnalyzeRequest):
    emotion = detect_emotion(data.text)
    is_crisis = detect_crisis(data.text)
    return {"emotion": emotion, "is_crisis": is_crisis}

# ===== Memory Endpoints =====
@app.get("/api/memory")
async def get_memories():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM user_memory ORDER BY updated_at DESC")
        return [dict(row) for row in await cursor.fetchall()]

@app.post("/api/memory")
async def save_memory(entry: MemoryEntry):
    mem_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO user_memory (id, key, value, memory_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (mem_id, entry.key, entry.value, entry.memory_type, now, now)
        )
        await db.commit()
    return {"id": mem_id, "status": "saved"}

# ===== Dataset Endpoints =====
@app.post("/api/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)):
    dataset_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    content = await file.read()

    # Save file
    os.makedirs(os.path.join(os.path.dirname(__file__), "uploads"), exist_ok=True)
    file_path = os.path.join(os.path.dirname(__file__), "uploads", f"{dataset_id}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(content)

    # Try to parse
    row_count = 0
    columns = ""
    try:
        if file.filename and file.filename.endswith(".json"):
            data = json.loads(content)
            if isinstance(data, list):
                row_count = len(data)
                columns = json.dumps(list(data[0].keys())) if data else "[]"
        elif file.filename and file.filename.endswith(".csv"):
            lines = content.decode().strip().split("\n")
            row_count = len(lines) - 1
            columns = json.dumps(lines[0].split(",")) if lines else "[]"
    except Exception:
        pass

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO datasets (id, name, source, file_path, row_count, columns, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (dataset_id, file.filename, "upload", file_path, row_count, columns, now)
        )
        await db.commit()

    return {"id": dataset_id, "name": file.filename, "row_count": row_count, "columns": columns}

@app.get("/api/datasets")
async def list_datasets():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM datasets ORDER BY created_at DESC")
        return [dict(row) for row in await cursor.fetchall()]

# ===== Health =====
@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "2.0.0", "name": "TheroPy AI"}
