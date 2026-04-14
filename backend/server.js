const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const pdf = require("pdf-parse");

const app = express();
const upload = multer({ dest: "uploads/" });

// ✅ IMPORTANT for deployment (CORS safe)
app.use(cors({
  origin: "*"
}));

app.use(express.json());

app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    console.log("API HIT");

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const jd = req.body.jobDescription.toLowerCase();

    // 🔥 READ PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);

    const resumeText = data.text.toLowerCase();

    console.log("Resume length:", resumeText.length);

    const stopWords = [
  "and", "or", "the", "with", "a", "an", "to", "for", "in", "on",
  "developer", "experience", "skills", "knowledge"
];

const jdWords = jd
  .toLowerCase()
  .split(/\W+/)
  .filter(word => word.length > 2 && !stopWords.includes(word));

const extractedSkills = [...new Set(jdWords)];

    let matched = [];
    let missing = [];

    let score = 0;
    let total = extractedSkills.length;

    extractedSkills.forEach(skill => {
      if (resumeText.includes(skill)) {
        matched.push(skill);
        score++;
      } else {
        missing.push(skill);
      }
    });

    const finalScore = total === 0 ? 0 : Math.round((score / total) * 100);

    const suggestions = missing.map(
      skill => `Add ${skill} to your resume`
    );

    console.log("Score:", finalScore);

    res.json({
      fileName: req.file.originalname,
      score: finalScore,
      matched,
      missing,
      suggestions
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Parsing failed" });
  }
});

// ✅ THIS IS THE FIX (VERY IMPORTANT)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});