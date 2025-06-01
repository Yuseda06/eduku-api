import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import getResponseRoute from "./routes/getResponse.js";
import getTranslationRoute from "./routes/getTranslation.js";
import getSentenceRoute from "./routes/getSentence.js";
import generateImageRoute from "./routes/generateImage.js";
import ttsRoute from "./routes/tts.js";
import pronounceRoute from "./routes/pronounce.js";
import getChoicesRoute from "./routes/getChoices.js";
import getQuizQuestionRoute from "./routes/getQuizQuestion.js";
import handleAlexaRoute from "./routes/handleAlexa.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Fix: Setup CORS betul
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "https://www.c3app.net" || "http://localhost:8081")
  .split(",")
  .map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());

// ✅ Route
app.use("/api/getResponse", getResponseRoute);
app.use("/api/getTranslation", getTranslationRoute);
app.use("/api/getSentence", getSentenceRoute);
app.use("/api/generateImage", generateImageRoute);
app.use("/api/tts", ttsRoute);
app.use("/api/pronounce", pronounceRoute);
app.use("/api/getChoices", getChoicesRoute);
app.use("/api/getQuizQuestion", getQuizQuestionRoute);
app.use("/api/handleAlexa", handleAlexaRoute);
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
