import { getSpendingForUser } from "../database/Spending.js";
import { sendTelegramMessage } from "../TelegramBotSetup.js";

export async function handleUsageCommand(chatId: number, userId: number) {
  try {
    const userUsage = await getSpendingForUser(userId);

    const userUsageSum = userUsage.reduce(
      (acc, current) => acc + current.amountDollars,
      0
    );

    return sendTelegramMessage(chatId, `$ ${userUsageSum.toFixed(4)}`);
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
