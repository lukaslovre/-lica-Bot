import { bot } from "./TelegramBotSetup.js";
import { OnTelegramMessageHandler } from "./OnTelegramMessageHandler.js";
import { config } from "dotenv";
import { initializeDatabase } from "./database/InitializeDb.js";

config();

initializeDatabase();

// Telegram bot message handler
bot.on("message", OnTelegramMessageHandler);
