import TelegramBot from "node-telegram-bot-api";
import { sendTelegramMessage } from "./TelegramBotSetup.js";
import { askQuestionAi } from "./OpenAi.js";
import {
  getTokenSpendingForUser,
  insertTokenSpending,
} from "./database/TokenSpendingModel.js";
import { handleAskCommand } from "./message_commands/AskCommand.js";
import { handleUsageCommand } from "./message_commands/UsageCommand.js";

type TelegramOnListener = (
  message: TelegramBot.Message,
  metadata: TelegramBot.Metadata
) => any;

export const OnTelegramMessageHandler: TelegramOnListener = async (message, metadata) => {
  const chatId = message.chat.id;
  const userId = message.from?.id;

  if (!userId) return sendTelegramMessage(chatId, "User ID not found.");

  if (message.text) {
    if (message.text.startsWith("/ask ")) {
      return handleAskCommand(chatId, userId, message.text);
    }

    if (message.text.startsWith("/usage")) {
      return handleUsageCommand(chatId, userId);
    }
  }
};
