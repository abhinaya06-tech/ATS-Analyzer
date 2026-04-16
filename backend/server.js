const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const pdf = require("pdf-parse");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors({ origin: "*" }));
app.use(express.json());

app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const jd = req.body.jobDescription.toLowerCase();

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);
    const resumeText = data.text.toLowerCase();

    // ================= SKILL DATABASE =================
    const skillDB = {
      core: ["react", "node", "javascript"],
      tools: ["docker", "aws", "git"],
      basics: ["html", "css"]
    };

    const weights = {
      core: 5,
      tools: 3,
      basics: 1
    };

    const synonyms = {
      js: "javascript",
      reactjs: "react",
      nodejs: "node",
      "node js": "node",
      "react js": "react"
    };

    function normalize(skill) {
      return synonyms[skill] || skill;
    }

    function isMatch(text, skill) {
      const s = normalize(skill);
      return text.includes(s) || text.includes(s.replace(" ", ""));
    }

    let matched = [];
    let missing = [];

    let score = 0;
    let total = 0;

    Object.keys(skillDB).forEach(category => {
      skillDB[category].forEach(skill => {
        total += weights[category];

        if (isMatch(resumeText, skill)) {
          matched.push(skill);
          score += weights[category];
        } else {
          missing.push(skill);
        }
      });
    });

    const finalScore = Math.round((score / total) * 100);const breakdown = {};

Object.keys(skillDB).forEach(category => {
  let categoryScore = 0;
  let categoryTotal = 0;

  skillDB[category].forEach(skill => {
    categoryTotal += weights[category];

    if (isMatch(resumeText, skill)) {
      categoryScore += weights[category];
    }
  });

  breakdown[category] = Math.round((categoryScore / categoryTotal) * 100);
});

    // ================= SMART FEEDBACK =================
    const aiFeedback = [
      `Strong in: ${matched.slice(0,3).join(", ")}`,
      `Missing important skills: ${missing.slice(0,3).join(", ")}`,
      finalScore > 75
        ? "Good match for this role"
        : finalScore > 50
        ? "Decent but needs improvement"
        : "Low match. Improve your resume significantly"
    ];
const explanation = {
  totalSkills: matched.length + missing.length,
  matchedCount: matched.length,
  missingCount: missing.length,
  message:
    finalScore > 75
      ? "Your resume strongly matches the job requirements."
      : finalScore > 50
      ? "Your resume partially matches but needs improvement."
      : "Your resume is not aligned with the job."
};
    res.json({
      fileName: req.file.originalname,
      score: finalScore,
      matched,
      missing,
      aiFeedback,
      explanation,
      breakdown
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Parsing failed" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});