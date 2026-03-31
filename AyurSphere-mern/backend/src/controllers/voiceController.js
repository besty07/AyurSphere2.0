import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

export const handleVoiceInput = async (req, res) => {
  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!SARVAM_API_KEY || !OPENROUTER_API_KEY) {
      console.warn('API keys for Voice Assistant are missing.');
      return res.status(500).json({ error: 'Server configuration missing API keys' });
    }

    // STEP 1 & 2: STT (Speech to Text) via Sarvam AI
    const form = new FormData();
    form.append('file', fs.createReadStream(audioFile.path));

    const sttResponse = await axios.post(
      'https://api.sarvam.ai/speech-to-text',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${SARVAM_API_KEY}`,
        },
      }
    );

    const userText = sttResponse.data.text || sttResponse.data.transcript;
    if (!userText) {
      return res.status(400).json({ error: 'Could not transcribe audio' });
    }

    const targetLangCode = "en-IN";

    // STEP 3: LLM via OpenRouter
    const llmResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3-8b-instruct',
        messages: [
          {
            role: 'user',
            content: `You are an Ayurvedic health assistant.

IMPORTANT RULES:
- Reply ONLY in English
- Do NOT use Hindi or Marathi
- Keep response short and clear

Your job:
- Suggest Ayurvedic home remedies
- Use medicinal plants (Tulsi, Ginger, Turmeric, Mulethi, Neem, etc.)
- Give practical usage steps

Format:
• Problem: (1 line)
• Remedies:
  - Plant name + benefit
  - How to use it

Avoid generic advice. Be specific.

User: ${userText}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'AyurSphere MERN'
        }
      }
    );

    const botReply = llmResponse.data.choices[0]?.message?.content || 'Sorry, I couldn\'t process that right now.';

    // STEP 4: TTS (Text to Speech) via Sarvam AI
    const ttsResponse = await axios.post(
      'https://api.sarvam.ai/text-to-speech',
      {
        text: botReply,
        target_language_code: targetLangCode,
      },
      {
        headers: {
          Authorization: `Bearer ${SARVAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    const audioBase64 = Buffer.from(ttsResponse.data, 'binary').toString('base64');

    // Cleanup uploaded audio file
    fs.unlink(audioFile.path, err => {
      if (err) console.error('Failed to delete temp audio file:', err);
    });

    res.json({
      text: userText,
      reply: botReply,
      audio: audioBase64,
    });
  } catch (error) {
    console.error('Voice Assistant Error:', error?.response?.data || error.message);
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ error: 'Internal server error processing voice' });
  }
};
