import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: random nombor antara 2–12
function randomNum() {
  return Math.floor(Math.random() * (12 - 2 + 1)) + 2;
}

// Helper: random response
function randomCorrectResponse(a, b, correctAnswer) {
  const responses = [
    `Correct! ${a} times ${b} equals ${correctAnswer}. Great job!`,
    `Nice! ${a} multiplied by ${b} is ${correctAnswer}. Keep it up!`,
    `You're right! ${a} times ${b} is ${correctAnswer}.`,
    `Excellent! The answer is ${correctAnswer}.`,
    `Spot on! ${a} times ${b} equals ${correctAnswer}.`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
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

  const children = {
    1: "Irfan",
    2: "Naufal",
    3: "Zakwan",
  };

  // 1️⃣ LaunchRequest
  if (requestType === "LaunchRequest") {
    response.response.outputSpeech.text =
      "Welcome to Eduku Math Quiz! Please say your child's number. For example, say one for Irfan, two for Naufal, or three for Zakwan.";
    return res.json(response);
  }

  // 2️⃣ SelectChildIntent
  if (intentName === "SelectChildIntent") {
    const childNum = parseInt(req.body.request.intent?.slots?.child_number?.value);
    const childName = children[childNum];

    if (childName) {
      response.sessionAttributes.childId = childNum;
      response.sessionAttributes.childName = childName;
      response.response.outputSpeech.text = `Okay! Quiz will be for ${childName}. Say 'start quiz' to begin.`;
    } else {
      response.response.outputSpeech.text =
        "I didn't catch that. Say one for Irfan, two for Naufal, or three for Zakwan.";
    }
    return res.json(response);
  }

  // 3️⃣ StartQuizIntent → generate random multiplication question
  if (intentName === "StartQuizIntent") {
    const childId = sessionAttr.childId;
    const childName = sessionAttr.childName;
    if (!childId || !childName) {
      response.response.outputSpeech.text =
        "Please select a child first by saying one for Irfan, two for Naufal, or three for Zakwan.";
      return res.json(response);
    }

    const a = randomNum();
    const b = randomNum();
    const correctAnswer = a * b;

    response.sessionAttributes.a = a;
    response.sessionAttributes.b = b;
    response.sessionAttributes.correctAnswer = correctAnswer;

    response.response.outputSpeech.text = `Alright ${childName}, what is ${a} times ${b}?`;
    return res.json(response);
  }

  // 4️⃣ AnswerIntent → check user's answer
  if (intentName === "AnswerIntent") {
    const userAnswer = parseInt(req.body.request.intent?.slots?.number?.value);
    const correctAnswer = parseInt(sessionAttr.correctAnswer);
    const a = sessionAttr.a;
    const b = sessionAttr.b;
    const childId = sessionAttr.childId;
    const childName = sessionAttr.childName;

    if (!a || !b || !childId) {
      response.response.outputSpeech.text =
        "Please start the quiz first by saying 'start quiz'.";
      return res.json(response);
    }

    if (userAnswer === correctAnswer) {
      const msg = randomCorrectResponse(a, b, correctAnswer);
      response.response.outputSpeech.text = `${msg} Say 'next question' to continue.`;

      try {
        await supabase.from("alexa_score").insert([
          {
            child_id: childId,
            score: 1,
            section: "math",
          },
        ]);
      } catch (e) {
        console.error("Insert score failed:", e);
      }
    } else {
      response.response.outputSpeech.text = `Oops! The correct answer is ${correctAnswer}. Say 'next question' to try another one.`;
    }

    // clear question
    response.sessionAttributes.a = null;
    response.sessionAttributes.b = null;
    response.sessionAttributes.correctAnswer = null;

    return res.json(response);
  }

  // 5️⃣ NextQuestionIntent → auto next
  if (intentName === "NextQuestionIntent") {
    const childName = sessionAttr.childName;
    if (!childName) {
      response.response.outputSpeech.text =
        "Please select a child first by saying one for Irfan, two for Naufal, or three for Zakwan.";
      return res.json(response);
    }

    const a = randomNum();
    const b = randomNum();
    const correctAnswer = a * b;

    response.sessionAttributes.a = a;
    response.sessionAttributes.b = b;
    response.sessionAttributes.correctAnswer = correctAnswer;

    response.response.outputSpeech.text = `Okay ${childName}, what is ${a} times ${b}?`;
    return res.json(response);
  }

  // 6️⃣ Fallback
  response.response.outputSpeech.text =
    "Sorry, I didn’t get that. You can say 'start quiz' or 'next question'.";
  return res.json(response);
});

router.get("/", (req, res) => {
  res.status(200).send("Eduku Math Quiz webhook is running fine.");
});

export default router;
