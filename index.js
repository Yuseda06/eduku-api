import dotenv from "dotenv";
dotenv.config(); // WAJIB sebelum guna process.env

import express from "express";
import cors from "cors";

import getResponseRoute from "./routes/getResponse.js";
import getTranslationRoute from "./routes/getTranslation.js";
import getSentenceRoute from "./routes/getSentence.js";
import generateImageRoute from "./routes/generateImage.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS setup: hanya allow frontend domain & localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/getResponse", getResponseRoute);
app.use("/api/getTranslation", getTranslationRoute);
app.use("/api/getSentence", getSentenceRoute);
app.use("/api/generateImage", generateImageRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
