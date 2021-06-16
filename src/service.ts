/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

import axios from "axios";
import { Markup } from "telegraf";
import { InlineKeyboardButton } from "typegram";
import { CommunityUrlResult } from "./api/types";
import config from "./config";
import logger from "./utils/logger";
import Main from "./Main";

const API_BASE_URL = config.backendUrl;
const PLATFORM = "telegram";

const onChatStart = (ctx: any): void => {
  if (ctx.message.chat.id > 0)
    // TODO: check whether the user is in the database
    ctx.replyWithMarkdown(
      [
        "I'm sorry, I couldn't find you in the database.",
        "Make sure to register [here](https://agora.space/)."
      ].join("\n")
    );
};

const onHelp = (ctx: any): void => {
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

const onUserJoined = (
  refId: string,
  idFromPlatform: string,
  sender: string
): void => {
  axios
    .post(`${API_BASE_URL}/user/joined`, {
      refId,
      idFromPlatform,
      platform: PLATFORM,
      sender
    })
    .then((res) => logger.debug(JSON.stringify(res.data)))
    .catch(logger.error);
};

const onUserLeftGroup = (ctx: any): void =>
  ctx.reply(`Bye, ${ctx.message.left_chat_member.first_name} 😢`);

const onUserRemoved = (idFromPlatform: string, sender: string): void => {
  axios
    .post(`${API_BASE_URL}/user/removed`, {
      idFromPlatform,
      platform: PLATFORM,
      sender
    })
    .then((res) => logger.debug(JSON.stringify(res.data)))
    .catch(logger.error);
};

const getCommunityUrls = async (
  idFromPlatform: string
): Promise<CommunityUrlResult[]> =>
  (await axios.get(`${API_BASE_URL}/community/url/${idFromPlatform}`)).data;

const leaveCommunity = async (
  idFromPlatform: string,
  justThisOne: boolean,
  communityId: string | undefined
): Promise<void> => {
  let communityIds: string[] = [];

  if (justThisOne) {
    if (communityId) communityIds.push(communityId);
  } else {
    communityIds = (await getCommunityUrls(idFromPlatform)).map(
      (res) => res.id
    );
  }

  communityIds.map((commId) => {
    axios
      .post(`${API_BASE_URL}/user/left`, {
        idFromPlatform,
        platform: PLATFORM,
        commId
      })
      .then((res) => logger.debug(JSON.stringify(res.data)))
      .catch(logger.error);

    return true;
  });
};

const onUserLeavesCommunity = async (ctx: any): Promise<void> => {
  const {message} = ctx;
  const chatId = message.chat.id;

  if (chatId > 0) {
    const communityList: InlineKeyboardButton[][] = [
      [Markup.button.callback("Agora", "comm_1_agora")],
      [Markup.button.callback("Ethane", "comm_2_ethane")]
    ];

    ctx.replyWithMarkdown(
      "Choose the community you want to leave from the list below:",
      Markup.inlineKeyboard(communityList)
    );
  }
};

const onGetCommunityUrls = (ctx: any): void => {
  getCommunityUrls(ctx.message.from.id).then((results) => {
    const urls = results
      .map((result) => `[${result.name}](${result.url})`)
      .join("\n");

    ctx.replyWithMarkdown(
      `*Please visit your communities' websites:*\n${urls}`
    );
  });
};

const onMessage = (ctx: any): void => {
  // const message = ctx.message
  // const chat = message.chat
  // const chatId = chat.id
  // const userId = message.from.id
  onChatStart(ctx);
};

const onAction = async (ctx: any): Promise<void> => {
  const query = ctx.update.callback_query;
  const data = ctx.match[0];
  const userId = query.from.id;

  if (data.startsWith("yes_")) {
    leaveCommunity(userId, true, data.split("yes_")[1]);
  } else if (data.startsWith("comm_")) {
    const comm_id = data.split("_")[1];
    const comm_name = data.split(`comm_${comm_id}_`)[1].toUpperCase();

    const firstName = (await Main.Client.getChatMember(userId, userId)).user
      .first_name;

    ctx.replyWithMarkdown(
      `Hey ${firstName}!\nDo you really want to *LEAVE ${comm_name}*?`,
      Markup.inlineKeyboard([
        Markup.button.callback("Yes", `yes_${comm_id}`),
        Markup.button.callback("No", "no")
      ])
    );
  }
};

export {
  onChatStart,
  onHelp,
  onUserJoined,
  onUserLeftGroup,
  onUserRemoved,
  onUserLeavesCommunity,
  getCommunityUrls,
  onGetCommunityUrls,
  onMessage,
  onAction
};
