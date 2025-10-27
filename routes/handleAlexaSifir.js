import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to generate random number between 4–15
function randomNum() {
    return Math.floor(Math.random() * (12 - 4 + 1)) + 4;
}
router.post("/", async (req, res) => {
  const requestType = req.body.request?.type;
  const intentName = req.body.request?.intent?.name;
  const sessionAttr = req.body.session?.attributes ?? {};

  const response = {
    version: "1.0",
    response: {
      shouldEndSession: false,
      outputSpeech: {
        type: "PlainText",
        text: "",
      },
    },
    sessionAttributes: { ...sessionAttr },
  };

  // 1️⃣ LaunchRequest
  if (requestType === "LaunchRequest") {
    response.response.outputSpeech.text =
      "Welcome to Eduku Math Quiz! Say 'start quiz' to begin.";
    return res.json(response);
  }

  // 2️⃣ StartQuizIntent → generate random multiplication question
  if (intentName === "StartQuizIntent") {
    const a = randomNum();
    const b = randomNum();
    const correctAnswer = a * b;

    response.sessionAttributes.a = a;
    response.sessionAttributes.b = b;
    response.sessionAttributes.correctAnswer = correctAnswer;

    response.response.outputSpeech.text = `What is ${a} times ${b}?`;
    return res.json(response);
  }

  // 3️⃣ AnswerIntent → check user's answer
  if (intentName === "AnswerIntent") {
    const userAnswer = parseInt(req.body.request.intent?.slots?.number?.value);
    const correctAnswer = parseInt(sessionAttr.correctAnswer);
    const a = sessionAttr.a;
    const b = sessionAttr.b;

    if (!a || !b) {
      response.response.outputSpeech.text =
        "Please start the quiz first by saying 'start quiz'.";
      return res.json(response);
    }

    if (userAnswer === correctAnswer) {
      response.response.outputSpeech.text = `Correct! ${a} times ${b} equals ${correctAnswer}. Great job!`;

      try {
        await supabase.from("alexa_score").insert([
          {
            child_id: sessionAttr.childId ?? null,
            score: 1,
            section: "vocab",
          },
        ]);
      } catch (e) {
        console.error("Insert score failed:", e);
      }
    } else {
      response.response.outputSpeech.text = `Oops! The correct answer is ${correctAnswer}. Try another question by saying 'start quiz'.`;
    }

    // reset question
    response.sessionAttributes.a = null;
    response.sessionAttributes.b = null;
    response.sessionAttributes.correctAnswer = null;

    return res.json(response);
  }

  // 4️⃣ Fallback
  response.response.outputSpeech.text =
    "Sorry, I didn’t get that. Say 'start quiz' to begin.";
  return res.json(response);
});

router.get("/", (req, res) => {
  res.status(200).send("Alexa Math Quiz webhook is running.");
});

export default router;
