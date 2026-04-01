import logging
import os
import re
import huggingface_hub
if not hasattr(huggingface_hub, 'hf_hub_download'):
    from huggingface_hub import file_download
    huggingface_hub.hf_hub_download = file_download.hf_hub_download
from sentence_transformers import SentenceTransformer
from typing import List

logger = logging.getLogger(__name__)
model = None

def load_model():
    global model
    if model is None:
        model_name = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")
        logger.info(f"Chargement du modèle d'embedding... ({model_name})")
        model = SentenceTransformer(model_name)
        logger.info(f"Modèle {model_name} chargé")

def embed_text(text: str) -> List[float]:
    if model is None:
        raise RuntimeError("Modèle non initialisé")
    embedding = model.encode(text)
    return embedding.tolist()

def build_cv_embedding_text(parsed_data: dict) -> str:
    skills = parsed_data.get("skills", [])
    skills_str = ", ".join(skills) if skills else "None"
    
    text = parsed_data.get("text", "")
    clean_text = re.sub(r'\s+', ' ', text).strip()
    profile_text = clean_text[:800]
    
    return f"Skills: {skills_str} | Profil: {profile_text}"

def build_candidate_text(skills: List[str], speciality: str | None, bio: str | None, school: str | None) -> str:
    parts = []
    if skills:
        parts.append(f"skills: {', '.join(skills)}")
    if bio:
        parts.append(f"profile: {bio[:300]}")
    if speciality:
        parts.append(f"speciality: {speciality}")
    
    text = " | ".join(parts)
    if not text.strip():
        text = "candidate profile"
    return text

def build_offer_text(title: str, description: str, skills: List[str]) -> str:
    parts = []
    if title:
        parts.append(f"title: {title}")
    if skills:
        parts.append(f"skills: {', '.join(skills)}")
    if description:
        parts.append(f"description: {description}")
        
    return " | ".join(parts)
