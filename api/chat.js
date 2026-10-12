
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const history = Array.isArray(req.body?.history)
      ? req.body.history
      : [{
          role: "user",
          content: String(req.body?.text || "")
        }];

    const messages = history
      .filter(
        (m) =>
          m &&
          ["user", "assistant"].includes(m.role) &&
          typeof m.content === "string" &&
          m.content.trim()
      )
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 12000)
      }));

    if (!messages.length) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    const systemPrompt =
      "You are StudentX AI, a helpful assistant for students. Give accurate, clear, friendly and useful answers.";

    if (process.env.GEMINI_API_KEY) {
      try {
        const contents = messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
              }
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error?.message || `Gemini HTTP ${response.status}`
          );
        }

        const reply = data?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("")
          .trim();

        if (!reply) {
          throw new Error("Gemini returned an empty response.");
        }

        return res.status(200).json({
          reply,
          provider: "gemini"
        });
      } catch (error) {
        console.error("Gemini failed:", error.message);
      }
    }

    if (process.env.NVIDIA_API_KEY) {
      try {
        const response = await fetch(
          "https://integrate.api.nvidia.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "meta/llama-3.3-70b-instruct",
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                ...messages
              ],
              temperature: 0.7,
              max_tokens: 2048,
              stream: false
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              data?.title ||
              data?.error?.message ||
              `NVIDIA HTTP ${response.status}`
          );
        }

        const reply =
          data?.choices?.[0]?.message?.content?.trim();

        if (!reply) {
          throw new Error("NVIDIA returned an empty response.");
        }

        return res.status(200).json({
          reply,
          provider: "nvidia"
        });
      } catch (error) {
        console.error("NVIDIA backup failed:", error.message);
      }
    }

    return res.status(502).json({
      error: "StudentX AI could not get a response.",
      details:
        "Check the Vercel function logs and API key environment variables."
    });
  } catch (error) {
    console.error("StudentX AI handler failed:", error);

    return res.status(500).json({
      error: "An internal server error occurred."
    });
  }
          }
