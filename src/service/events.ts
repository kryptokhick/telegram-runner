import axios from "axios";
import { Markup } from "telegraf";
import { generateInvite } from "../api/actions";
import { fetchCommunitiesOfUser, getGroupName, leaveCommunity } from "./common";
import config from "../config";
import logger from "../utils/logger";

const onMessage = async (ctx: any): Promise<void> => {
  if (ctx.message.chat.id > 0) {
    try {
      await ctx.reply("I'm sorry, but I couldn't interpret your request.");
      await ctx.replyWithMarkdown(
        "You can find more information on the " +
          "[Agora](https://app.agora.space/) website."
      );
    } catch (err) {
      logger.error(err);
    }
  }
};

const onChatStart = async (ctx: any): Promise<void> => {
  const { message } = ctx;

  if (message.chat.id > 0) {
    if (new RegExp(/^\/start [0-9]+_[0-9]+$/).test(message.text)) {
      const refId = message.text.split("/start ")[1].split("_")[0];
      const platformUserId = message.from.id;
      const communityId = message.text.split("_")[1];
      try {
        ctx.reply(
          "Thank you for joining, I'll send the invites as soon as possible."
        );
      } catch (error) {
        logger.error(error);
      }

      try {
        const res = await axios.post(
          `${config.backendUrl}/user/getAccessibleGroupIds`,
          {
            refId,
            platform: config.platform,
            platformUserId,
            communityId
          }
        );

        {
          const invites: { link: string; name: string }[] = [];

          await Promise.all(
            res.data.map(async (groupId: string) => {
              try {
                const inviteLink = await generateInvite(
                  platformUserId,
                  groupId
                );

                if (inviteLink !== undefined) {
                  invites.push({
                    link: inviteLink,
                    name: await getGroupName(groupId)
                  });
                }
              } catch (err) {
                logger.error(err);
              }
            })
          );

          if (invites.length) {
            try {
              ctx.replyWithMarkdown(
                "You have 15 minutes to join these groups before the invite " +
                  "links expire:",
                Markup.inlineKeyboard(
                  invites.map((inv) => [Markup.button.url(inv.name, inv.link)])
                )
              );
            } catch (err) {
              logger.error(err);
            }
          }
        }
      } catch (err) {
        logger.error(err);
      }
    } else onMessage(ctx);
  }
};

const onUserJoined = async (
  refId: string,
  platformUserId: string,
  groupId: string
): Promise<void> => {
  try {
    const res = await axios.post(`${config.backendUrl}/user/joinedPlatform`, {
      refId,
      platform: config.platform,
      platformUserId,
      groupId
    });
    logger.debug(JSON.stringify(res.data));
  } catch (err) {
    logger.error(err);
  }
};

const onUserLeftGroup = (ctx: any): void => {
  ctx.reply(`Bye, ${ctx.message.left_chat_member.first_name} 😢`);
};

const onUserRemoved = async (
  platformUserId: string,
  groupId: string
): Promise<void> => {
  try {
    const res = await axios.post(
      `${config.backendUrl}/user/removeFromPlatform`,
      {
        platform: config.platform,
        platformUserId,
        groupId
      }
    );

    logger.debug(JSON.stringify(res.data));
  } catch (err) {
    logger.error(err);
  }
};

const onBlocked = async (ctx: any): Promise<void> => {
  const platformUserId = ctx.update.my_chat_member.from.id;

  logger.warn(`User "${platformUserId}" has blocked the bot.`);

  try {
    const communities = await fetchCommunitiesOfUser(platformUserId);

    communities.forEach((community) =>
      leaveCommunity(platformUserId, community.id)
    );
  } catch (err) {
    logger.error(err);
  }
};

const onChatMemberUpdate = (ctx: any): void => {
  const member = ctx.update.chat_member;

  if (member.invite_link) {
    const invLink = member.invite_link.invite_link;

    logger.debug(invLink);

    onUserJoined(invLink, member.from.id, member.chat.id);
  }
};

const onMyChatMemberUpdate = (ctx: any): void => {
  if (ctx.update.my_chat_member.new_chat_member?.status === "kicked") {
    onBlocked(ctx);
  }
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
