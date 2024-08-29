import { getTokenSpendingForUser } from "../database/TokenSpendingModel.js";
import { sendTelegramMessage } from "../TelegramBotSetup.js";

export async function handleUsageCommand(chatId: number, userId: number) {
  try {
    const userUsage = await getTokenSpendingForUser(userId);

    const summedUsage = userUsage.reduce(
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

    const totalCost = costFromTokens(summedUsage);

    return sendTelegramMessage(
      chatId,
      `Input: $${totalCost.input} (${summedUsage.input} tokens)\nOutput: $${
        totalCost.output
      } tokens (${summedUsage.output} tokens)\n\nTotal cost: $${
        totalCost.input + totalCost.output
      }`
    );
  } catch (error) {
    return sendTelegramMessage(chatId, "Error fetching usage data.");
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
