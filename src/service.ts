/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

import axios from "axios";
import { CommunityUrlResult } from "./api/types";
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
      "/leave - you have to choose which community you want " +
      "to leave and I'll do the rest\n";
  } // group chat
  else {
    commandsList +=
      "/leave - you will be removed from this community\n" +
      "/info - get relevant information about this community\n";
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

const onUserLeft = (ctx: any): void => {
  ctx.reply(`Bye, ${ctx.message.left_chat_member.first_name} 😢`);
};

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
): Promise<CommunityUrlResult[]> => {
  const result = await axios.get(
    `${API_BASE_URL}/community/url/${idFromPlatform}`
  );
  return result.data;
};

export {
  onChatStart,
  onHelp,
  onUserJoined,
  onUserLeft,
  onUserRemoved,
  getCommunityUrls
};
