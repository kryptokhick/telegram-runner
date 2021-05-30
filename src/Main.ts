import { Telegraf, Telegram } from "telegraf";
import * as dotenv from "dotenv";
import logger from "./utils/logger";

if (dotenv.config().error)
  throw new Error("Couldn't find .env file or volumes in compose.");

export default class Main {
  private static tg: Telegram;

  static get Client(): Telegram {
    return this.tg;
  }

  static start(): void {
    // Telegram Bot API token
    const token = process.env.TELEGRAM_TOKEN;

    if (!token) {
      try {
        throw new Error("Telegram BOT API token cannot be empty!");
      } catch (error) {
        logger.error(error);
        process.exit(1);
      }
    } else {
      // initializing the chatbot with our API token
      const bot = new Telegraf(token);

      // telegram client instance
      this.tg = bot.telegram;

      bot.use(async (ctx, next) => {
        const start = Date.now();
        return next().then(() => {
          const ms = Date.now() - start;
          logger.verbose(`response time ${ms}ms`);

          const update = ctx.update as unknown as {
            chat_member: { invite_link: { invite_link: string } };
          };

          if (update.chat_member && update.chat_member.invite_link) {
            // TODO: check if the user fullfills the requirements
            // TODO: welcome the user
            logger.debug(update.chat_member.invite_link.invite_link);
          }
        });
      });

      // listening on new chat with a Telegram user
      bot.start(async (ctx) => {
        if (ctx.message.chat.id > 0)
          // TODO: check whether the user is in the database
          await ctx.replyWithMarkdown(
            [
              "I'm sorry, I couldn't find you in the database.",
              "Make sure to register [here](https://agora.space/)."
            ].join("\n")
          );
      });

      // a user left the group
      bot.on("left_chat_member", async (ctx) =>
        ctx.reply(`Bye, ${ctx.message.left_chat_member.first_name} 😢`)
      );

      // start the bot
      bot.launch({ allowedUpdates: ["chat_member", "message"] });

      // enable graceful stop
      process.once("SIGINT", () => bot.stop("SIGINT"));
      process.once("SIGTERM", () => bot.stop("SIGTERM"));

      logger.verbose("Medousa is alive...");
    }
  }
}

Main.start();
