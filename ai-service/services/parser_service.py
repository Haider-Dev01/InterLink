import re
import logging
from typing import List
from pdfminer.high_level import extract_text
import docx

logger = logging.getLogger(__name__)

KNOWN_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "React Native", "Vue", "Angular",
    "Node.js", "Express", "FastAPI", "Django", "Flask", "Java", "Spring", "Spring Boot",
    "C++", "C#", ".NET", "PHP", "Laravel", "Symfony", "Go", "Rust", "Ruby", "Ruby on Rails",
    "Kotlin", "Swift", "Objective-C", "Dart", "Flutter",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Cassandra", "ElasticSearch", "DynamoDB", "Firebase",
    "HTML", "CSS", "Sass", "Tailwind", "Bootstrap", "Material UI", 
    "GraphQL", "REST API", "gRPC", "RabbitMQ", "Kafka",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "Ansible",
    "Jenkins", "GitHub Actions", "GitLab CI", "Git", "Linux", "Unix", "Bash", "PowerShell",
    "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "Keras",
    "Prisma", "Hibernate", "TypeORM", "Mongoose",
    "Jira", "Agile", "Scrum", "Figma", 
    "Redux", "Zustand", "RxJS", "Webpack", "Vite", "Jest", "Cypress"
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
    
    # Prétraitement : normaliser les espaces pour le matching "fuzzy" (tolérance tirets/espaces multiples)
    text_normalized = re.sub(r'[\s\-]+', ' ', text_lower)
    
    for skill in KNOWN_SKILLS:
        skill_lower = skill.lower()
        
        # Gestion des cas spéciaux et variations
        if skill_lower == "node.js":
            pattern_core = r'node[\s\.\-]*js'
        elif skill_lower == "vue":
            pattern_core = r'vue(?:\.js)?'
        elif skill_lower == "react native":
            pattern_core = r'react[\s\-]*native'
        elif skill_lower == ".net":
            pattern_core = r'(?:\.|dot)?[\s\-]*net'
        elif skill_lower == "c++":
            pattern_core = r'c\+\+'
        elif skill_lower == "c#":
            pattern_core = r'c#'
        elif skill_lower == "angular":
            pattern_core = r'angular(?:js)?'
        else:
            # Remplacement des espaces par une tolérance aux espaces/tirets
            pattern_core = re.escape(skill_lower).replace(r'\ ', r'[\s\-]+')
            
        # Lookbehinds/Lookaheads intelligents
        # S'assure que C# ou C++ ne sont pas collés à une autre lettre (ex: éviter de matcher C dans "React")
        pattern = r'(?<![a-zA-Z0-9])' + pattern_core + r'(?![a-zA-Z0-9\+#])'
        
        # Test sur le texte original ou normalisé (pour pallier les variations d'espacement)
        if re.search(pattern, text_lower) or re.search(pattern, text_normalized):
            found.append(skill)
            
    # Dé-duplication stricte et tri alphabétique
    return sorted(list(set(found)))

def build_cv_summary(skills: list[str], text: str, speciality: str = "") -> str:
    clean_lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 3]
    summary = ' '.join(clean_lines[:15])[:1000]
    
    parts = []
    if skills:
        parts.append(f"skills: {', '.join(skills)}")
    if speciality:
        parts.append(f"speciality: {speciality}")
    if summary:
        parts.append(f"profile: {summary}")
    
    return ' | '.join(parts) if parts else text[:1000]

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
