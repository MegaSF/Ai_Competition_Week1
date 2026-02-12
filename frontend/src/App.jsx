import { useState, useEffect } from "react";
import axios from "axios";
import Chart from "./components/Chart.jsx";

const API = "http://localhost:8000/api";

function App() {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");

  useEffect(() => {
    axios.get(`${API}/files`).then((res) => setFiles(res.data.files));
  }, []);

  const loadFile = (filename) => {
    if (!filename) {
      setSelectedFile("");
      setData([]);
      return;
    }
    setSelectedFile(filename);
    axios.get(`${API}/data/${filename}`).then((res) => setData(res.data));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await axios.post(`${API}/upload`, formData);
    const res = await axios.get(`${API}/files`);
    setFiles(res.data.files);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Weekly Fitness Tracker</h1>
      <p style={{ marginTop: "-0.5rem", color: "#4b5563" }}>
        Calories in vs. calories burned per week
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Upload File</h2>
        <input type="file" accept=".csv,.json" onChange={handleUpload} />
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Select File</h2>
        <select value={selectedFile} onChange={(e) => loadFile(e.target.value)}>
          <option value="">-- Choose a file --</option>
          {files.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </section>

      {data.length > 0 && <Chart data={data} />}
    </div>
  );
}

export default App;
