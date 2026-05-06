# InternLink

InternLink is an intelligent platform designed to bridge the gap between students and recruiters. By leveraging Artificial Intelligence (AI), InternLink provides automated CV parsing, skill extraction, and advanced job matching to streamline the internship and job search process.

## 🚀 Key Features

### For Candidates
*   **AI-Powered CV Nexus**: Upload your CV and let the AI automatically parse your experience, extract skills, and generate a professional summary.
*   **Intelligent Job Matching**: Receive personalized job recommendations based on your extracted skills and profile data (Nexus Score).
*   **Dashboard & Tracking**: Track active applications, upcoming interviews, and profile views in a sleek, animated dashboard.
*   **AI Coaching**: Get daily tips and insights to improve your profile's attractiveness to recruiters.

### For Recruiters
*   **Smart Candidate Pipeline**: View candidates ranked by their match score against your specific job offers.
*   **Offer Management**: Create, publish, archive, and manage job offers through an intuitive Kanban-style interface.
*   **Analytics & Insights**: Track job performance, application trends, and conversion rates.

### For Administrators
*   **Global Oversight**: Manage the entire lifecycle of users, companies, and job offers.
*   **Moderation Tools**: Approve pending offers, soft-delete inappropriate content, and monitor platform health.

## 🏗️ Architecture & Tech Stack

InternLink is built using a modern, scalable full-stack architecture:

*   **Frontend (Client)**: 
    *   [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
    *   [TypeScript](https://www.typescriptlang.org/) for type safety
    *   [Tailwind CSS](https://tailwindcss.com/) for styling
    *   [GSAP](https://greensock.com/gsap/) & [Lenis](https://lenis.studiofreight.com/) for smooth animations and scrolling
    *   [Zustand](https://zustand-demo.pmnd.rs/) for global state management
*   **Backend (API Server)**: 
    *   [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
    *   [Prisma ORM](https://www.prisma.io/) for database access
    *   [PostgreSQL](https://www.postgresql.org/) with `pgvector` extension for storing and querying AI embeddings
    *   [Redis](https://redis.io/) for caching and session management
    *   [Socket.io](https://socket.io/) for real-time notifications and chat
*   **AI Service**: 
    *   Python-based microservice for NLP, CV parsing, and generating vector embeddings used in the matching algorithm.

## 📁 Project Structure

```text
InternLink/
├── frontend/             # React application (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route components (Dashboards, Auth, etc.)
│   │   ├── services/     # API integration layer (Axios)
│   │   ├── store/        # Zustand state stores
│   │   └── lib/          # Utilities, animations, and behaviors
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── modules/      # Feature-based modules (auth, users, applications)
│   │   ├── shared/       # Shared utilities, middlewares, and configs
│   │   └── server.ts     # Entry point
│   ├── prisma/           # Database schema and seed scripts
├── ai-service/           # Python AI microservice
```

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   [PostgreSQL](https://www.postgresql.org/) (with `pgvector` extension enabled)
*   [Redis](https://redis.io/) server running
*   [Python 3.9+](https://www.python.org/) (for the AI Service)

## ⚙️ Installation & Setup

### 1. Database & Environment Setup
1. Create a PostgreSQL database and ensure the `pgvector` extension is installed.
2. In the `backend` directory, duplicate `.env.example` to `.env` and update your connection strings:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/internlink_db"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="your_secure_jwt_secret"
   ```

### 2. Backend Setup
Navigate to the `backend` directory and install dependencies:
```bash
cd backend
npm install
```
Generate the Prisma client and push the schema to your database:
```bash
npm run prisma:generate
npx prisma db push
```
*(Optional)* Seed the database with demo data:
```bash
npm run seed:demo
```

### 3. Frontend Setup
Navigate to the `frontend` directory and install dependencies:
```bash
cd ../frontend
npm install
```
Create a `.env` file in the frontend directory:
```env
VITE_API_URL="http://localhost:3000/api"
```

### 4. AI Service Setup
Navigate to the `ai-service` directory, install requirements, and start the service according to its specific README instructions.

## 🚀 Running the Application

To run the application locally for development:

**Start the Backend API:**
```bash
cd backend
npm run dev
```
*The server will start on `http://localhost:3000`*

**Start the Frontend Client:**
```bash
cd frontend
npm run dev
```
*The React app will be accessible at `http://localhost:5173`*

## 🔒 Security & Authorization

InternLink uses Role-Based Access Control (RBAC). The platform distinguishes between three primary roles:
1.  **Candidate (`candidate`)**: Can manage their CV, apply to jobs, and view recommendations.
2.  **Recruiter (`recruiter`)**: Can manage job offers belonging to their company and review applicant profiles.
3.  **Administrator (`admin`)**: Can manage users, oversee the platform, and moderate job offers.

Authentication is handled securely via HTTP-only cookies containing JWT tokens.

## 📄 License

This project is proprietary and confidential. Unauthorized copying of these files, via any medium, is strictly prohibited.
