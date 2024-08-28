import TelegramBot from "node-telegram-bot-api";
import { sendTelegramMessage } from "./TelegramBotSetup.js";
import { getTelegramFileUrl } from "./telegramFileUtils.js";
import { describeImage, getUsersFromText } from "./OpenAi.js";

import { chatStates } from "./index.js";
import { Receipt } from "./Classes/Receipt.js";

type TelegramOnListener = (
  message: TelegramBot.Message,
  metadata: TelegramBot.Metadata
) => any;

export const OnTelegramMessageHandler: TelegramOnListener = async (message, metadata) => {
  const chatId = message.chat.id;

  let chatState = chatStates.get(chatId);

  if (!chatState) {
    chatState = new Receipt();
    chatStates.set(chatId, chatState);
    chatState.figureOutStatus();
  }

  switch (chatState?.status) {
    case "ready_to_receive_image":
      // Ovo se ponavlja od dolje, treba svaki case stavit u funkciju
      if (message.photo && message.photo.length > 0) {
        try {
          const largestPhoto = message.photo.pop();
          const telegramPhotoPublicUrl = await getTelegramFileUrl(largestPhoto!.file_id);
          const fileDescription = await describeImage(telegramPhotoPublicUrl);

          const formattedFileDescription = fileDescription.error
            ? `Error: ${fileDescription.error}`
            : JSON.stringify(fileDescription, null, 2);

          sendTelegramMessage(chatId, formattedFileDescription, {
            parse_mode: "HTML",
            reply_markup: imageDescriptionReplyMarkup,
          });

          // update chat state
          if (fileDescription.title) {
            chatState.title = fileDescription.title;
          }

          if (fileDescription.items && fileDescription.items.length > 0) {
            chatState.setItems(fileDescription.items);
          }
          chatState.figureOutStatus();
        } catch (error) {
          sendTelegramMessage(chatId, `Error: ${error}`);
        }
      }
      break;

    case "accepting_item_changes":
      // TODO
      break;

    case "accepting_what_item_belongs_to_which_user":
      if (message.text) {
        const users = await getUsersFromText(message.text);

        console.log(users);

        chatState.setUsers(users);
        chatState.figureOutStatus();

        sendTelegramMessage(chatId, chatState.users.toString());
      }

      break;

    case "payedOff":
      sendTelegramMessage(chatId, `Ako nije slika ne zanima me.`);
      break;

    default:
      sendTelegramMessage(chatId, `Nepoznato stanje: ${chatState.status}`);
      break;
  }

  // if (message.photo && message.photo.length > 0) {
  //   // If it is a photo:
  //   const largestPhoto = message.photo.sort((a, b) => a.width - b.width).pop();
  //   // const smallestPhoto = message.photo.sort((a, b) => a.width - b.width).shift();
  //   // const middlePhoto = message.photo.sort((a, b) => a.width - b.width)[
  //   //   Math.floor(message.photo.length / 2)
  //   // ];

  //   const telegramPhotoPublicUrl = await getTelegramFileUrl(largestPhoto!.file_id);

  //   console.log(telegramPhotoPublicUrl);

  //   const fileDescription =
  //     (await describeImage(telegramPhotoPublicUrl)) || "No description found.";

  //   sendTelegramMessage(chatId, fileDescription, {
  //     parse_mode: "HTML",
  //     reply_markup: imageDescriptionReplyMarkup,
  //   });
  // } else {
  // sendTelegramMessage(chatId, `Received your message ${chatId}. Poslano u MUP!`, {});
  // }
};

const imageDescriptionReplyMarkup = {
  inline_keyboard: [
    [
      { text: "✍️ Uredi", callback_data: "edit" },
      { text: "✅ Potvrdi", callback_data: "confirm" },
    ],
    [{ text: "👥 Dodaj sudionike", callback_data: "dodaj_sudionike" }],
  ],
};
