import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to generate random numbers for multiplication
function randomNum() {
  return Math.floor(Math.random() * 11) + 2;
}

// Helper for varied correct responses
function randomCorrectResponse(a, b, correctAnswer) {
  const responses = [
    `Correct! ${a} times ${b} equals ${correctAnswer}. Great job!`,
    `Nice! ${a} multiplied by ${b} is ${correctAnswer}. Keep it up!`,
    `You're right! ${a} times ${b} is ${correctAnswer}.`,
    `Excellent! The answer is ${correctAnswer}.`,
    `Spot on! ${a} times ${b} equals ${correctAnswer}.`,
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

  // 1. SelectChildIntent
  if (intentName === "SelectChildIntent") {
    const slotValue = req.body.request.intent?.slots?.child_number?.value;

    // Map numbers only (since using AMAZON.NUMBER)
    const childMap = {
      1: "Irfan",
      2: "Naufal",
      3: "Zakwan",
    };

    const selectedChild = childMap[slotValue];

    if (selectedChild) {
      response.sessionAttributes.childId = selectedChild;
      response.response.outputSpeech.text = `Alright! I've set the math quiz for ${selectedChild}. Say 'start quiz' to begin.`;
    } else {
      response.response.outputSpeech.text =
        "Sorry, I didn't get the number. Say 1 for Irfan, 2 for Naufal, or 3 for Zakwan.";
    }
    return res.json(response);
  }

  // 2. LaunchRequest
  if (requestType === "LaunchRequest") {
    response.response.outputSpeech.text =
      "Welcome to Eduku Math Quiz! Please select your child. Say 1 for Irfan, 2 for Naufal, or 3 for Zakwan.";
    return res.json(response);
  }

  // 3. StartQuizIntent or NextQuestionIntent
  if (
    requestType === "IntentRequest" &&
    (intentName === "StartQuizIntent" || intentName === "NextQuestionIntent")
  ) {
    const childId = sessionAttr.childId;

    if (!childId) {
      response.response.outputSpeech.text =
        "Please select a child first by saying 1 for Irfan, 2 for Naufal, or 3 for Zakwan.";
      return res.json(response);
    }

    const a = randomNum();
    const b = randomNum();
    const correctAnswer = a * b;

    response.sessionAttributes.a = a;
    response.sessionAttributes.b = b;
    response.sessionAttributes.correctAnswer = correctAnswer;

    response.response.outputSpeech.text = `What is ${a} times ${b}?`;
    return res.json(response);
  }

  // 4. AnswerIntent
  if (requestType === "IntentRequest" && intentName === "AnswerIntent") {
    const userAnswer = parseInt(req.body.request.intent?.slots?.number?.value);
    const correctAnswer = sessionAttr.correctAnswer;
    const a = sessionAttr.a;
    const b = sessionAttr.b;
    const childId = sessionAttr.childId;

    // If no child selected yet, treat this as child selection
    if (!childId && userAnswer >= 1 && userAnswer <= 3) {
      const childMap = {
        1: "Irfan",
        2: "Naufal",
        3: "Zakwan",
      };

      const selectedChild = childMap[userAnswer];
      response.sessionAttributes.childId = selectedChild;
      response.response.outputSpeech.text = `Alright! I've set the math quiz for ${selectedChild}. Say 'start quiz' to begin.`;
      return res.json(response);
    }

    if (!correctAnswer || !childId || !a || !b) {
      response.response.outputSpeech.text =
        "Please select a child and start a quiz first.";
    } else {
      if (userAnswer === correctAnswer) {
        const msg = randomCorrectResponse(a, b, correctAnswer);
        response.response.outputSpeech.text = `${msg} Say 'next question' or 'start quiz' for another question.`;

        try {
          await supabase.from("alexa_score").insert([
            {
              child_id: childId,
              score: 1,
              section: "sifir",
            },
          ]);
        } catch (e) {
          console.error("Failed to insert score:", e);
        }
      } else {
        response.response.outputSpeech.text = `Oops! The correct answer is ${correctAnswer}. Try another question by saying 'next question' or 'start quiz'.`;
      }
    }

    // Clear question data but keep childId
    response.sessionAttributes.a = null;
    response.sessionAttributes.b = null;
    response.sessionAttributes.correctAnswer = null;
    return res.json(response);
  }

  // 5. AMAZON.HelpIntent
  if (intentName === "AMAZON.HelpIntent") {
    response.response.outputSpeech.text =
      "This is Eduku Math Quiz. First, select your child by saying 1 for Irfan, 2 for Naufal, or 3 for Zakwan. Then say 'start quiz' to begin. I'll ask multiplication questions, and you answer with the number. Say 'next question' for another question. You can say 'stop' or 'cancel' to end the quiz anytime.";
    return res.json(response);
  }

  // 6. AMAZON.StopIntent or AMAZON.CancelIntent
  if (
    intentName === "AMAZON.StopIntent" ||
    intentName === "AMAZON.CancelIntent"
  ) {
    response.response.outputSpeech.text =
      "Thanks for practicing with Eduku Math Quiz. Goodbye!";
    response.response.shouldEndSession = true;
    response.sessionAttributes = {};
    return res.json(response);
  }

  // 7. AMAZON.NavigateHomeIntent
  if (intentName === "AMAZON.NavigateHomeIntent") {
    const childId = sessionAttr.childId;
    if (childId) {
      response.response.outputSpeech.text = `Welcome back to Eduku Math Quiz! Say 'start quiz' to continue with ${childId}.`;
      // Keep childId, clear question data
      response.sessionAttributes = { childId: childId };
    } else {
      response.response.outputSpeech.text =
        "Welcome back to Eduku Math Quiz! Please select your child. Say 1 for Irfan, 2 for Naufal, or 3 for Zakwan.";
      response.sessionAttributes = {};
    }
    return res.json(response);
  }

  // 8. AMAZON.FallbackIntent
  if (intentName === "AMAZON.FallbackIntent") {
    response.response.outputSpeech.text =
      "Sorry, I didn't understand that. Try saying 'start quiz' to begin, or say 'help' for instructions.";
    return res.json(response);
  }

  // 9. Default Fallback
  response.response.outputSpeech.text =
    "Sorry, I didn't understand that. Try saying 'start quiz' or 'help' for instructions.";
  return res.json(response);
});

router.get("/", (req, res) => {
  res.status(200).send("Eduku Math Quiz webhook is up and running.");
});

export default router;
