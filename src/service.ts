/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

import axios from "axios";
import { Markup } from "telegraf";
import { InlineKeyboardButton } from "typegram";
import { CommunityResult } from "./api/types";
import config from "./config";
import logger from "./utils/logger";

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

const fetchCommunitiesOfUser = async (
  idFromPlatform: string
): Promise<CommunityResult[]> =>
  (await axios.get(`${API_BASE_URL}/communities/${idFromPlatform}`)).data;

const leaveCommunities = (
  idFromPlatform: string,
  communityIds: number[]
): void => {
  communityIds.forEach((commId) => {
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

const onBlocked = async (ctx: any): Promise<void> => {
  const idFromPlatform = ctx.message.from.id;
  leaveCommunities(
    idFromPlatform,
    (await fetchCommunitiesOfUser(idFromPlatform)).map((res) => res.id)
  );
};

const leaveCommand = async (ctx: any): Promise<void> => {
  if (ctx.message.chat.id > 0) {
    const communityList: InlineKeyboardButton[][] = [
      [Markup.button.callback("Agora", "leave_1_Agora")]
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

const onMessage = (ctx: any): void => {
  // const message = ctx.message
  // const chat = message.chat
  // const chatId = chat.id
  // const userId = message.from.id
  onChatStart(ctx);
};

const leaveCommunityAction = async (ctx: any): Promise<void> => {
  const data = ctx.match[0];
  const commId = data.split("_")[1];
  const commName = data.split(`leave_${commId}_`)[1].toUpperCase();

  ctx.replyWithMarkdown(
    `You'll be kicked from every *${commName}* group. Are you sure?`,
    Markup.inlineKeyboard([
      Markup.button.callback("Yes", `confirmLeave_${commId}`),
      Markup.button.callback("No", "no")
    ])
  );
};

const confirmLeaveCommunityAction = (ctx: any) => {
  leaveCommunities(ctx.update.callback_query.from.id, [
    ctx.match[0].split("confirmLeave_")[1]
  ]);
};

export {
  onChatStart,
  helpCommand,
  onUserJoined,
  onUserLeftGroup,
  onUserRemoved,
  leaveCommand,
  fetchCommunitiesOfUser,
  listCommunitiesCommand,
  onMessage,
  onBlocked,
  leaveCommunityAction,
  confirmLeaveCommunityAction
};
