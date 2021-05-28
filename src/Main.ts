import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { exit } from "process";

dotenv.config({ path: `${__dirname}/.env` });

export default class Main {
  static start(): void {
    // Telegram Bot API token
    const token = process.env.TELEGRAM_TOKEN;

    if (!token) {
      exit(1);
    } else {
      // initializing the chatbot with our API token
      const bot = new Telegraf(token);

      // telegram client instance
      // const tg = bot.telegram;

      // start the bot
      bot.launch();

      // enable graceful stop
      process.once("SIGINT", () => bot.stop("SIGINT"));
      process.once("SIGTERM", () => bot.stop("SIGTERM"));

      console.log("Medousa is alive...");
    }
  }
}

Main.start();
