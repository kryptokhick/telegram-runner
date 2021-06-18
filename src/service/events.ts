import axios from "axios";
import { fetchCommunitiesOfUser, leaveCommunity } from "./common";
import config from "../config";
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

const onChatMemberUpdate = async (ctx: any): Promise<void> => {
  const member = ctx.update.chat_member;

  if (member.invite_link) {
    const invLink = member.invite_link.invite_link;

    logger.debug(invLink);

    await onUserJoined(invLink, member.from.id, member.chat.id);

    // TODO: check if the user fullfills the requirements
    await onUserRemoved(member.from.id, member.chat.id);
  }
};

const onMyChatMemberUpdate = async (ctx: any): Promise<void> => {
  if (ctx.update.my_chat_member.new_chat_member?.status === "kicked") {
    onBlocked(ctx);
  }
};

const onMessage = (ctx: any): void => {
  onChatStart(ctx);
};

export {
  onChatStart,
  onChatMemberUpdate,
  onMyChatMemberUpdate,
  onUserJoined,
  onUserLeftGroup,
  onUserRemoved,
  onBlocked,
  onMessage
};
