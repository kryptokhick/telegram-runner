import { Markup } from "telegraf";
import { InlineKeyboardButton } from "typegram";
import Bot from "../Bot";
import { fetchCommunitiesOfUser } from "./common";

const helpCommand = (ctx: any): void => {
  const helpHeader =
    "Hello there! My name is Medousa.\n" +
    "I'm part of the [Agora](https://agora-space.vercel.app/) project and " +
    "I am your personal assistant.\n" +
    "I will always let you know whether you can join a higher group or " +
    "whether you were kicked from a group.\n";

  let commandsList = "/help - show instructions\n/ping - check if I'm alive\n";

  const helpFooter =
    "For more details about me read the documentation on " +
    "[github](https://github.com/AgoraSpaceDAO/telegram-runner).";

  // DM
  if (ctx.message.chat.id >= 0) {
    commandsList +=
      "/list - get a list of your communities' websites\n" +
      "/leave - you have to choose which community you want " +
      "to leave and I'll do the rest\n";
  }
  // group chat
  else {
    commandsList += "";
  }

  ctx.replyWithMarkdown(`${helpHeader}\n${commandsList}\n${helpFooter}`, {
    disable_web_page_preview: true
  });
};

const leaveCommand = (ctx: any): void => {
  if (ctx.message.chat.id > 0) {
    const communityList: InlineKeyboardButton[][] = [
      [Markup.button.callback("Agora", "leave_confirm_0_Agora")]
    ];

    ctx.replyWithMarkdown(
      "Choose the community you want to leave from the list below:",
      Markup.inlineKeyboard(communityList)
    );
  }
};

const listCommunitiesCommand = (ctx: any): void => {
  fetchCommunitiesOfUser(ctx.message.from.id).then((results) => {
    ctx.replyWithMarkdown(
      "Please visit your communities' websites:",
      Markup.inlineKeyboard(
        results.map((res) => [Markup.button.url(res.name, res.url)])
      )
    );
  });
};

const pingCommand = (ctx: any): void => {
  const { message } = ctx.update;
  const messageTime = new Date(message.date * 1000).getTime();
  const platformUserId = message.from.id;

  const currTime = new Date().getTime();

  Bot.Client.getChatMember(platformUserId, platformUserId).then((sender) => {
    ctx.replyWithMarkdown(
      `Pong. @${sender.user.username} latency is ${currTime - messageTime}ms.` +
        ` API latency is ${new Date().getTime() - currTime}ms.`
    );
  });
};

export { helpCommand, leaveCommand, listCommunitiesCommand, pingCommand };
