
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
    const prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    const image =
      typeof body.image === "string"
        ? body.image
        : "";

    const mode = image ? "Image Editing" : "Image Generation";

    if (!prompt) {
      return res.status(400).json({
        error: "Please enter a description for your image."
      });
    }

    if (prompt.length > 10000) {
      return res.status(400).json({
        error: "Prompt is too long. Maximum 10000 characters."
      });
    }

    if (
      image &&
      !/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(image)
    ) {
      return res.status(400).json({
        error: "Please provide a valid base64 image."
      });
    }

    if (image && image.length > 4_000_000) {
      return res.status(413).json({
        error: "Image is too large. Please use a smaller image."
      });
    }

    const payload = {
      mode,
      prompt,
      height: 1024,
      width: 1024,
      cfg_scale: 0,
      samples: 1,
      seed: 0,
      steps: 4
    };

    if (image) {
      payload.image = [image];
    }

    const response = await fetch(
      "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "NVIDIA image API error:",
        response.status,
        data
      );

      return res.status(502).json({
        error: "NVIDIA image generation failed.",
        details:
          data.detail ||
          data.message ||
          data.title ||
          "Check NVIDIA API access and Vercel logs."
      });
    }

    let imageBase64 =
      data?.artifacts?.[0]?.base64 ||
      data?.data?.[0]?.b64_json;

    if (
      typeof imageBase64 !== "string" ||
      !imageBase64.trim()
    ) {
      console.error("Unexpected NVIDIA image response.");

      return res.status(502).json({
        error: "NVIDIA did not return an image in the expected format."
      });
    }

    const mimeType =
      data?.artifacts?.[0]?.mime_type || "image/png";

    if (!/^image\/(png|jpeg|webp)$/i.test(mimeType)) {
      return res.status(502).json({
        error: "NVIDIA returned an unsupported image format."
      });
    }

    return res.status(200).json({
      image: `data:${mimeType};base64,${imageBase64}`,
      provider: "nvidia",
      model: "black-forest-labs/flux.2-klein-4b",
      mode
    });
  } catch (error) {
    console.error("StudentX image generation error:", error);

    return res.status(500).json({
      error: "StudentX AI encountered a server error."
    });
  }
          }
