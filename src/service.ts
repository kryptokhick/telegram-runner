/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

import axios from "axios";
import logger from "./utils/logger";
import config from "./config";

const API_BASE_URL = config.hubUrl;
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

export { onChatStart, onUserJoined, onUserLeft, onUserRemoved };
