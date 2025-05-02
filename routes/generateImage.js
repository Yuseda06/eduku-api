import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  const { description } = req.body;

  try {
    const image = await openai.images.generate({
      model: "dall-e-2",
      prompt: description,
      n: 1,
      size: "256x256",
    });

    const url = image.data[0].url;
    res.json({ url });
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: "Image generation failed." });
  }
});

export default router;
