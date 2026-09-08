export default async function handler(req, res) {
    // Tabbatar ana tura tambaya ne ta POST
    if (req.method === 'POST') {
        const { text } = req.body;

        try {
            // Karbar API Key daga Vercel Environment Variables (Ba a fallasa shi ba)
            const ZAI_API_KEY = process.env.ZAI_API_KEY;

            const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ZAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'glm-4-flash',
                    messages: [{ role: 'user', content: text }]
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
