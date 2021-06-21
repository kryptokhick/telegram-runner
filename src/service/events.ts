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
    .post(`${config.backendUrl}/user/joinedPlatform`, {
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
    .post(`${config.backendUrl}/user/removeFromPlatform`, {
      idFromPlatform,
      platform: config.platform,
      sender
    })
    .then((res) => logger.debug(JSON.stringify(res.data)))
    .catch(logger.error);
};

const onBlocked = (ctx: any): void => {
  const idFromPlatform = ctx.message.from.id;

  fetchCommunitiesOfUser(idFromPlatform).then((communities) =>
    communities.forEach((community) =>
      leaveCommunity(idFromPlatform, community.id)
    )
  );
};

const onChatMemberUpdate = (ctx: any): void => {
  const member = ctx.update.chat_member;

  if (member.invite_link) {
    const invLink = member.invite_link.invite_link;

    logger.debug(invLink);

    onUserJoined(invLink, member.from.id, member.chat.id);

    // TODO: check if the user fullfills the requirements
    onUserRemoved(member.from.id, member.chat.id);
  }
};

const onMyChatMemberUpdate = (ctx: any): void => {
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
