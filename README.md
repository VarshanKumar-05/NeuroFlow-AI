# NeuroFlow AI - Smart Traffic Management System

NeuroFlow AI is an advanced, real-time traffic monitoring and incident detection platform. This repository contains both the **FastAPI Backend** and the **React + Vite Frontend**.

## Prerequisites

Before running the project, make sure you have the following installed on your machine:
- **Node.js** (v18+)
- **Python** (v3.10+)

---

## 1. Starting the Backend

The backend is built with FastAPI and handles all the real-time data streaming (via WebSockets), AI vision pipelines, and REST APIs.

1. Open a new terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows:** `venv\Scripts\activate`
   - **Mac/Linux:** `source venv/bin/activate`

4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the backend server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

You will see logs indicating that the `uvicorn` server is running on `http://127.0.0.1:8000`. The backend includes a mock simulator that will automatically start broadcasting real-time traffic data over WebSockets!

---

## 2. Starting the Frontend

The frontend is a modern React application built with Vite, TailwindCSS, and Zustand for state management.

1. Open a **second** terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install the Node modules:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## Usage Guide

- **Login:** You can bypass the login screen by clicking the "Sign In" button (authentication is currently mocked for development).
- **Dashboard:** The dashboard is perfectly wired to the FastAPI backend. You will see live, real-time updates for Total Vehicles, Speeds, Congestion Scores, and an active stream of Incidents.
- **Vehicles & Cameras:** These pages fetch historical and configured data directly from the backend REST API.
- **Live Vision:** Simulates an AI computer vision feed using OpenCV.

## Deployment Notes

To deploy to a production environment (like Vercel, AWS, or Render), make sure you first build the frontend:
```bash
npm run build
```
The codebase has been fully verified—all TypeScript types and dependencies compile perfectly with zero errors.

Enjoy building with NeuroFlow AI!
