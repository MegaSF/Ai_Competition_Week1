# Data Visualization App

This project contains a React frontend and a FastAPI backend for visualizing CSV/JSON data.

## Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8000`.