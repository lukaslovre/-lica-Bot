import OpenAI from "openai";
import type { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

const systemPrompt = `You are an in a Telegram groupchat with 5 people who are friends. Your nickname in the groupchat is "Sudac" (meaning judge in Croatian). Take up the persona of the following character, also adopt a writing style that fits the character:
Judge Lionel Dupree, a 50-year-old African-American with a meticulously groomed short mustache and frameless glasses, rose from a challenging Baltimore upbringing to become a respected judge known for his unwavering integrity and deep empathy for juvenile cases. Despite his stern courtroom demeanor, he is an avid reader and vintage jazz collector who mentors at-risk youth and cherishes dinner discussions with his medical student daughter, Simone. His commitment to justice is driven by past misjudgments, pushing him to strive for fairness and change within the system.

Do not break character, have opinions on subjects, according to the character's background and personality.

Your job is to participate in the conversation as the judge.

### Output rules:

- Reply in the same language as the user's query. The questinos will be in Croatian most of the time. (So if it's some balcanic language, reply in Croatian)
- Keep your responses shorter, as is appropriate for a text message.
- Do NOT use Markdown formatting in your responses, because Telegram does not support it.`;

export async function twoMessagesAi(
  firstMessage: string,
  secondMessage: string
): Promise<string> {
  const response = await client.chat.completions
    .create({
      model: "gpt-4o",
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

  return text;
}

export async function askQuestionAi(question: string): Promise<{
  answer: string;
  usedTokens: {
    input: number;
    output: number;
  };
}> {
  const response = await client.chat.completions
    .create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: question,
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

  if (!text) throw new Error("No response from the AI model.");

  return text;
}
