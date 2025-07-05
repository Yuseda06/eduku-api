import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import getResponseRoute from "./routes/getResponse.js";
import getTranslationRoute from "./routes/getTranslation.js";
import getSentenceRoute from "./routes/getSentence.js";
import generateImageRoute from "./routes/generateImage.js";
import getHadithsRoute from "./routes/getHadiths.js";
import ttsRoute from "./routes/tts.js";
import pronounceRoute from "./routes/pronounce.js";
import getChoicesRoute from "./routes/getChoices.js";
import getQuizQuestionRoute from "./routes/getQuizQuestion.js";
import handleAlexaRoute from "./routes/handleAlexa.js";
import getAlexaScoresRoute from "./routes/getAlexaScores.js";
import handleAlexaAnnounceScoresRoute from "./routes/handleAlexaAnnounceScores.js";
import handleMonkeyAnnounceScoresRoute from "./routes/handleMonkeyAnnounceScores.js";
import handleNovaAnnounceScoresRoute from "./routes/handleNovaAnnounceScores.js";
import handleAlexaAnnounceHadithRoute from "./routes/handleAlexaAnnounceHadith.js";

dotenv.config();

const app = express();

// ✅ CORS setup (boleh tweak ikut keperluan)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "https://www.c3app.net,http://localhost:8081")
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

// ✅ All routes here
app.use("/api/getResponse", getResponseRoute);
app.use("/api/getTranslation", getTranslationRoute);
app.use("/api/getSentence", getSentenceRoute);
app.use("/api/generateImage", generateImageRoute);
app.use("/api/tts", ttsRoute);
app.use("/api/pronounce", pronounceRoute);
app.use("/api/getChoices", getChoicesRoute);
app.use("/api/getQuizQuestion", getQuizQuestionRoute);
app.use("/api/handleAlexa", handleAlexaRoute);
app.use("/api/getAlexaScores", getAlexaScoresRoute);
app.use("/api/handleAlexaAnnounceScores", handleAlexaAnnounceScoresRoute);
app.use("/api/handleMonkeyAnnounceScores", handleMonkeyAnnounceScoresRoute);
app.use("/api/handleNovaAnnounceScores", handleNovaAnnounceScoresRoute);
app.use("/api/handleAlexaAnnounceHadith", handleAlexaAnnounceHadithRoute);
app.use("/api/getHadiths", getHadithsRoute);

export default app;
