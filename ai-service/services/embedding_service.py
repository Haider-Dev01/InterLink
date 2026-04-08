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
    import unicodedata
    def normalize(text: str) -> str:
        return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn').lower()

    skills = parsed_data.get("skills", [])
    skills_str = ", ".join(skills) if skills else "None"
    
    text = parsed_data.get("text", "")
    if not text.strip():
        return f"Skills: {skills_str} | Profil: Candidat en informatique"
    
    # Nettoyage et filtrage
    raw_lines = text.split('\n')
    valid_lines = []
    
    address_keywords = ["rue", "avenue", "boulevard", "allée", "chemin", "code postal", "cedex", "ville"]
    
    for line in raw_lines:
        clean_line = line.strip()
        if len(clean_line) < 10:
            continue
            
        lower_line = clean_line.lower()
        # Ignorer contacts, liens et adresses
        if '@' in lower_line or 'http' in lower_line or 'www.' in lower_line or 'github' in lower_line or 'linkedin' in lower_line:
            continue
        if re.search(r'(?:(?:\+|00)\d{2,3}|0)\s*[1-9](?:[\s.-]*\d{2}){4}', clean_line):
            continue
        # Check adresses courtes
        if any(addr in lower_line for addr in address_keywords) and len(clean_line) < 60:
            continue
            
        valid_lines.append(clean_line)
    
    if not valid_lines:
        return f"Skills: {skills_str} | Profil: Candidat en informatique"
        
    all_sections = ["formation", "education", "competence", "skill", "projet", "experience", "professionnel", "parcours", "diplome", "realisation", "stage"]
    exp_sections = ["projet", "experience", "professionnel", "stage", "realisation"]
    
    profile_lines = []
    project_lines = []
    current_section = "profil"
    
    for line in valid_lines:
        norm_line = normalize(line)
        
        # Détection robuste d'un titre de section (insensible accents/casse)
        is_header = False
        if len(norm_line) < 40:
            for header in all_sections:
                if header in norm_line:
                    is_header = True
                    if any(exp in norm_line for exp in exp_sections):
                        current_section = "projets"
                    else:
                        current_section = "other"
                    break
        
        if not is_header:
            if current_section == "profil" and len(profile_lines) < 4:
                profile_lines.append(line)
            elif current_section == "projets" and len(project_lines) < 4:
                project_lines.append(line)
                
    # Fallback pour les Expériences si non trouvées via les titres
    if not project_lines:
        project_keywords = ['developpe', 'cree', 'concu', 'realise', 'application', 'developpement', 'implemente', 'mission', 'stage']
        for line in valid_lines:
            if line not in profile_lines and any(kw in normalize(line) for kw in project_keywords):
                project_lines.append(line)
                if len(project_lines) >= 4:
                    break

    profile_text = " ".join(profile_lines)
    profil_section = profile_text[:300].strip() + ("..." if len(profile_text) > 300 else "")
    if not profil_section:
         profil_section = "Candidat en informatique"
    
    projects_text = " ".join(project_lines)
    projects_section = projects_text[:300].strip() + ("..." if len(projects_text) > 300 else "")
    
    if projects_section:
        final_text = f"Skills: {skills_str} | Profil: {profil_section} | Expériences: {projects_section}"
    else:
        final_text = f"Skills: {skills_str} | Profil: {profil_section}"
        
    return final_text[:800]

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
