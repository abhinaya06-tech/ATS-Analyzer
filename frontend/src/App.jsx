import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/upload"; // change when deployed

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
      const res = await axios.post(API_URL, formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: "Arial",
      background: "#eef2f7",
      minHeight: "100vh",
      padding: "30px"
    }}>
      
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        AI-Powered ATS Resume Analyzer
      </h1>

      {/* INPUT */}
      <div style={{
        maxWidth: "650px",
        margin: "auto",
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)"
      }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <br /><br />

        <textarea
          placeholder="Paste Job Description..."
          rows="8"
          style={{ width: "100%", padding: "12px" }}
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />

        <br /><br />

        <button onClick={handleSubmit} style={{
          width: "100%",
          padding: "14px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px"
        }}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {/* ✅ Loading Feedback */}
        {loading && (
          <p style={{ textAlign: "center", marginTop: "10px" }}>
            Processing resume...
          </p>
        )}

        {/* ✅ Empty State */}
        {!result && !loading && (
          <p style={{ textAlign: "center", marginTop: "10px", color: "gray" }}>
            Upload a resume to see analysis
          </p>
        )}
      </div>

      {/* RESULT */}
      {result && (
        <div style={{
          maxWidth: "650px",
          margin: "30px auto",
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)"
        }}>
          <h2>Analysis Result</h2>

          <p><b>File:</b> {result.fileName}</p>

          {/* SCORE BAR */}
          <div style={{ margin: "15px 0" }}>
            <b>Score: {result.score}%</b>
            <div style={{
              height: "10px",
              background: "#ddd",
              borderRadius: "5px",
              marginTop: "5px"
            }}>
              <div style={{
                width: `${result.score}%`,
                height: "100%",
                background:
                  result.score > 75 ? "green" :
                  result.score > 50 ? "orange" : "red"
              }} />
            </div>
          </div>

          {/* Score Meaning */}
          <p style={{ marginTop: "8px", fontWeight: "bold" }}>
            {result.score > 75
              ? "Excellent match 🔥"
              : result.score > 50
              ? "Moderate match ⚠️"
              : "Poor match ❌"}
          </p>

          {/* EXPLANATION */}
          <div>
            <h3>Score Explanation</h3>
            <p>{result.explanation.message}</p>
            <p>Matched: {result.explanation.matchedCount}</p>
            <p>Missing: {result.explanation.missingCount}</p>
          </div>

          {/* BREAKDOWN */}
          <div style={{ marginTop: "20px" }}>
            <h3>Skill Breakdown</h3>

            {result.breakdown && Object.keys(result.breakdown).map((key) => (
              <div key={key} style={{ marginBottom: "10px" }}>
                <b>{key.toUpperCase()}:</b> {result.breakdown[key]}%

                <div style={{
                  height: "8px",
                  background: "#ddd",
                  borderRadius: "5px",
                  marginTop: "4px"
                }}>
                  <div style={{
                    width: `${result.breakdown[key]}%`,
                    height: "100%",
                    background: "#2563eb",
                    borderRadius: "5px"
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* SKILLS */}
          <p>
            <b>Matched Skills:</b>{" "}
            {result.matched.length > 0 ? result.matched.join(", ") : "None"}
          </p>

          <p>
            <b>Missing Skills:</b>{" "}
            {result.missing.length > 0 ? result.missing.join(", ") : "None"}
          </p>

          {/* FEEDBACK */}
          <h3>Suggestions</h3>
          <ul>
            {result.aiFeedback.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;