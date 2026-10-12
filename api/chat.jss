export default async function handler(req, res) {
if (req.method !== "POST") {
res.setHeader("Allow", "POST");
return res.status(405).json({
error: "Method not allowed"
});
}

const history = Array.isArray(req.body?.history)
? req.body.history
: [
{
role: "user",
content: String(req.body?.text || "")
}
];

const messages = history
.filter(
(message) =>
message &&
["user", "assistant"].includes(message.role) &&
typeof message.content === "string" &&
message.content.trim().length > 0
)
.map((message) => ({
role: message.role,
content: message.content.slice(0, 12000)
}));

if (!messages.length) {
return res.status(400).json({
error: "Please enter a message."
});
}

const errors = [];

// PRIMARY PROVIDER: GOOGLE GEMINI
if (process.env.GEMINI_API_KEY) {
try {
const contents = messages.map((message) => ({
role: message.role === "assistant" ? "model" : "user",
parts: [{ text: message.content }]
}));

```
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "You are StudentX AI, a helpful assistant for students. Give accurate, clear, friendly and useful answers."
            }
          ]
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
      data?.error?.message ||
      `Gemini HTTP ${response.status}`
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
  errors.push("Gemini: " + error.message);
}
```

} else {
errors.push("GEMINI_API_KEY is missing.");
}

// BACKUP PROVIDER: NVIDIA
if (process.env.NVIDIA_API_KEY) {
try {
const response = await fetch(
"https://integrate.api.nvidia.com/v1/chat/completions",
{
method: "POST",
headers: {
"Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
"Content-Type": "application/json"
},
body: JSON.stringify({
model: "meta/llama-3.3-70b-instruct",
messages: [
{
role: "system",
content: "You are StudentX AI, a helpful assistant for students. Give accurate, clear, friendly and useful answers."
},
...messages
],
temperature: 0.7,
max_tokens: 2048,
stream: false
})
}
);

```
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

  if (!reply) {
    throw new Error("NVIDIA returned an empty response.");
  }

  return res.status(200).json({
    reply,
    provider: "nvidia"
  });
} catch (error) {
  console.error("NVIDIA backup failed:", error.message);
  errors.push("NVIDIA: " + error.message);
}
```

} else {
errors.push("NVIDIA_API_KEY is missing.");
}

console.error("All StudentX AI providers failed:", errors);

return res.status(502).json({
error: "StudentX AI could not get a response from either provider.",
details: errors
});
  }
