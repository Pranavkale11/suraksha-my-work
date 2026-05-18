# Deployment Guide

This guide provides instructions for deploying SuRaksha MAPS to production platforms like Vercel (Frontend) and Hugging Face Spaces (Backend).

## 1. Backend Deployment (Hugging Face Spaces)

We deploy the FastAPI backend on Hugging Face Spaces using the Docker SDK, which provides a free and robust environment for Python backends.

### Prerequisites
- A Hugging Face account (https://huggingface.co/).
- A MongoDB Atlas cluster.

### Steps
1. **Create a new Space on Hugging Face**: Go to [hf.co/spaces](https://huggingface.co/spaces) and click "Create new Space".
2. **Configure the Space**:
   - **Space name**: e.g., `suraksha-maps-backend`
   - **License**: Choose your preferred license.
   - **Select the Space SDK**: Choose **Docker** and select **Blank**.
   - **Space Hardware**: Free tier is sufficient.
   - Click **Create Space**.
3. **Upload the Backend Files**:
   Clone your new Space repository locally, then copy the contents of the `backend/` folder into the Space repository, including the `Dockerfile.hf`. 
   **Note**: Rename `Dockerfile.hf` to `Dockerfile` inside the Hugging Face repository so their builder recognizes it.
   ```bash
   git clone https://huggingface.co/spaces/<your-username>/<your-space-name>
   cd <your-space-name>
   cp -r /path/to/suraksha-maps-v4/backend/* .
   mv Dockerfile.hf Dockerfile
   git add .
   git commit -m "Initial commit for backend"
   git push
   ```
4. **Environment Variables (Secrets)**:
   In your Space Settings -> **Variables and secrets**, add the following **Secrets**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A strong, randomly generated string.
   - `ENVIRONMENT`: `production`
   - `BACKEND_CORS_ORIGINS`: `["*"]` (or later update to exactly `["https://your-frontend-url.vercel.app"]`)
5. **Deploy**: Hugging Face will automatically build the Docker image and start the FastAPI server on port 7860. The "Direct URL" to your backend will be `https://<your-username>-<your-space-name>.hf.space`.

## 2. Frontend Deployment (Vercel)

Vercel is an excellent platform for Vite/React applications.

### Prerequisites
- A Vercel account (https://vercel.com/).

### Steps
1. **Create a new Project on Vercel**: Import your `suraksha-maps-v4` repository.
2. **Framework Preset**: Vercel should automatically detect "Vite".
3. **Root Directory**: Set the root directory to `frontend`.
4. **Environment Variables**:
   Add the following variables:
   - `VITE_API_URL`: The Direct URL of your deployed Hugging Face backend (e.g., `https://<your-username>-<your-space-name>.hf.space`).
   - `VITE_DEMO_MODE`: `true` (if you want demo mode active).
5. **Deploy**: Click "Deploy". Vercel will build and host your application.

## 3. Post-Deployment
- Update your backend's `BACKEND_CORS_ORIGINS` secret on Hugging Face to exactly match your generated Vercel URL.
- Restart the Hugging Face Space from the settings to apply the new CORS variable.
- Test the application by registering a new user and uploading a file.
