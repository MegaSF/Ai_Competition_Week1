from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"

@app.get("/api/data/{filename}")
def get_data(filename: str):
    """Load CSV or JSON file and return as JSON."""
    filepath = DATA_DIR / filename

    if filepath.suffix == ".csv":
        df = pd.read_csv(filepath)
        return df.to_dict(orient="records")
    elif filepath.suffix == ".json":
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    return {"error": "Unsupported file type"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a CSV or JSON file."""
    content = await file.read()
    save_path = DATA_DIR / file.filename
    save_path.write_bytes(content)
    return {"filename": file.filename, "status": "uploaded"}

@app.get("/api/files")
def list_files():
    """List available data files."""
    files = [f.name for f in DATA_DIR.glob("*") if f.suffix in [".csv", ".json"]]
    return {"files": files}
