import api from "./api/api";
import Bot from "./Bot";
import config from "./config";

export default class Main {
  static start(): void {
    // start listener
    api();

    // setup the Telegram bot
    Bot.setup(config.telegramToken);
  }
}

Main.start();
