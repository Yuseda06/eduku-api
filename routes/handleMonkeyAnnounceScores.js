import express from "express";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("alexa_score")
      .select("child_id, score");

    if (error || !data || data.length === 0) {
      return res.status(500).json({ error: "Failed to fetch scores" });
    }

    const scores = data.reduce((acc, row) => {
      const name = row.child_id?.toLowerCase();
      acc[name] = (acc[name] || 0) + (row.score ?? 0);
      return acc;
    }, {});

    const allScores = [
      { name: "Irfan", score: scores["irfan"] ?? 0 },
      { name: "Naufal", score: scores["naufal"] ?? 0 },
      { name: "Zakwan", score: scores["zakwan"] ?? 0 }
    ];

    const sorted = allScores.sort((a, b) => b.score - a.score);
    const [first, second, third] = sorted;

    const announcements = [
      `<speak>
        Whoa! <emphasis level="strong">${first.name}</emphasis> is on fire with <say-as interpret-as="cardinal">${first.score}</say-as> points! 
        Coming up next is ${second.name}, scoring a solid ${second.score}.
        ${third.name} isn’t far behind with ${third.score}, keep it up!
        <break time="400ms"/> You all are doing amazing, I’m super proud of your effort.
        Let's see who can top the chart next!
      </speak>`,

      `<speak>
        Hey hey hey! Here’s your quiz leaderboard update!
        ${first.name} leads the game with ${first.score} points.
        ${second.name} is chasing close behind with ${second.score}.
        ${third.name} is still in the game with ${third.score} points.
        Keep pushing and don’t stop now!
      </speak>`,

      `<speak>
        Alright quiz warriors! <emphasis level="moderate">${first.name}</emphasis> is smashing it with ${first.score} points!
        ${second.name} is giving a good fight with ${second.score}.
        ${third.name} has ${third.score} points and still got time to rise up!
        <break time="300ms"/> Team effort is strong – keep learning and keep playing!
        I'm cheering for each one of you!
      </speak>`,

      `<speak>
        Heads up team! It’s time for your score update!
        Top scorer goes to ${first.name} with ${first.score} points. 
        ${second.name} is still holding on with ${second.score}, and ${third.name} follows with ${third.score}.
        This is a tight race!
        Who’s gonna surprise me next round?
      </speak>`,

      `<speak>
        Ding ding ding! Score alert incoming!
        ${first.name} is blazing at the top with ${first.score} points.
        ${second.name} isn’t backing down with ${second.score}.
        ${third.name} keeps it steady at ${third.score}.
        Keep learning, keep shining!
      </speak>`
    ];

    const randomIndex = Math.floor(Math.random() * announcements.length);
    const ssml = announcements[randomIndex];

    const vmResponse = await axios.post(
      "https://webhooks.voicemonkey.io/catch/6a25a12af8d6de8275da7bdf1489511a/55f6c1bbef",
      {
        trigger: "announce_scores",
        announcement: ssml
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return res.status(200).json({
      message: "VoiceMonkey announcement triggered",
      vmResponse: vmResponse.data
    });

  } catch (err) {
    console.error("VoiceMonkey Trigger Error:", err.message);
    return res.status(500).json({ error: "Something went wrong", detail: err.message });
  }
});

export default router;
