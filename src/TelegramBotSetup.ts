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
) => Promise<void> = async (chatId, text, options) => {
  await bot.sendMessage(chatId, text, options);
};

// MOŽDA ZATREBA KASNIJE

// const usersThatReciveErrorReports =
//   process.env.USERS_THAT_RECIVE_ERROR_REPORTS?.split(",").filter(Boolean) || [];

// Jel ovo sranje smiješno?
// export const sendToSubscribedUsers = async (text: SendMessageArguments[1]) => {
//   try {
//     for (const user of usersThatReciveErrorReports) {
//       await sendTelegramMessage(user, text);
//     }
//   } catch (error) {
//     console.error("Error sending message to subscribed users", error);
//     sendToSubscribedUsers(text);
//   }
// };
