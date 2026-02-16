import { useState, useEffect } from "react";
import axios from "axios";
import Chart from "./components/Chart.jsx";

const API = "http://localhost:8000/api";

function App() {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setError(null);
      const res = await axios.get(`${API}/files`);
      setFiles(res.data.files);
    } catch (err) {
      setError("Failed to load file list. Is the backend running?");
    }
  };

  const loadFile = async (filename) => {
    if (!filename) {
      setSelectedFile("");
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    setSelectedFile(filename);
    try {
      const res = await axios.get(`${API}/data/${filename}`);
      if (Array.isArray(res.data)) {
        setData(res.data);
      } else if (res.data.error) {
        setError(`File error: ${res.data.error}`);
        setData([]);
      } else {
        setError("Invalid data format from server");
        setData([]);
      }
    } catch (err) {
      setError(`Failed to load data for "${filename}"`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axios.post(`${API}/upload`, formData);
      await fetchFiles();
    } catch (err) {
      setError("Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Weekly Fitness Tracker</h1>
      <p style={{ marginTop: "-0.5rem", color: "#4b5563" }}>
        Calories in vs. calories burned per week
      </p>

      {error && (
        <div style={{
          marginBottom: "1rem",
          padding: "0.75rem 1rem",
          background: "#fee2e2",
          color: "#dc2626",
          borderRadius: "0.375rem",
          border: "1px solid #fecaca"
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div style={{ marginBottom: "1rem", color: "#6b7280" }}>
          Loading...
        </div>
      )}

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Upload File</h2>
        <input
          type="file"
          accept=".csv,.json"
          onChange={handleUpload}
          disabled={loading}
        />
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Select File</h2>
        <select
          value={selectedFile}
          onChange={(e) => loadFile(e.target.value)}
          disabled={loading}
        >
          <option value="">-- Choose a file --</option>
          {files.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </section>

      {data.length > 0 && !loading && <Chart data={data} />}
    </div>
  );
}

export default App;
