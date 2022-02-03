import api from "./api/api";
import Bot from "./Bot";
import config from "./config";
import logger from "./utils/logger";

export default class Main {
  static start() {
    // start listener
    api();

    // setup the Telegram bot
    Bot.setup(config.telegramToken);
    Bot.Client.getMe()
      .then((b) => {
        config.telegramBotId = b.id;
      })
      .catch((err) => logger.verbose(err.message));
  }
}

Main.start();
