import { Telegraf, Telegram } from "telegraf";
import * as TGActions from "./service/actions";
import * as TGCommands from "./service/commands";
import * as TGEvents from "./service/events";
import logger from "./utils/logger";

export default class Bot {
  private static tg: Telegram;

  static get Client(): Telegram {
    return this.tg;
  }

  static setup(token: string): void {
    const bot = new Telegraf(token);

    this.tg = bot.telegram;

    // registering middleware to log the duration of updates
    bot.use(async (_, next) => {
      const start = Date.now();
      return next().then(async () =>
        logger.verbose(`response time ${Date.now() - start}ms`)
      );
    });

    // inbuilt commands
    bot.start((ctx) => TGEvents.onChatStart(ctx));
    bot.help((ctx) => TGCommands.helpCommand(ctx));

    // other commands
    bot.command("leave", (ctx) => TGCommands.leaveCommand(ctx));
    bot.command("list", (ctx) => TGCommands.listCommunitiesCommand(ctx));

    // event listeners
    bot.on("message", (ctx) => TGEvents.onMessage(ctx));
    bot.on("left_chat_member", (ctx) => TGEvents.onUserLeftGroup(ctx));
    bot.on("chat_member", (ctx) => TGEvents.onChatMemberUpdate(ctx));
    bot.on("my_chat_member", (ctx) => TGEvents.onMyChatMemberUpdate(ctx));

    // action listeners
    bot.action(/^leave_confirm_[0-9]+_[a-zA-Z0-9 ,.:"'`]+$/, (ctx) =>
      TGActions.confirmLeaveCommunityAction(ctx)
    );
    bot.action(/^leave_confirmed_[0-9]+$/, (ctx) =>
      TGActions.confirmedLeaveCommunityAction(ctx)
    );

    // starting the bot
    bot.launch({
      allowedUpdates: [
        "chat_member",
        "my_chat_member",
        "message",
        "callback_query"
      ]
    });

    // enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));

    logger.verbose("Medousa is alive...");
  }
}
