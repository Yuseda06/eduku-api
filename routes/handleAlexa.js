import express from "express";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper untuk shuffle pilihan
function shuffle(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

router.post("/", async (req, res) => {
  const requestType = req.body.request?.type;
  const intentName = req.body.request?.intent?.name;
  const sessionAttr = req.body.session?.attributes ?? {}; // FIXED here ✔️

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

  // 1. SelectChildIntent (guna child_number mapped to id)
  if (intentName === "SelectChildIntent") {
    const selectedChild =
      req.body.request.intent?.slots?.child_number?.resolutions?.resolutionsPerAuthority?.[0]?.values?.[0]?.value?.id;

    if (selectedChild) {
      response.sessionAttributes.childId = selectedChild;
      response.response.outputSpeech.text = `Alright! I've set the quiz for ${selectedChild}. Say 'start quiz' to begin.`;
    } else {
      response.response.outputSpeech.text = "Sorry, I didn't get the number. Say 1 for Irfan, 2 for Naufal, or 3 for Zakwan.";
    }
    return res.json(response);
  }

  // 2. LaunchRequest
  if (requestType === "LaunchRequest") {
    response.response.outputSpeech.text = "Welcome to Eduku Vocab! Say 'start quiz' to begin.";
    return res.json(response);
  }

  // 3. QuizIntent
  if (requestType === "IntentRequest" && intentName === "QuizIntent") {
    const childId = sessionAttr.childId;

    if (!childId) {
      response.response.outputSpeech.text = "Please select a child first by saying 1 for Irfan, 2 for Naufal, or 3 for Zakwan.";
      return res.json(response);
    }

    try {
      const quizRes = await fetch(`https://eduku-api.vercel.app/api/getQuizQuestion?child=${childId}`);
      const quizData = await quizRes.json();

      if (!quizData || !quizData.answer || !quizData.choices) {
        throw new Error("Invalid quiz format");
      }

      const shuffledChoices = shuffle(quizData.choices);
      const spelling = quizData.word.split('').join('-').toUpperCase();

      const correctIndex = shuffledChoices.findIndex(
        choice => choice.toLowerCase() === quizData.answer.toLowerCase()
      );
      const answerLetters = ['A', 'B', 'C', 'D'];
      const correctLetter = answerLetters[correctIndex];

      response.sessionAttributes.correctLetter = correctLetter;
      response.sessionAttributes.correctAnswer = quizData.answer;
      response.sessionAttributes.choices = shuffledChoices;

      response.response.outputSpeech.text =
        `Spell this word: ${spelling}. ${quizData.question} Your options are: ` +
        `A, ${shuffledChoices[0]}; B, ${shuffledChoices[1]}; C, ${shuffledChoices[2]}; D, ${shuffledChoices[3]}. What's your answer?`;

    } catch (err) {
      console.error("QuizIntent error:", err);
      response.response.outputSpeech.text = "Sorry, I couldn't load the question. Please try again later.";
    }

    return res.json(response);
  }

  // 4. AnswerIntent
  if (requestType === "IntentRequest" && intentName === "AnswerIntent") {
    const userAnswer = req.body.request.intent?.slots?.option?.value;
    const correctLetter = sessionAttr.correctLetter;
    const correctAnswer = sessionAttr.correctAnswer;
    const childId = sessionAttr.childId;

    if (!correctLetter || !childId) {
      response.response.outputSpeech.text = "Please start a quiz first.";
    } else {
      const userLetter = userAnswer?.toLowerCase();
      const correct = correctLetter.toLowerCase();

      if (userLetter === correct) {
        response.response.outputSpeech.text = "Correct! You earned 1 point. Say 'start quiz' for another question.";
        try {
          await supabase.from("alexa_score").insert([
            {
              child_id: childId,
              score: 1,
              section: "vocab",
            },
          ]);
        } catch (e) {
          console.error("Supabase insert error:", e);
        }
      } else {
        response.response.outputSpeech.text = `Oops, the correct answer is ${correctAnswer}. Try another question by saying 'start quiz'.`;
      }
    }

    // Clear session after answer
    response.sessionAttributes.correctLetter = null;
    response.sessionAttributes.correctAnswer = null;
    response.sessionAttributes.choices = null;
    return res.json(response);
  }

  // 5. Fallback
  response.response.outputSpeech.text = "Sorry, I didn't understand that. Try saying 'start quiz'.";
  return res.json(response);
});

router.get("/", (req, res) => {
  res.status(200).send("Alexa webhook is up and running.");
});

export default router;
