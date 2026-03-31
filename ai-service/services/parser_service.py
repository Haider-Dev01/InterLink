import re
import logging
from typing import List
from pdfminer.high_level import extract_text
import docx

logger = logging.getLogger(__name__)

KNOWN_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Vue", "Angular",
    "Node.js", "Express", "FastAPI", "Django", "Flask", "Java", "Spring",
    "C++", "C#", "PHP", "Laravel", "Go", "Docker", "Kubernetes",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Git", "AWS", "Azure",
    "GCP", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn",
    "HTML", "CSS", "Tailwind", "GraphQL", "REST", "SQL", "Prisma",
    "React Native", "Kotlin", "Swift", "Ruby", "Linux"
]

def extract_text_from_pdf(file_path: str) -> str:
    try:
        return extract_text(file_path)
    except Exception as e:
        logger.error(f"Erreur d'extraction PDF {file_path}: {e}")
        return ""

def extract_text_from_docx(file_path: str) -> str:
    try:
        doc = docx.Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        logger.error(f"Erreur d'extraction DOCX {file_path}: {e}")
        return ""

def extract_skills_from_text(text: str) -> list[str]:
    found = []
    text_lower = text.lower()
    for skill in KNOWN_SKILLS:
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(skill.lower()) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, text_lower):
            found.append(skill)
    return list(dict.fromkeys(found))

def build_cv_summary(skills: list[str], text: str, speciality: str = "") -> str:
    clean_lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 15]
    summary = ' '.join(clean_lines[:5])[:300]
    
    parts = []
    if skills:
        parts.append(f"skills: {', '.join(skills)}")
    if speciality:
        parts.append(f"speciality: {speciality}")
    if summary:
        parts.append(f"profile: {summary}")
    
    return ' | '.join(parts) if parts else text[:300]

def parse_cv(file_url: str, file_type: str) -> dict:
    fallback = {"text": "", "skills": [], "embedding": [0.0] * 384}
    
    text = ""
    if file_type.lower() == "pdf":
        text = extract_text_from_pdf(file_url)
    elif file_type.lower() in ["doc", "docx"]:
        text = extract_text_from_docx(file_url)
        
    if not text.strip():
        logger.warning(f"Aucun texte extrait pour {file_url}")
        return fallback
        
    skills = extract_skills_from_text(text)
    return {"text": text.strip(), "skills": skills, "embedding": [0.0] * 384}
