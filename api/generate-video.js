
export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
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

    const prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : "";

    const mode = image ? "image2video" : "text2video";

    if (!prompt && !image) {
      return res.status(400).json({
        error: "Enter a video description or upload an image."
      });
    }

    if (prompt.length > 20000) {
      return res.status(400).json({
        error: "Prompt is too long. Maximum 20000 characters."
      });
    }

    // Keep uploaded images small enough for a serverless request.
    if (image.length > 3_000_000) {
      return res.status(413).json({
        error: "Image is too large. Please use an image under 2 MB."
      });
    }

    if (
      image &&
      !/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i.test(image)
    ) {
      return res.status(400).json({
        error: "Upload a valid PNG, JPEG, or WebP image."
      });
    }

    // NVIDIA hosted Cosmos3-Nano API.
    const payload = {
      model_mode: mode,
      resolution: "480_16_9",
      num_frames: 25,
      num_inference_steps: 35,
      fps: 24,
      seed: Math.floor(Math.random() * 2147483647)
    };

    if (prompt) {
      payload.prompt = prompt;
    }

    if (image) {
      payload.input_reference = image;
    }

    const response = await fetch(
      "https://ai.api.nvidia.com/v1/cosmos/nvidia/cosmos3-nano",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    if (!response.ok) {
      console.error(
        "NVIDIA video API error:",
        JSON.stringify(
          {
            status: response.status,
            details: data
          },
          null,
          2
        )
      );

      return res.status(502).json({
        error: "NVIDIA video generation failed.",
        status: response.status,
        details:
          data?.detail ||
          data?.message ||
          data?.title ||
          "Check Vercel Function Logs."
      });
    }

    const videoBase64 = data?.b64_video;

    if (
      typeof videoBase64 !== "string" ||
      !videoBase64.trim()
    ) {
      console.error(
        "Unexpected NVIDIA video response:",
        JSON.stringify(data, null, 2)
      );

      return res.status(502).json({
        error: "NVIDIA did not return a video in b64_video."
      });
    }

    return res.status(200).json({
      video: `data:video/mp4;base64,${videoBase64}`,
      provider: "nvidia",
      model: "cosmos3-nano",
      mode
    });
  } catch (error) {
    console.error(
      "StudentX video generation error:",
      error?.stack || error?.message || error
    );

    return res.status(500).json({
      error: "StudentX AI encountered a server error."
    });
  }
}
