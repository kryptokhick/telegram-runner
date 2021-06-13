/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

import { Telegraf, Telegram } from "telegraf";
import * as TGEvents from "./service";
import logger from "./utils/logger";
import config from "./config";
import api from "./api/api";

export default class Main {
  private static tg: Telegram;

  static get Client(): Telegram {
    return this.tg;
  }

  static start(): void {
    // Start listener
    api();

    // initializing the chatbot with our API token
    const bot = new Telegraf(config.telegramToken);

    // telegram client instance
    this.tg = bot.telegram;

    bot.use(async (ctx, next) => {
      const start = Date.now();
      return next().then(async () => {
        const ms = Date.now() - start;
        logger.verbose(`response time ${ms}ms`);

        const update = ctx.update as any;

        if (update.chat_member && update.chat_member.invite_link) {
          const member = update.chat_member;
          const invLink = member.invite_link.invite_link;

          // TODO: tell the HUB that a new user joined the group
          await TGEvents.onUserJoined(invLink, member.from.id, member.chat.id);

          // TODO: check if the user fullfills the requirements
          await TGEvents.onUserRemoved(member.from.id, member.chat.id);
          // TODO: otherwise welcome the user
          logger.debug(invLink);
        }
      });
    });

    // listening on new chat with a Telegram user
    bot.start((ctx) => TGEvents.onChatStart(ctx));

    // user uses the help command
    bot.help((ctx) => TGEvents.onHelp(ctx));

    // a user left the group
    bot.on("left_chat_member", (ctx) => TGEvents.onUserLeft(ctx));

    // start the bot
    bot.launch({ allowedUpdates: ["chat_member", "message"] });

    // enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));

    logger.verbose("Medousa is alive...");
  }
}

Main.start();
