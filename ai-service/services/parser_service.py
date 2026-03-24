import re
import logging
from typing import List
from pdfminer.high_level import extract_text
import docx

logger = logging.getLogger(__name__)

KNOWN_SKILLS = [
    "python", "javascript", "typescript", "react", "vue", "angular", "node.js",
    "express", "fastapi", "django", "flask", "java", "spring", "c++", "c#", "php",
    "laravel", "go", "docker", "postgresql", "mysql", "mongodb", "redis",
    "git", "aws", "azure", "tensorflow", "pytorch", "html", "css", "tailwind",
    "graphql", "rest", "sql", "prisma"
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

def extract_skills_from_text(text: str) -> List[str]:
    found_skills = set()
    for skill in KNOWN_SKILLS:
        escaped_skill = re.escape(skill)
        pattern = rf"(?i)\b{escaped_skill}\b"
        if any(c in skill for c in ['+', '#', '.']):
            pattern = rf"(?i)(?:^|\s){escaped_skill}(?:$|\s)"
            
        if re.search(pattern, text):
            if skill.lower() == "node.js":
                found_skills.add("Node.js")
            elif skill.lower() == "react":
                found_skills.add("React")
            else:
                found_skills.add(skill.capitalize() if skill.islower() else skill)
                
    return list(found_skills)

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
