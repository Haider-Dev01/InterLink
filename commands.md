# Guide des Commandes InternLink

Ce document regroupe toutes les commandes nécessaires pour démarrer et gérer le projet InternLink.

## 🐳 Docker (Base de données et Services)

### Commandes Essentielles
*   **Démarrage complet** : `docker-compose up -d`
    *   *À utiliser au début du projet ou si vous avez tout arrêté.*
    *   Le `-d` (detached) permet de lancer les containers en arrière-plan.
*   **Arrêt** : `docker-compose down`
*   **Redémarrage** : `docker-compose restart`
*   **Vérifier l'état** : `docker-compose ps`

### Différence entre "Started" et "Running"
*   **Started (Démarré)** : C'est l'action. Quand vous faites `docker-compose start` ou `up`, Docker envoie l'ordre de démarrage. 
*   **Running (En cours d'exécution)** : C'est l'état final. Une fois que le processus à l'intérieur du container est prêt, l'état passe à "Up" (Running).
*   **Quand voir quoi ?** Au tout début du projet, vous verrez "Creating" puis "Starting". Une fois lancé, si vous faites un `ps`, vous verrez "Running" ou "Up".

---

## 🏗️ Backend & Prisma (Logique & Base de données)

Allez dans le dossier `backend` : `cd backend`

### Commandes Prisma Expliquées
*   **`npx prisma generate`** : 
    *   **Ce qu'elle fait** : Génère le code du client Prisma en fonction de votre fichier `schema.prisma`.
    *   **Fichiers touchés** : Met à jour les fichiers dans `node_modules/.prisma/client`.
    *   **Quand l'utiliser** : À chaque fois que vous modifiez le schéma de la base de données.
*   **`npx prisma db push`** :
    *   **Ce qu'elle fait** : Synchronise directement votre `schema.prisma` avec la base de données sans créer de fichiers de migration. C'est rapide pour le développement.
    *   **Impact** : Modifie directement la structure des tables dans Docker (PostgreSQL).
*   **`npm run seed:demo`** :
    *   **Ce qu'elle fait** : Exécute le script `prisma/seed-demo.ts`.
    *   **Impact** : Remplit la base de données avec des candidats, recruteurs, offres d'emploi et génère des scores de matching.
*   **`npx prisma studio`** :
    *   **Ce qu'elle fait** : Ouvre une interface web (généralement sur `http://localhost:5555`) pour visualiser et modifier vos données graphiquement.

### Lancer le Backend
*   **Développement** : `npm run dev` (Utilise nodemon pour redémarrer à chaque changement).

---

## 🤖 AI Service (Intelligence Artificielle)

Allez dans le dossier `ai-service` : `cd ai-service`

1.  **Activer l'environnement virtuel (PowerShell)** :
    ```powershell
    .\venv\Scripts\Activate.ps1
    ```
2.  **Lancer le service** :
    ```powershell
    uvicorn main:app --reload --port 8002
    ```

---

## 💻 Frontend (Interface Utilisateur)

Allez dans le dossier `frontend` : `cd frontend`

*   **Lancer l'application** : `npm run dev`

---

## 🔑 Accès et Visualisation des Données

### Comment visualiser la base de données ?
Utilisez **Prisma Studio**. Tapez `npx prisma studio` dans le terminal du backend. Vous pourrez voir toutes les tables (`User`, `Profile`, `JobOffer`, etc.).

### Identifiants de test (Roles)

| Rôle | Email | Mot de passe |
| :--- | :--- | :--- |
| **Admin** | `admin@internlink.com` | `Admin1234!` |
| **Candidat** | `candidat@etudiant.com` | `Candidat1234!` |
| **Recruteur** | `recruiter.1@telnet.seed.internlink` | `Recruteur1234!` |

> [!IMPORTANT]
> Les emails et mots de passe sont **sensibles à la casse**. Respectez bien les majuscules (ex: `Admin1234!` avec un 'A' majuscule).

---

## 🚀 Procédure pour Activer TOUT le Projet (Maintenant)

Ouvrez **4 terminaux PowerShell** différents :

1.  **Terminal 1 (Docker)** :
    ```powershell
    cd docker
    docker-compose -f docker-compose.dev.yml up -d
    ```
2.  **Terminal 2 (Backend)** :
    ```powershell
    cd backend
    npm install  # (Si ce n'est pas déjà fait)
    npx prisma generate
    npx prisma db push
    npm run seed:demo # (Pour avoir des données de test)
    npm run dev
    ```
3.  **Terminal 3 (AI Service)** :
    ```powershell
    cd ai-service
    .\venv\Scripts\Activate.ps1
    uvicorn main:app --reload --port 8002
    ```
4.  **Terminal 4 (Frontend)** :
    ```powershell
    cd frontend
    npm run dev
    ```
