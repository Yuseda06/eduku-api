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

// Allow CORS from specific domain (c3app.net)
app.use(cors({
  origin: "https://www.c3app.net",
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
