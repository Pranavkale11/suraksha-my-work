# SuRaksha MAPS v4.0

Complete project scaffold for "SuRaksha MAPS v4.0" with a React 18 + Vite frontend and a FastAPI backend with MongoDB Atlas cloud deployment.

## Architecture

```text
+-----------------------+           +------------------------+           +-------------------------+
|                       |           |                        |           |                         |
|  Frontend (React)     |   REST    |  Backend (FastAPI)     |   Motor   |  Database (MongoDB)     |
|  (Vercel)             | --------> |  (Railway/Render)      | --------> |  (Atlas Cluster)        |
|  Tailwind, shadcn/ui  |           |  JWT, ML embeddings    |           |                         |
|                       |           |                        |           |                         |
+-----------------------+           +------------------------+           +-------------------------+
```

## Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB Atlas Cluster

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```
Create `.env` file in the `backend` folder using `.env.example` as a reference. Ensure `MONGODB_URI` points to your cluster.

Start the backend:
```bash
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## MongoDB Atlas Setup Guide

To run the full hackathon demo features, you need an M10+ cluster on MongoDB Atlas running MongoDB 7.0+.

1. **Create an M10 Cluster**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an **M10 (Dedicated/Shared)** cluster. A free tier (M0) cannot run Python-triggered Vector Search Index creations.
2. **Network Access**: Under Security > Network Access, whitelist `0.0.0.0/0` (Allow Access from Anywhere) for the hackathon. 
3. **Database Access**: Create a new database user with the `readWrite` role.
4. **Connection String**: Copy your connection string and add it to `backend/.env`.

### Automated Setup & Seeding
Once your `.env` is configured, run the setup scripts in this exact order:

```bash
cd backend
# 1. Create collections, validators, standard indexes, and request Vector Search indexes
python setup_atlas.py

# 2. Wait for indexes to build and verify everything is working
python verify_atlas.py

# 3. Seed the database with mock users, circulars, MAPs, and 384-dim embeddings
python seed_database.py
```

## Deployment

### Frontend (Vercel)
- Push your repository to GitHub.
- Import the project into Vercel.
- Set the Root Directory to `frontend`.
- Add any required environment variables.
- Vercel will auto-detect Vite and deploy.

### Backend (Railway/Render)
- Connect your GitHub repository to Railway.
- Specify the Root Directory as `backend`.
- Ensure `railway.toml` handles the build and start commands.
- Add required environment variables including `MONGODB_URI`.
