import os
from groq import Groq

class RagService:
    def __init__(self):
        api_key = os.getenv('GROQ_API_KEY')
        if api_key and api_key != 'placeholder_a_remplacer':
            self.client = Groq(api_key=api_key)
            self.available = True
        else:
            self.client = None
            self.available = False

    def build_prompt(self, question, documents, userRole):
        context_label = (
            "offres de stage disponibles"
            if userRole == 'candidate'
            else "profils candidats"
        )
        docs_text = "\n".join([
            f"- {doc['title']}: {doc['content'][:400]}"
            for doc in documents
        ])
        return f"""Tu es un assistant de recrutement pour InternLink.
Voici les {context_label} les plus pertinents :
{docs_text}

Question : {question}
Réponds en français de manière concise et utile.
Si aucune information pertinente, dis-le clairement."""

    def query(self, question, documents, userRole):
        if not self.available:
            return {
                "answer": "Service IA non configuré.",
                "sources": []
            }
        try:
            prompt = self.build_prompt(question, documents, userRole)
            completion = self.client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                timeout=10
            )
            return {
                "answer": completion.choices[0].message.content,
                "sources": [{"id": d["id"], "title": d["title"]}
                            for d in documents]
            }
        except Exception as e:
            return {
                "answer": "Service temporairement indisponible.",
                "sources": []
            }

rag_service = RagService()
