import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from dotenv import load_dotenv


load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY manquante dans .env")


from services.embedding_service import load_model
from routers.parse import router as parse_router
from routers.embed import router as embed_router
from routers.rag import router as rag_router
from routers.career import router as career_router
from routers.chat import router as chat_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield

app = FastAPI(title="InternLink AI Service", lifespan=lifespan)

app.include_router(parse_router)
app.include_router(embed_router)
app.include_router(rag_router)
app.include_router(career_router)
app.include_router(chat_router)

@app.get("/health")
async def health_check():
    model_name = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")
    return {"status": "ok", "model": model_name, "version": "1.0.0"}
