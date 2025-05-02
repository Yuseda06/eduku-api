import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  const { text } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: `Translate this to Malay: ${text}` }],
    });

    const result = completion.choices[0].message.content;
    res.json({ result });
  } catch (err) {
    console.error("❌ Translation Error:", err);
    res.status(500).json({ error: "Translation failed." });
  }
});

export default router;
