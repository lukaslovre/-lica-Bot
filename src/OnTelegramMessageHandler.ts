import TelegramBot from "node-telegram-bot-api";
import { sendTelegramImage, sendTelegramMessage } from "./TelegramBotSetup.js";
import { sendToAi, systemPrompt, twoMessagesAi } from "./OpenAi.js";

import { handleAskCommand } from "./message_commands/AskCommand.js";
import { handleUsageCommand } from "./message_commands/UsageCommand.js";
import { generateImage } from "./OpenAi/generateImage.js";
import { insertSpending } from "./database/Spending.js";
import { tokensToDollars } from "./OpenAi/tokensToDollars.js";
import { getTelegramFileUrl } from "./telegramFileUtils.js";
import type { ImageModel } from "openai/src/resources/images.js";
import { askAboutImage } from "./OpenAi/askAboutImage.js";
import type { ChatModel } from "openai/resources/index.mjs";

type TelegramOnListener = (
  message: TelegramBot.Message,
  metadata: TelegramBot.Metadata
) => any;

export const OnTelegramMessageHandler: TelegramOnListener = async (message, metadata) => {
  const chatId = message.chat.id;
  const user = message.from;
  const userId = user?.id;

  if (!userId) return sendTelegramMessage(chatId, "User ID not found.");

  if (message.text) {
    if (message.text.startsWith("/ask ")) {
      if (message.reply_to_message?.text) {
        const replyToMessage = message.reply_to_message;
        const question = message.text.replace("/ask ", "");

        const model: ChatModel = "gpt-4o-2024-08-06";

        try {
          const { text, tokens } = await sendToAi({
            model: model,
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: replyToMessage.from?.is_bot ? "assistant" : "user",
                content: `${replyToMessage.from?.first_name.toUpperCase()}:\n\n${
                  replyToMessage.text
                }`,
              },
              {
                role: "user",
                content: `${user.first_name.toUpperCase()}:\n\n${question}`,
              },
            ],
          });

          const cost = tokensToDollars(
            {
              input: 0,
              output: tokens || 0,
            },
            model
          );

          insertSpending(userId, cost);

          return sendTelegramMessage(chatId, text);
        } catch (error) {
          console.error(error);
          return sendTelegramMessage(chatId, "Error: " + error);
        }
      } else if (message.reply_to_message?.photo) {
        // If the replyed to message is a photo.
        try {
          // The photo with the mediumest width.
          const photo = message.reply_to_message.photo.sort((a, b) => a.width - b.width)[
            Math.floor(message.reply_to_message.photo.length / 2)
          ];

          const photoUrl = await getTelegramFileUrl(photo?.file_id || "");

          const question = message.text.replace("/ask ", "");

          const { answer, usedTokens, usedModel } = await askAboutImage(
            photoUrl,
            question,
            "gpt-4o-2024-08-06"
          );

          const cost = tokensToDollars(usedTokens, usedModel);

          insertSpending(userId, cost);

          return sendTelegramMessage(chatId, answer);
        } catch (error) {
          console.error(error);
          return sendTelegramMessage(chatId, "Error: " + error);
        }
      } else {
        return handleAskCommand(chatId, user, message.text);
      }
    }

    if (message.text.startsWith("/usage")) {
      return handleUsageCommand(chatId, userId);
    }

    if (message.text.startsWith("/procjena")) {
      if (message.reply_to_message?.text) {
        const userMessage = message.reply_to_message.text;

        const systemPrompt =
          "Decide if the users message is illogical or weird or if it's written weirdly.\n\nRespond weird on not weird, but think of one sentence.";

        try {
          const { text, tokens } = await sendToAi({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
          });

          return sendTelegramMessage(chatId, text);
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

          return sendTelegramMessage(chatId, response.text);
        } catch (error) {
          console.error(error);
          return sendTelegramMessage(chatId, "Error: " + error);
        }
      }
    }

    if (message.text.startsWith("/nacrtaj ") || message.text.startsWith("/uslikaj ")) {
      // "/nacrtaj " === 9 characters
      // "/uslikaj " === 9 characters
      const prompt = message.text.slice(9);

      if (prompt.length < 5) {
        return sendTelegramMessage(chatId, "Please provide a longer prompt.");
      }

      try {
        const model: ImageModel = message.text.startsWith("/nacrtaj ")
          ? "dall-e-2"
          : "dall-e-3";

        const { url: imageUrl, cost } = await generateImage(prompt, model);

        insertSpending(userId, cost);

        return sendTelegramImage(chatId, imageUrl, {
          caption: `Cost: $${cost.toFixed(2)}`,
        });
      } catch (error) {
        return sendTelegramMessage(chatId, "Error: " + error);
      }
    }
  }
};
