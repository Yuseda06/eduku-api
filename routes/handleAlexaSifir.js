import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function randomNum() {
  return Math.floor(Math.random() * 11) + 2;
}

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

app.post("/", async (req, res) => {
  const body = req.body;
  const requestType = body.request?.type;
  const intentName = body.request?.intent?.name;
  const session = body.session || {};
  const attributes = session.attributes || {};

  let outputSpeech = "";
  let newSessionAttributes = { ...attributes };

  const children = {
    1: "Irfan",
    2: "Naufal",
    3: "Zakwan",
  };

  // Launch
  if (requestType === "LaunchRequest") {
    outputSpeech =
      "Welcome to Eduku Math Quiz! Please say your child's number. For example, say one for Irfan, two for Naufal, or three for Zakwan.";
  }

  // Select child
  else if (intentName === "SelectChildIntent") {
    const childNum = parseInt(body.request.intent?.slots?.child_number?.value);
    const childName = children[childNum];

    if (childName) {
      newSessionAttributes.childId = childNum;
      newSessionAttributes.childName = childName;
      outputSpeech = `Okay! Quiz will be for ${childName}. Say 'start quiz' to begin.`;
    } else {
      outputSpeech =
        "I didn't catch that. Say one for Irfan, two for Naufal, or three for Zakwan.";
    }
  }

  // Start quiz
  else if (intentName === "StartQuizIntent") {
    const childName = attributes.childName;
    if (!childName) {
      outputSpeech =
        "Please select a child first by saying one for Irfan, two for Naufal, or three for Zakwan.";
    } else {
      const a = randomNum();
      const b = randomNum();
      const correct = a * b;
      newSessionAttributes = { ...attributes, a, b, correctAnswer: correct };
      outputSpeech = `Alright ${childName}, what is ${a} times ${b}?`;
    }
  }

  // Answer intent
  else if (intentName === "AnswerIntent") {
    const userAnswer = parseInt(body.request.intent?.slots?.number?.value);
    const { a, b, correctAnswer, childId, childName } = attributes;

    if (!a || !b || !childId) {
      outputSpeech = "Please start the quiz first by saying 'start quiz'.";
    } else {
      if (userAnswer === correctAnswer) {
        const msg = randomCorrectResponse(a, b, correctAnswer);
        outputSpeech = `${msg} Say 'next question' to continue.`;

        try {
          await supabase.from("alexa_score").insert([
            { child_id: childId, score: 1, section: "math" },
          ]);
        } catch (e) {
          console.error("Insert error:", e);
        }
      } else {
        outputSpeech = `Oops! The correct answer is ${correctAnswer}. Say 'next question' to try another one.`;
      }
      newSessionAttributes = {
        ...attributes,
        a: null,
        b: null,
        correctAnswer: null,
      };
    }
  }

  // Next question
  else if (intentName === "NextQuestionIntent") {
    const { childName } = attributes;
    if (!childName) {
      outputSpeech =
        "Please select a child first by saying one for Irfan, two for Naufal, or three for Zakwan.";
    } else {
      const a = randomNum();
      const b = randomNum();
      const correct = a * b;
      newSessionAttributes = { ...attributes, a, b, correctAnswer: correct };
      outputSpeech = `Okay ${childName}, what is ${a} times ${b}?`;
    }
  }

  // Fallback
  else {
    outputSpeech =
      "Sorry, I didn’t get that. You can say 'start quiz' or 'next question'.";
  }

  const alexaResponse = {
    version: "1.0",
    sessionAttributes: newSessionAttributes,
    response: {
      outputSpeech: {
        type: "PlainText",
        text: outputSpeech,
      },
      shouldEndSession: false,
    },
  };

  res.json(alexaResponse);
});

app.get("/", (req, res) => {
  res.status(200).send("Eduku Alexa webhook is alive ✅");
});

export default app;
