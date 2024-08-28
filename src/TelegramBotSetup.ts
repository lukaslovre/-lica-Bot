// import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";

// config(); // Load environment variables from .env file

const token = process.env.TELEGRAM_TOKEN as string;

// Create a bot that uses 'polling' to fetch new updates
export const bot = new TelegramBot(token, { polling: true });

//
// Utilities:
//

type SendMessageArguments = Parameters<TelegramBot["sendMessage"]>;

export const sendTelegramMessage: (
  chatId: SendMessageArguments[0],
  text: SendMessageArguments[1],
  options?: SendMessageArguments[2]
) => ReturnType<TelegramBot["sendMessage"]> = async (chatId, text, options) => {
  return await bot.sendMessage(chatId, text, options);
};
