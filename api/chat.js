export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Parse and extract message history
    const history = Array.isArray(req.body?.history)
      ? req.body.history
      : [{ role: "user", content: String(req.body?.text || "") }];

    // 2. Sanitize data and limit history size to prevent context/payload overflows
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
        content: m.content.slice(0, 12000) // Truncate individual massive inputs
      }))
      .slice(-10); // Keep only the latest 10 messages for conversational efficiency

    if (!messages.length) {
      return res.status(400).json({ error: "Please enter a message." });
    }

    const systemPrompt =
      "You are StudentX AI, a helpful assistant for students. Give accurate, clear, friendly and useful answers.";

    // --- PRIMARY PROVIDER: Google Gemini ---
    if (process.env.GEMINI_API_KEY) {
      try {
        const contents = messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));

        // Updated endpoint path to use the newer gemini-3.8-flash model
        const response = await fetch(
          "https://googleapis.com",
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
                // Note: Gemini 3+ deprecates several older config parameters. 
                // Using thinking_level control if deep reasoning balance is needed.
                thinking_level: "MEDIUM", 
                maxOutputTokens: 2048
              }
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error?.message || `Gemini HTTP ${response.status}`);
        }

        const reply = data?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("")
          .trim();

        if (reply) {
          return res.status(200).json({
            reply,
            provider: "gemini"
          });
        }
        
        throw new Error("Gemini returned an empty response.");
      } catch (error) {
        console.error("Gemini failed, trying fallback:", error.message);
      }
    }

    // --- FALLBACK PROVIDER: NVIDIA (Llama 3.3) ---
    if (process.env.NVIDIA_API_KEY) {
      try {
        const response = await fetch(
          "https://nvidia.com",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "meta/llama-3.3-70b-instruct",
              messages: [
                { role: "system", content: systemPrompt },
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

        const reply = data?.choices?.[0]?.message?.content?.trim();

        if (reply) {
          return res.status(200).json({
            reply,
            provider: "nvidia"
          });
        }
        
        throw new Error("NVIDIA returned an empty response.");
      } catch (error) {
        console.error("NVIDIA backup failed:", error.message);
      }
    }

    // --- NO PROVIDERS AVAILABLE OR ALL FAILED ---
    return res.status(502).json({
      error: "StudentX AI could not get a response.",
      details: "Check the Vercel function logs and API key environment variables."
    });

  } catch (error) {
    console.error("StudentX AI handler failed:", error);
    return res.status(500).json({
      error: "An internal server error occurred."
    });
  }
            }
