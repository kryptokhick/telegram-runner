import axios from "axios";
import { Markup } from "telegraf";
import { InlineKeyboardButton } from "typegram";
import { CommunityResult } from "./api/types";
import config from "./config";
import logger from "./utils/logger";

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
      "/communities - get a list of your communities' websites\n" +
      "/leave - you have to choose which community you want " +
      "to leave and I'll do the rest\n";
  } // group chat
  else {
    commandsList += "";
  }

  ctx.replyWithMarkdown(`${helpHeader}\n${commandsList}\n${helpFooter}`, {
    disable_web_page_preview: true
  });
};

const fetchCommunitiesOfUser = async (
  idFromPlatform: string
): Promise<CommunityResult[]> =>
  (await axios.get(`${config.backendUrl}/communities/${idFromPlatform}`)).data;

const leaveCommunity = (idFromPlatform: string, communityId: string): void => {
  axios
    .post(`${config.backendUrl}/user/left`, {
      idFromPlatform,
      platform: config.platform,
      communityId
    })
    .then((res) => logger.debug(JSON.stringify(res.data)))
    .catch(logger.error);
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
    const urls = results
      .map((result) => `[${result.name}](${result.url})`)
      .join("\n");

    ctx.replyWithMarkdown(
      `*Please visit your communities' websites:*\n${urls}`
    );
  });
};

const confirmLeaveCommunityAction = (ctx: any): void => {
  const data = ctx.match[0];
  const commId = data.split("_")[2];
  const commName = data.split(`leave_confirm_${commId}_`)[1];

  ctx.replyWithMarkdown(
    `You'll be kicked from every *${commName}* group. Are you sure?`,
    Markup.inlineKeyboard([
      Markup.button.callback("Yes", `leave_confirmed_${commId}`),
      Markup.button.callback("No", "no")
    ])
  );
};

const confirmedLeaveCommunityAction = (ctx: any): void => {
  leaveCommunity(
    ctx.update.callback_query.from.id,
    ctx.match[0].split("leave_confirmed_")[1]
  );
};

export {
  helpCommand,
  leaveCommand,
  leaveCommunity,
  fetchCommunitiesOfUser,
  listCommunitiesCommand,
  confirmLeaveCommunityAction,
  confirmedLeaveCommunityAction
};
