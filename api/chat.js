export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { text } = req.body;

        try {
            const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

            // AN CANJA SUNAN MODEL ZUWA gemini-pro
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text }] }]
                })
            });

            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: 'Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
