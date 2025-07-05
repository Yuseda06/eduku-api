import express from "express";
import dotenv from "dotenv";
import e from "express";


dotenv.config();
const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const response = await fetch('https://random-hadith-generator.vercel.app/muslim/');
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Error fetching hadith:", error);
    return res.status(500).json({ error: "Hadith generation failed." });
  }
});

export default router;  