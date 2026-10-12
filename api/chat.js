```javascript
export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "NVIDIA_API_KEY is missing in Vercel Environment Variables."
    });
  }

  try {
    const body = req.body || {};
    const history = Array.isArray(body.history)
      ? body.history
      : [];

    const messages = [
      {
        role: "system",
        content:
          "You are StudentX AI, the helpful AI assistant inside StudentX, a Nigerian student-focused platform. Answer accurately, clearly, and helpfully. Support students with learning, explanations, writing, research guidance, programming, and StudentX-related questions. Do not claim to have accessed private databases or performed actions you have not performed. Respond in the language the user uses, including English or Hausa."
      },
      ...history
        .filter(
          (item) =>
            item &&
            ["user", "assistant"].includes(item.role) &&
            typeof item.content === "string"
        )
        .slice(-20)
        .map((item) => ({
          role: item.role,
          content: item.content
        }))
    ];

    if (typeof body.text === "string" && body.text.trim()) {
      messages.push({
        role: "user",
        content: body.text.trim()
      });
    }

    if (messages.length === 1) {
      return res.status(400).json({
        error: "Please provide a message or conversation history."
      });
    }

    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          model: "meta/llama-3.3-70b-instruct",
          messages,
          max_tokens: 1024,
          temperature: 0.6,
          stream: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("NVIDIA API error:", response.status, data);

      return res.status(response.status >= 400 && response.status < 600
        ? response.status
        : 502
      ).json({
        error: "NVIDIA AI request failed.",
        details: data.detail || data.message || data.title ||
          "Check NVIDIA API access and Vercel logs."
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      console.error("Unexpected NVIDIA response:", data);

      return res.status(502).json({
        error: "NVIDIA returned an empty response."
      });
    }

    return res.status(200).json({
      reply: reply.trim(),
      provider: "nvidia"
    });
  } catch (error) {
    console.error("StudentX AI error:", error);

    return res.status(500).json({
      error: "StudentX AI encountered a server error."
    });
  }
}
```
  
