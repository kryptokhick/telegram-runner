import { Markup } from "telegraf";
import { getGroupName, kickUser } from "../service/common";
import Bot from "../Bot";
import { ManageGroupsParam } from "./types";
import logger from "../utils/logger";
import { UnixTime } from "../utils/utils";

const isMember = async (
  groupId: string,
  platformUserId: number
): Promise<Boolean> => {
  try {
    const member = await Bot.Client.getChatMember(groupId, platformUserId);
    return member !== undefined && member.status === "member";
  } catch (_) {
    return false;
  }
};

const generateInvite = async (
  platformUserId: string,
  groupId: string
): Promise<string | undefined> => {
  try {
    if (!isMember(groupId, +platformUserId)) {
      await Bot.Client.unbanChatMember(groupId, +platformUserId);
      const generate = await Bot.Client.createChatInviteLink(groupId, {
        expire_date: UnixTime(new Date()) + 900,
        member_limit: 1
      });
      return generate.invite_link;
    }
    return undefined;
  } catch (err) {
    logger.error(err);
    return undefined;
  }
};

const manageGroups = async (
  params: ManageGroupsParam,
  isUpgrade: boolean
): Promise<boolean> => {
  const { platformUserId } = params;

  if (isUpgrade) {
    const invites: { link: string; name: string }[] = [];

    await Promise.all(
      params.groupIds.map(async (groupId) => {
        try {
          if (!(await isMember(groupId, +platformUserId))) {
            const inviteLink = await generateInvite(
              params.platformUserId,
              groupId
            );

            if (inviteLink !== undefined) {
              invites.push({
                link: inviteLink,
                name: await getGroupName(groupId)
              });
            }
          }
        } catch (err) {
          logger.error(err);
        }
      })
    );

    if (invites.length) {
      Bot.Client.sendMessage(
        platformUserId,
        "You have 15 minutes to join these groups before the invite links " +
          "expire:",
        Markup.inlineKeyboard(
          invites.map((inv) => [Markup.button.url(inv.name, inv.link)])
        )
      ).catch((err) => logger.error(err));
    }
  } else {
    params.groupIds.forEach(async (groupId) => {
      try {
        const member = await Bot.Client.getChatMember(groupId, +platformUserId);

        if (member?.status === "member") {
          kickUser(
            groupId,
            platformUserId,
            "have not fullfilled the requirements"
          );
        }
      } catch (err) {
        logger.error(err);
      }
    });
  }

  return true;
};

export { manageGroups, generateInvite, getGroupName, isMember };
