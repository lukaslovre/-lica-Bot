import type { User } from "node-telegram-bot-api";
import { insertSpending } from "../database/Spending.js";
import { sendToAi, systemPrompt } from "../OpenAi.js";
import { tokensToDollars } from "../OpenAi/tokensToDollars.js";
import { sendTelegramMessage } from "../TelegramBotSetup.js";
import type { ChatModel } from "openai/resources/index.mjs";

export async function handleAskCommand(chatId: number, user: User, messageText: string) {
  const questionForAi = messageText.slice("/ask ".length);

  if (!questionForAi) {
    return sendTelegramMessage(chatId, "No question provided.");
  }

  try {
    // const { answer, usedTokens, usedModel } = await askQuestionAi(questionForAi);
    const model: ChatModel = "gpt-4o-2024-08-06";

    const { text, tokens } = await sendToAi({
      model: model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `${user.first_name.toUpperCase()}:\n\n${questionForAi}`,
        },
      ],
    });

    const cost = tokensToDollars(
      {
        input: 0,
        output: tokens || 0,
      },
      model
    );

    insertSpending(user.id, cost).catch((error) => {
      console.error("Error updating spending data in database:", error);
    });

    return sendTelegramMessage(chatId, text);
  } catch (error) {
    return sendTelegramMessage(chatId, error as string);
  }
}
