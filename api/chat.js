import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { text } = req.body;

        try {
            // Karbar API Key daga Vercel
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

            // Tura tambayar zuwa Gemini
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash', 
                contents: text,
            });

            // Karbar amsar
            const aiReply = response.text;

            res.status(200).json({ reply: aiReply });
        } catch (error) {
            console.error("Server Error:", error);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
