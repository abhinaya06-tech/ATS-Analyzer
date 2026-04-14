import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file || !jd) {
      alert("Upload resume and enter job description");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jd);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/upload", formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: "Arial",
      background: "#f4f6f8",
      minHeight: "100vh",
      padding: "30px"
    }}>
      
      <h1 style={{ textAlign: "center" }}>ATS Resume Analyzer</h1>

      {/* CARD */}
      <div style={{
        maxWidth: "600px",
        margin: "30px auto",
        background: "white",
        padding: "25px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br /><br />

        <textarea
          placeholder="Paste Job Description"
          rows="8"
          style={{ width: "100%", padding: "10px" }}
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />

        <br /><br />

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "12px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div style={{
          maxWidth: "600px",
          margin: "20px auto",
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}>
          <h2>Result</h2>

          <p><b>File:</b> {result.fileName}</p>

          <p>
            <b>Score:</b>{" "}
            <span style={{
              color:
                result.score > 75 ? "green" :
                result.score > 50 ? "orange" :
                "red"
            }}>
              {result.score}%
            </span>
          </p>

          <p><b>Matched Skills:</b> {result.matched.join(", ")}</p>

          <p>
            <b>Missing Skills:</b>{" "}
            {result.missing.length > 0 ? result.missing.join(", ") : "None"}
          </p>

          {result.suggestions.length > 0 && (
            <>
              <h3>Suggestions</h3>
              <ul>
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;