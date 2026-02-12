# Data Visualization App: Build Instructions

Build a simple React frontend + Python backend app that visualizes data from CSV or JSON files.

---

## Architecture Overview

```
Frontend (React)  <-->  Backend (Python/FastAPI)  <-->  Data Files (CSV/JSON)
     |                         |
  Recharts                  Pandas
```

---

## Tech Stack

| Layer    | Technology        | Purpose                        |
|----------|-------------------|--------------------------------|
| Frontend | React + Vite      | Fast dev server, simple setup  |
| Charts   | Recharts          | Declarative React charts       |
| HTTP     | Axios             | API requests                   |
| Backend  | FastAPI           | Lightweight Python API         |
| Data     | Pandas            | CSV/JSON parsing               |

---

## Project Structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main component
│   │   ├── components/
│   │   │   └── Chart.jsx     # Reusable chart component
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── main.py               # FastAPI app
│   ├── requirements.txt
│   └── data/                 # Store CSV/JSON files here
│       └── sample.csv
└── README.md
```

---

## Backend Implementation

### 1. Create `backend/requirements.txt`

```
fastapi
uvicorn
pandas
python-multipart
```

### 2. Create `backend/main.py`

```python
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
        with open(filepath) as f:
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
```

### 3. Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Frontend Implementation

### 1. Create React App

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install axios recharts
```

### 2. Create `frontend/src/App.jsx`

```jsx
import { useState, useEffect } from "react";
import axios from "axios";
import Chart from "./components/Chart";

const API = "http://localhost:8000/api";

function App() {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");

  useEffect(() => {
    axios.get(`${API}/files`).then((res) => setFiles(res.data.files));
  }, []);

  const loadFile = (filename) => {
    setSelectedFile(filename);
    axios.get(`${API}/data/${filename}`).then((res) => setData(res.data));
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    await axios.post(`${API}/upload`, formData);
    axios.get(`${API}/files`).then((res) => setFiles(res.data.files));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Data Visualizer</h1>
      
      <section>
        <h2>Upload File</h2>
        <input type="file" accept=".csv,.json" onChange={handleUpload} />
      </section>

      <section>
        <h2>Select File</h2>
        <select value={selectedFile} onChange={(e) => loadFile(e.target.value)}>
          <option value="">-- Choose a file --</option>
          {files.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </section>

      {data.length > 0 && <Chart data={data} />}
    </div>
  );
}

export default App;
```

### 3. Create `frontend/src/components/Chart.jsx`

```jsx
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";

function Chart({ data }) {
  // Auto-detect keys from first data row
  const keys = Object.keys(data[0] || {});
  const xKey = keys[0];                          // First column = X axis
  const yKeys = keys.slice(1).filter(            // Remaining numeric columns = Y axis
    (k) => typeof data[0][k] === "number"
  );

  return (
    <div>
      <h2>Bar Chart</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {yKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={`hsl(${i * 60}, 70%, 50%)`} />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <h2>Line Chart</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {yKeys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={`hsl(${i * 60}, 70%, 50%)`} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Chart;
```

### 4. Run Frontend

```bash
cd frontend
npm run dev
```

---

## Sample Data

Create `backend/data/sample.csv`:

```csv
month,sales,expenses
Jan,4000,2400
Feb,3000,1398
Mar,2000,9800
Apr,2780,3908
May,1890,4800
Jun,2390,3800
```

---

## Verification Checklist

- [ ] Backend runs on `http://localhost:8000`
- [ ] Frontend runs on `http://localhost:5173`
- [ ] File list populates from backend
- [ ] Selecting a file loads data and renders charts
- [ ] Uploading a CSV/JSON adds it to the file list

---

## Key Design Decisions

1. **Recharts over D3**: Simpler React integration, less code
2. **FastAPI over Flask**: Built-in async, auto-docs at `/docs`
3. **Vite over CRA**: Faster builds, smaller config
4. **No state library**: App is simple enough for `useState`
5. **Auto-detect chart keys**: First column = X axis, numeric columns = Y series

---

## Extending the App

| Feature              | How to Add                                      |
|----------------------|-------------------------------------------------|
| Pie charts           | Import `PieChart` from Recharts                 |
| Data filtering       | Add filter controls, use `.filter()` on data    |
| Multiple chart types | Add toggle buttons to switch chart components   |
| Styling              | Add CSS or use Tailwind                         |
| Error handling       | Wrap API calls in try/catch, show error state   |
