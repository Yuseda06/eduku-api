// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import getResponseRoute from "./routes/getResponse.js";
import getTranslationRoute from "./routes/getTranslation.js";
import getSentenceRoute from "./routes/getSentence.js";
import generateImageRoute from "./routes/generateImage.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Support multiple origins via .env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "https://www.c3app.net")
  .split(",")
  .map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from browser or tools like Postman (no origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/getResponse", getResponseRoute);
app.use("/api/getTranslation", getTranslationRoute);
app.use("/api/getSentence", getSentenceRoute);
app.use("/api/generateImage", generateImageRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
