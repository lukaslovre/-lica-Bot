import type { ImageGenerateParams, ImageModel } from "openai/src/resources/images.js";
import { client } from "../OpenAi.js";

export async function generateImage(prompt: string, model: ImageModel) {
  const generationOptions: ImageGenerateParams = {
    prompt: prompt,
    model: model,
    quality: "standard",
    response_format: "url",
    size: "1024x1024",
    style: "vivid",
  };
  const response = await client.images.generate(generationOptions);

  const url = response.data[0]?.url;
  const cost = calculateImageGenerationPriceFromOptions(generationOptions);

  if (!url) throw new Error("The url value is empty.");

  return { url, cost };
}

function calculateImageGenerationPriceFromOptions({
  model,
  quality,
  size,
}: ImageGenerateParams) {
  // Ručno unesene cijene sa OpenAI stranice

  if (model === "dall-e-2") {
    switch (size) {
      case "1024x1024":
        return 0.02;
      case "512x512":
        return 0.018;
      case "256x256":
        return 0.016;
    }
  }

  if (model === "dall-e-3") {
    if (quality === "standard") {
      switch (size) {
        case "1024x1024":
          return 0.04;
        case "1024x1792" || "1024x1792":
          return 0.08;
      }
    } else if (quality === "hd") {
      switch (size) {
        case "1024x1024":
          return 0.08;
        case "1024x1792" || "1024x1792":
          return 0.12;
      }
    }
  }

  throw new Error("Invalid model, quality, or size.");
}
