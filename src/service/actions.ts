import { Markup } from "telegraf";
import Bot from "../Bot";
import config from "../config";
import mtprotoApi from "../mtproto";
import logger from "../utils/logger";
import { leaveCommunity } from "./common";

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

const createGroup = async (title: string) => {
  logger.verbose(`createGroup ${title}`);
  const { username } = await Bot.Client.getMe();
  const userResult = await mtprotoApi.call("contacts.resolveUsername", {
    username
  });
  logger.verbose(`userResult ${JSON.stringify(userResult)}`);
  const user_id = {
    _: "inputUser",
    user_id: userResult.users[0].id,
    access_hash: userResult.users[0].access_hash
  };

  logger.verbose(`userResult ${user_id}`);

  const supergroupResult = await mtprotoApi.call("channels.createChannel", {
    megagroup: true,
    title
  });

  logger.verbose(`supergroupResult ${JSON.stringify(supergroupResult)}`);

  const channel = {
    _: "inputChannel",
    channel_id: supergroupResult.chats[0].id,
    access_hash: supergroupResult.chats[0].access_hash
  };

  logger.verbose(`channel ${JSON.stringify(channel)}`);

  await mtprotoApi.call("channels.inviteToChannel", {
    channel,
    users: [user_id]
  });

  await mtprotoApi.call("channels.editAdmin", {
    channel,
    user_id,
    admin_rights: {
      _: "chatAdminRights",
      change_info: true,
      post_messages: true,
      edit_messages: true,
      delete_messages: true,
      ban_users: true,
      invite_users: true,
      pin_messages: true,
      add_admins: true
    },
    rank: "Medusa"
  });

  await mtprotoApi.call("channels.leaveChannel", { channel });

  return `-100${channel.channel_id}`;
};

const sendLoginCode = async () =>
  mtprotoApi.call("auth.sendCode", {
    phone_number: config.phoneNumber,
    api_id: config.mtproto.apiId,
    api_hash: config.mtproto.apiHash,
    settings: {
      _: "codeSettings"
    }
  });

const signIn = async (phoneCode: string, phoneCodeHash: string) =>
  mtprotoApi.call("auth.signIn", {
    phone_number: config.phoneNumber,
    phone_code: phoneCode,
    phone_code_hash: phoneCodeHash
  });

export {
  confirmLeaveCommunityAction,
  confirmedLeaveCommunityAction,
  createGroup,
  sendLoginCode,
  signIn
};
