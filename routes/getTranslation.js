import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  const { word, translation } = req.body;

  if (!word || !translation) {
    return res.status(400).json({ error: "Missing word or translation" });
  }

  const prompt = `
Aku nak buat soalan kuiz Bahasa Inggeris untuk pelajar.

Perkataan: "${word}"
Maksud: "${translation}"

Tolong bagi dalam format JSON:
{
  "answer": "Jawapan betul",
  "choices": ["Jawapan betul", "Salah1", "Salah2", "Salah3"]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    });

    const text = response.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(400).json({ error: "Failed to parse response" });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return res.json(parsed);
  } catch (err) {
    console.error("Error generating choices:", err);
    return res.status(500).json({ error: "Failed to generate choices" });
  }
});

export default router;
