import { bot } from "./TelegramBotSetup.js";
import { OnTelegramMessageHandler } from "./OnTelegramMessageHandler.js";
import { config } from "dotenv";
import { initializeDatabase } from "./database/InitializeDb.js";

config();

initializeDatabase();

bot.setMyCommands([
  { command: "ask", description: "Ask a question to the AI model." },
  { command: "usage", description: "Get usage statistics." },
  {
    command: "procjena",
    description: "Ask the AI to evaluate if a message is stupid.",
  },
  {
    command: "cap",
    description: "Ask the AI to fact-check the tagged message.",
  },
]);

// Telegram bot message handler
bot.on("message", OnTelegramMessageHandler);
