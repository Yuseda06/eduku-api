// pages/api/getChoices.js
import { openai } from "@/utils/openaiClient"; // ikut setup hang

export default async function handler(req, res) {
  const { word, translation } = req.body;

  const prompt = `
Aku nak buat soalan kuiz Bahasa Inggeris.

Perkataan: "${word}"
Maksud sebenar: "${translation}"

Bagi aku jawapan betul dan 3 pilihan salah dalam format JSON:
{
  "answer": "Jawapan Betul",
  "choices": ["Betul", "Salah1", "Salah2", "Salah3"]
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    const responseText = completion.choices[0].message.content;
    const match = responseText.match(/\{[\s\S]*\}/);

    if (!match) return res.status(400).json({ error: "Invalid response format" });

    const json = JSON.parse(match[0]);
    res.status(200).json(json);
  } catch (err) {
    console.error("getChoices error", err);
    res.status(500).json({ error: "Failed to generate choices" });
  }
}
