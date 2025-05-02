import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  const { subject, chapter, grade, level, model } = req.body;

  if (!subject || !chapter || !grade || !level || !model) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const prompt = `
      Please generate 11 multiple choice questions in JSON format for a ${level} student (Grade ${grade}) in Malaysia.

      Subject: ${subject}
      Chapter: ${chapter}

      If the subject is English, use English for the questions. Otherwise, use Bahasa Malaysia.

      The first question must be a brief explanation of the chapter, written as a list of key points.

      The output must strictly follow this format:
      {
        "questions": [
          {
            "question": "Chapter Explanation: [brief explanation here]",
            "options": [
              "1. Point 1",
              "2. Point 2",
              "3. Point 3"
            ]
          },
          {
            "question": "Apa maksud solat?",
            "options": [
              "Doa sebelum makan",
              "Perjalanan ke sekolah",
              "Ibadah khusus yang bermula dengan takbir dan tamat dengan salam",
              "Membaca buku agama"
            ],
            "answer": "Ibadah khusus yang bermula dengan takbir dan tamat dengan salam"
          }
        ]
      }

      "question": "Apa maksud solat?", this is only an example, do not include this in the output

      Do not include any explanation or extra text outside the JSON format.
      Keep the structure consistent for every request.
    `;

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });

    const messageContent = completion.choices?.[0]?.message?.content;
    console.log("✅ Quiz content generated.");

    return res.json({ result: messageContent });
  } catch (err) {
    console.error("❌ OpenAI Error:", err);
    return res.status(500).json({ error: "Failed to generate quiz." });
  }
});

export default router;
