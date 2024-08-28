import { bot } from "./TelegramBotSetup.js";
import { OnTelegramMessageHandler } from "./OnTelegramMessageHandler.js";
import { config } from "dotenv";
import { getUserData, initializeDatabase } from "./database/InitializeDb.js";

config();

export let userData: UserData[] = [];

initializeDatabase().then(() => {
  getUserData().then((data) => {
    userData = data;
  });
});

// Telegram bot message handler
bot.on("message", OnTelegramMessageHandler);
