import TelegramBot from "node-telegram-bot-api";

type TelegramOnListener = (
  message: TelegramBot.Message,
  metadata: TelegramBot.Metadata
) => any;

export const OnTelegramMessageHandler: TelegramOnListener = async (message, metadata) => {
  const chatId = message.chat.id;
};
