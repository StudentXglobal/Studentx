export default async function handler(req, res) {
    // Tabbatar ana tura tambaya ne ta POST
    if (req.method === 'POST') {
        const { text } = req.body;

        try {
            // Karbar API Key daga Vercel Environment Variables (Ba a fallasa shi ba)
            const ZAI_API_KEY = process.env.ZAI_API_KEY;

            // AN CANJA WANNAN LINK DIN DAGA v4 ZUWA v3
            const response = await fetch('https://open.bigmodel.cn/api/paas/v3/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ZAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'chatglm_turbo', // AN CANJA SHI ZUWA chatglm_turbo
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
