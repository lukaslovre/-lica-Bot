import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

const systemPrompt = `You are an AI assistant integrated within a Telegram bot. Your task is to help users who ask you questions. 
Your primary goals are to provide accurate, clear, and concise answers based on the user's query.

Reply in the same language as the user's query. The questinos will be in Croatian most of the time. (So if it's some balcanic language, reply in Croatian)

Do NOT use Markdown formatting in your responses, as Telegram does not support it.
`;

const promptText = "Here is an image! Please extract the neccessary information from it.";

export async function describeImage(fileUrl: string) {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: promptText },
          {
            type: "image_url",
            image_url: { url: fileUrl },
          },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message.content;
  const usedTokens = response.usage;

  console.log("Direct answer from the AI model: ", text);

  if (!text) {
    return "No response from the AI model.";
  }

  //   tu ako je error onda neki error protokol

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
    .catch((error) => {
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
