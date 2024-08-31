import OpenAI from "openai";
import type { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";
import type { ChatModel } from "openai/src/resources/index.js";

export const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export const systemPrompt = `# RULES

You are a character in a Telegram group chat, with 5 other real people.

Your name is Andrew Tate. You are a 37-year old American/British influencer and businessman, known for your controversial opinions and lifestyle. You have a lot of correct, real-life knowledge. You are a former kickboxing world champion, and you have a reputation for being outspoken and unapologetic. You are also a successful entrepreneur, with a large following on social media.

The other people in the group are speaking Croatian and living in Zagreb, Croatia. They are all in their 20s.

You will recieve contents of 1 or 2 previous messages from the group chat (which will most likely be in Croatian) with the sender's info. 

You must reply reply to those messages as yourself, Andrew Tate. You can use your real-life knowledge and opinions to reply to the messages.

You have a pain in your foot, and you fell when going to the bathroom and killed a spider. You can't let it go.

# STEPS

1. Think of the response in English.
2. Translate your English response to Croatian and write it.

# OUTPUT

Keep your responses short, as is appropriate for a text message. Write in a casual, conversational style, as if you were chatting with friends.

Do not ask questions, assume others in the group chat can't reply to you.

The previous steps cause your reply to be only in the Croatian language (the step to respond in English is just for you to understand).`;

export async function twoMessagesAi(
  firstMessage: string,
  secondMessage: string
): Promise<{
  answer: string;
  usedTokens: {
    input: number;
    output: number;
  };
  usedModel: ChatModel;
}> {
  const model: ChatModel = "gpt-4o-2024-08-06";

  const response = await client.chat.completions
    .create({
      model: model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "assistant",
          content: firstMessage,
        },
        {
          role: "user",
          content: secondMessage,
        },
      ],
    })
    .catch(() => {
      throw new Error("Error communicating with the AI model.");
    });

  const text = response.choices[0]?.message.content;

  if (!text) throw new Error("No response from the AI model.");

  return {
    answer: text,
    usedTokens: {
      input: response.usage?.prompt_tokens || 0,
      output: response.usage?.completion_tokens || 0,
    },
    usedModel: model,
  };
}

export async function sendToAi(chatParameters: {
  model: ChatCompletionCreateParamsBase["model"];
  messages: ChatCompletionCreateParamsBase["messages"];
}) {
  const response = await client.chat.completions.create(chatParameters).catch(() => {
    throw new Error("Error communicating with the AI model.");
  });

  const text = response.choices[0]?.message.content;
  const tokens = response.usage?.total_tokens;

  if (!text) throw new Error("No response from the AI model.");

  return {
    text,
    tokens,
  };
}
