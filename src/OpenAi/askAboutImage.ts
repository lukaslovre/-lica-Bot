import { client } from "../OpenAi.js";
import type { ChatModel } from "openai/src/resources/index.js";

export async function askAboutImage(imageUrl: string, prompt: string, model: ChatModel) {
  const response = await client.chat.completions
    .create({
      model: model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Question related to the image.: ${prompt}`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    })
    .catch(() => {
      throw new Error("Error communicating with the AI model.");
    });

  const answer = response.choices[0]?.message.content;

  if (!answer) throw new Error("No response from the AI model.");

  return {
    answer: answer,
    usedTokens: {
      input: response.usage?.prompt_tokens || 0,
      output: response.usage?.completion_tokens || 0,
    },
    usedModel: model,
  };
}
