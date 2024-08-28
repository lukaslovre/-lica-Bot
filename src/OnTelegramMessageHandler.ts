import TelegramBot from "node-telegram-bot-api";
import { sendTelegramMessage } from "./TelegramBotSetup.js";
import { askQuestionAi } from "./OpenAi.js";
import { userData } from "./index.js";
import { updateUserData } from "./database/InitializeDb.js";

type TelegramOnListener = (
  message: TelegramBot.Message,
  metadata: TelegramBot.Metadata
) => any;

export const OnTelegramMessageHandler: TelegramOnListener = async (message, metadata) => {
  const chatId = message.chat.id;
  const userId = message.from?.id;

  if (!userId) {
    return sendTelegramMessage(chatId, "User ID not found.");
  }

  if (message.text) {
    if (message.text.startsWith("/ai ")) {
      const questionForAi = message.text.slice(4);

      try {
        const { answer, usedTokens } = await askQuestionAi(questionForAi);

        updateUsage(userId, usedTokens);

        return sendTelegramMessage(chatId, answer);
      } catch (error) {
        return sendTelegramMessage(chatId, error as string);
      }
    }

    if (message.text.startsWith("/usage")) {
      const userUsage = userData.find((user) => user.userId === userId);

      if (!userUsage) {
        return sendTelegramMessage(chatId, "No usage data found.");
      }

      const totalUsedTokens = userUsage.usage.reduce(
        (acc, usage) => {
          return {
            input: acc.input + usage.input,
            output: acc.output + usage.output,
          };
        },
        {
          input: 0,
          output: 0,
        }
      );

      const totalCost = costFromTokens(totalUsedTokens);

      return sendTelegramMessage(
        chatId,
        `Input: $${totalCost.input} (${totalUsedTokens.input} tokens)\nOutput: $${
          totalCost.output
        } tokens (${totalUsedTokens.output} tokens)\n\nTotal cost: $${
          totalCost.input + totalCost.output
        }`
      );
    }
  }
};

// extract
function updateUsage(
  userId: number,
  usedTokens: {
    input: number;
    output: number;
  }
) {
  let userUsage = userData.find((user) => user.userId === userId);

  if (!userUsage) {
    userData.push({ userId, usage: [usedTokens] });
    updateUserData({ userId, usage: [usedTokens] });
  } else {
    userUsage.usage.push(usedTokens);
    updateUserData(userUsage);
  }
}

function costFromTokens(usedTokens: { input: number; output: number }) {
  const inputPricePerMillion = 5;
  const outputPricePerMillion = 15;

  const inputPrice = (usedTokens.input / 1_000_000) * inputPricePerMillion;
  const outputPrice = (usedTokens.output / 1_000_000) * outputPricePerMillion;

  return {
    input: inputPrice,
    output: outputPrice,
  };
}
