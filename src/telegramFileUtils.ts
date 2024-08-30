// import { config } from "dotenv";
import { bot } from "./TelegramBotSetup.js";

// config(); // Load environment variables from .env file

export async function getTelegramFileUrl(fileId: string) {
  if (!fileId) throw new Error("File ID is empty");

  const file = await bot.getFile(fileId);

  console.log(file);

  const fileUrl = fillTelegramFileUrl(
    process.env.TELEGRAM_TOKEN || "",
    file.file_path || ""
  );

  return fileUrl;
}

function fillTelegramFileUrl(token: string, filePath: string) {
  return `https://api.telegram.org/file/bot${token}/${filePath}`;
}
