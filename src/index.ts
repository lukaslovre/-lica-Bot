import type { Chat } from "node-telegram-bot-api";
import { bot } from "./TelegramBotSetup.js";
import { OnTelegramMessageHandler } from "./OnTelegramMessageHandler.js";
import { config } from "dotenv";

config();

// Telegram bot message handler
bot.on("message", OnTelegramMessageHandler);
