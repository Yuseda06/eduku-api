// pages/api/handleNovaAnnounceScores.ts
import { createClient } from "@supabase/supabase-js";
import { Readable } from "stream";
import axios from "axios";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const handler = async (req, res) => {
  try {
    // Sample TTS text (boleh ganti dengan dynamic markah)
    const ssml = `<speak>
      <amazon:emotion name="excited" intensity="high">
        Hebat! Irfan kini mendahului dengan 15 markah!
      </amazon:emotion>
      <break time="0.4s"/>
      Naufal dan Zakwan, teruskan usaha. Anda boleh kejar!
    </speak>`;

    // Call OpenAI TTS API
    const ttsRes = await axios.post(
      "https://api.openai.com/v1/audio/speech",
      {
        model: "tts-1-hd",
        input: ssml,
        voice: "nova",
        response_format: "mp3"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    const audioBuffer = Buffer.from(ttsRes.data);

    // Upload ke Supabase Storage
    const filename = `nova-score-${Date.now()}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from("tts") // folder "tts" dalam Supabase storage
      .upload(filename, Readable.from(audioBuffer), {
        contentType: "audio/mpeg",
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Generate public URL
    const { data: urlData } = supabase.storage
      .from("tts")
      .getPublicUrl(filename);

    return res.status(200).json({
      success: true,
      message: "TTS berjaya dijana dan dimuat naik.",
      audioUrl: urlData.publicUrl
    });
  } catch (err) {
    console.error("TTS Error:", err.message || err);
    return res.status(500).json({
      error: "Gagal jana suara.",
      detail: err.response?.data || err.message
    });
  }
};

export default handler;
