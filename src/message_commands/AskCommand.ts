import { insertTokenSpending } from "../database/TokenSpendingModel.js";
import { askQuestionAi } from "../OpenAi.js";
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
    const { answer, usedTokens } = await askQuestionAi(questionForAi);

    insertTokenSpending(userId, usedTokens.input, usedTokens.output).catch((error) => {
      console.error("Error updating usage data in database:", error);
    });

    return sendTelegramMessage(chatId, answer);
  } catch (error) {
    return sendTelegramMessage(chatId, error as string);
  }
}
