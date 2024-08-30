import TelegramBot from "node-telegram-bot-api";
import { sendTelegramMessage } from "./TelegramBotSetup.js";
import { askQuestionAi, sendToAi, twoMessagesAi } from "./OpenAi.js";

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
      if (message.reply_to_message?.text) {
        const replyToMessage = message.reply_to_message.text;
        const question = message.text.replace("/ask ", "");

        try {
          const response = await twoMessagesAi(replyToMessage, question);
          return sendTelegramMessage(chatId, response);
        } catch (error) {
          console.error(error);
          return sendTelegramMessage(chatId, "Error: " + error);
        }
      } else {
        return handleAskCommand(chatId, userId, message.text);
      }
    }

    if (message.text.startsWith("/usage")) {
      return handleUsageCommand(chatId, userId);
    }

    if (message.text.startsWith("/procjena")) {
      if (message.reply_to_message?.text) {
        const text = message.reply_to_message.text;

        const systemPrompt =
          "Decide if the users message is illogical or weird or if it's written weirdly.\n\nRespond weird on not weird, but think of one sentence.";

        try {
          const response = await sendToAi({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: text },
            ],
          });

          return sendTelegramMessage(chatId, response);
        } catch (error) {
          console.error(error);
          return sendTelegramMessage(chatId, "Error: " + error);
        }
      }
    }

    if (message.text.startsWith("/cap")) {
      console.log("Fact-checking message");

      console.log(message);

      if (message.reply_to_message?.text) {
        console.log("Fact-checking message with reply");

        const text = message.reply_to_message.text;

        const systemPrompt =
          "Fact-check the user's message.\n\n Respond with an additional fun fact or a correction to the user's message.";

        try {
          const response = await sendToAi({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: text },
            ],
          });

          return sendTelegramMessage(chatId, response);
        } catch (error) {
          console.error(error);
          return sendTelegramMessage(chatId, "Error: " + error);
        }
      }
    }
  }
};
