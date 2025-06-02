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

// Shuffle function
function shuffle(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

router.post("/", async (req, res) => {
  const requestType = req.body.request?.type;
  const intentName = req.body.request?.intent?.name;
  const session = req.body.session || {};

  const response = {
    version: "1.0",
    response: {
      shouldEndSession: false,
      outputSpeech: {
        type: "PlainText",
        text: "",
      },
    },
    sessionAttributes: {},
  };

  // Handle user selects a child
  if (intentName === "SelectChildIntent") {
    const selectedChild = req.body.request.intent?.slots?.child?.value?.toLowerCase();
    const validChildren = ["irfan", "naufal", "zakwan"];

    if (validChildren.includes(selectedChild)) {
      response.sessionAttributes.childId = selectedChild;
      response.response.outputSpeech.text = `Okay, I've set this quiz for ${selectedChild}. Say start quiz to begin.`;
    } else {
      response.response.outputSpeech.text = "Sorry, I didn't recognize that name. Please say Irfan, Naufal, or Zakwan.";
    }

    return res.json(response);
  }

  // Welcome message
  if (requestType === "LaunchRequest") {
    response.response.outputSpeech.text = "Welcome to Eduku Vocab! Say 'start quiz' to begin.";
    return res.json(response);
  }

  // Start quiz
  if (requestType === "IntentRequest" && intentName === "QuizIntent") {
    try {
      const quizRes = await fetch("https://eduku-api.vercel.app/api/getQuizQuestion");
      const quizList = await quizRes.json();
      const quiz = Array.isArray(quizList)
        ? quizList[Math.floor(Math.random() * quizList.length)]
        : quizList;

      if (!quiz || !quiz.answer || !quiz.choices) throw new Error("Incomplete quiz data from API.");

      const choices = Array.isArray(quiz.choices) ? quiz.choices : JSON.parse(quiz.choices);
      const shuffledChoices = shuffle(choices);
      const spelling = quiz.word?.split("").join("-").toUpperCase();

      response.sessionAttributes.correctAnswer = quiz.answer;
      response.sessionAttributes.choices = shuffledChoices;
      response.sessionAttributes.word = quiz.word;
      response.sessionAttributes.childId = session.attributes?.childId ?? null;

      response.response.outputSpeech.text =
        `Spell this word: ${spelling}. What is the meaning of "${quiz.word}"? ` +
        `Your options are: A, ${shuffledChoices[0]}; B, ${shuffledChoices[1]}; C, ${shuffledChoices[2]}; D, ${shuffledChoices[3]}. What's your answer?`;

    } catch (err) {
      console.error("QuizIntent error:", err);
      response.response.outputSpeech.text = "Sorry, I couldn't load the question. Please try again later.";
    }

    return res.json(response);
  }

  // Answer check
  if (requestType === "IntentRequest" && intentName === "AnswerIntent") {
    const userAnswer = req.body.request.intent?.slots?.option?.value;
    const correct = session.attributes?.correctAnswer;
    const choices = session.attributes?.choices;
    const childId = session.attributes?.childId;

    const optionMap = { a: 0, b: 1, c: 2, d: 3 };
    const index = optionMap[userAnswer?.toLowerCase()];
    const chosenAnswer = choices?.[index];

    if (!correct || !choices || !childId) {
      response.response.outputSpeech.text = "Please select a child and start a quiz first.";
    } else if (chosenAnswer?.toLowerCase() === correct.toLowerCase()) {
      response.response.outputSpeech.text = "Correct! You earned 1 point. Say 'start quiz' for another question.";

      // Save to Supabase
      try {
        await supabase.from("child_scores").insert({
          child_id: childId,
          score: 1,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.error("❌ Failed to insert score:", e.message);
      }
    } else {
      response.response.outputSpeech.text = `Oops, the correct answer is ${correct}. Try another question by saying 'start quiz'.`;
    }

    response.sessionAttributes.correctAnswer = null;
    response.sessionAttributes.choices = null;
    return res.json(response);
  }

  // Fallback
  response.response.outputSpeech.text = "Sorry, I didn't understand that. Try saying 'start quiz'.";
  return res.json(response);
});

router.get("/", (req, res) => {
  res.status(200).send("Alexa webhook is up and running.");
});

export default router;
