import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        // `text` kept for backward compatibility (single message).
        // `history` is the preferred shape: an array of { role: 'user'|'assistant', content: string }
        const { text, history } = req.body;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        let contents;

        if (Array.isArray(history) && history.length) {
            // Map our app's roles to Gemini's expected roles ('user' | 'model')
            contents = history.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: String(m.content || '') }]
            }));
        } else {
            contents = [{ role: 'user', parts: [{ text: String(text || '') }] }];
        }

        // NOTE: "gemini-3.6-flash" is not a real model id and will always fail.
        // gemini-2.5-flash is a current, stable, documented model that supports generateContent.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents
        });

        const aiReply = response.text;

        res.status(200).json({ reply: aiReply });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
}
