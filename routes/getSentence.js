import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Make sentences in English for the following word: ${text}. Provide minimum 2 example sentences using simple words. Write the word ${text} in UPPERCASE and bold (**${text}**). Add a blank line between sentences.`,
        },
      ],
      stream: false,
    });

    const messageContent = response.choices[0].message.content;
    return res.json({ result: messageContent });
  } catch (error) {
    console.error("Error fetching sentence:", error);
    return res.status(500).json({ error: "Sentence generation failed." });
  }
});

export default router;
