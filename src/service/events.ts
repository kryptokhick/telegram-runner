import axios from "axios";
import config from "../config";
import { fetchCommunitiesOfUser, leaveCommunity } from "../service";
import logger from "../utils/logger";

const onChatStart = (ctx: any): void => {
  if (ctx.message.chat.id > 0)
    // TODO: check whether the user is in the database
    ctx.replyWithMarkdown(
      "I'm sorry, I couldn't find you in the database.\n" +
        "Make sure to register [here](https://agora.space/)."
    );
};

const onUserJoined = (
  refId: string,
  idFromPlatform: string,
  sender: string
): void => {
  axios
    .post(`${config.backendUrl}/user/joined`, {
      refId,
      idFromPlatform,
      platform: config.platform,
      sender
    })
    .then((res) => logger.debug(JSON.stringify(res.data)))
    .catch(logger.error);
};

const onUserLeftGroup = (ctx: any): void => {
  ctx.reply(`Bye, ${ctx.message.left_chat_member.first_name} 😢`);
};

const onUserRemoved = (idFromPlatform: string, sender: string): void => {
  axios
    .post(`${config.backendUrl}/user/removed`, {
      idFromPlatform,
      platform: config.platform,
      sender
    })
    .then((res) => logger.debug(JSON.stringify(res.data)))
    .catch(logger.error);
};

const onBlocked = async (ctx: any): Promise<void> => {
  const idFromPlatform = ctx.message.from.id;

  (await fetchCommunitiesOfUser(idFromPlatform)).forEach((community) =>
    leaveCommunity(idFromPlatform, community.id)
  );
};

const onMessage = (ctx: any): void => {
  onChatStart(ctx);
};

export {
  onChatStart,
  onUserJoined,
  onUserLeftGroup,
  onUserRemoved,
  onBlocked,
  onMessage
};
