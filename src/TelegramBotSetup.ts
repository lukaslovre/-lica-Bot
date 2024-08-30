import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";

config(); // Load environment variables from .env file

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

type SendPhotoArguments = Parameters<TelegramBot["sendPhoto"]>;

export const sendTelegramImage: (
  chatId: SendPhotoArguments[0],
  photo: SendPhotoArguments[1],
  options?: SendPhotoArguments[2],
  fileOptions?: SendPhotoArguments[3]
) => ReturnType<TelegramBot["sendPhoto"]> = async (
  chatId,
  photo,
  options?,
  fileOptions?
) => {
  return await bot.sendPhoto(chatId, photo, options, fileOptions);
};
