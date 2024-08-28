// import Express from "express";
import { bot } from "./TelegramBotSetup.js";
import { OnTelegramMessageHandler } from "./OnTelegramMessageHandler.js";
import type { Chat } from "node-telegram-bot-api";
import type { Receipt } from "./Classes/Receipt.js";

// Create a new express application instance
// const app = Express();

// Middleware to parse JSON requests
// app.use(Express.json());

export const chatStates = new Map<Chat["id"], Receipt>();

// Telegram bot message handler
bot.on("message", OnTelegramMessageHandler);

bot.on("callback_query", (query) => {
  console.log(query);

  bot.answerCallbackQuery(query.id, {
    text: "Rolling a dice...",
  });
});

// The port the express app will listen on
// const port = 3000;

// Start the Express server
// app.listen(port, () => {
//   console.log(`server started at http://localhost:${port}`);
// });
