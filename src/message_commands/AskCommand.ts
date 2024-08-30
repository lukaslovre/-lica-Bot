import { insertSpending } from "../database/Spending.js";
import { askQuestionAi } from "../OpenAi.js";
import { tokensToDollars } from "../OpenAi/tokensToDollars.js";
import { sendTelegramMessage } from "../TelegramBotSetup.js";

export async function handleAskCommand(
  chatId: number,
  userId: number,
  messageText: string
) {
  const questionForAi = messageText.slice("/ask ".length);

  if (!questionForAi) {
    return sendTelegramMessage(chatId, "No question provided.");
  }

  try {
    const { answer, usedTokens, usedModel } = await askQuestionAi(questionForAi);

    const cost = tokensToDollars(usedTokens, usedModel);

    insertSpending(userId, cost).catch((error) => {
      console.error("Error updating spending data in database:", error);
    });

    return sendTelegramMessage(chatId, answer);
  } catch (error) {
    return sendTelegramMessage(chatId, error as string);
  }
}
