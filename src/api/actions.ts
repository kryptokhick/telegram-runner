import Bot from "../Bot";
import { ManageGroupsParam } from "./types";
import logger from "../utils/logger";
import { UnixTime } from "../utils/utils";

const generateInvite = async (
  userId: string,
  groupId: string
): Promise<string | undefined> => {
  try {
    await Bot.Client.unbanChatMember(groupId, +userId);
    const generate = await Bot.Client.createChatInviteLink(groupId, {
      expire_date: UnixTime(new Date()) + 900,
      member_limit: 1
    });
    return generate.invite_link;
  } catch (err) {
    logger.error(err);
    return undefined;
  }
};

const isMember = async (groupId: string, userId: number): Promise<Boolean> => {
  try {
    const member = await Bot.Client.getChatMember(groupId, userId);
    return member !== undefined && member.status === "member";
  } catch (_) {
    return false;
  }
};

const manageGroups = async (
  params: ManageGroupsParam,
  isUpgrade: boolean
): Promise<boolean> => {
  const { platformUserId } = params;
  console.log(isUpgrade, platformUserId, params);
  if (isUpgrade) {
    const invites: string[] = [];
    await Promise.all(
      params.groupIds.map(async (groupId) => {
        try {
          const status = await isMember(groupId, +platformUserId);
          if (!status) {
            const inviteLink = await generateInvite(
              params.platformUserId,
              groupId
            );
            if (inviteLink !== undefined) invites.push(inviteLink);
          }
        } catch (err) {
          logger.error(err);
        }
      })
    );

    if (invites.length) {
      const message: string = `${
        "You have 15 minutes to join these groups before the invite links " +
        "expire: \n"
      }${invites.join("\n")}`;

      Bot.Client.sendMessage(platformUserId, message);
    }
  } else {
    params.groupIds.forEach(async (groupId) => {
      try {
        const member = await Bot.Client.getChatMember(groupId, +platformUserId);
        if (member?.status === "member") {
          Bot.Client.kickChatMember(groupId, +platformUserId).catch((e) =>
            logger.error(
              `Couldn't remove Telegram user with userId "${platformUserId}"${e}`
            )
          );
        }
      } catch (err) {
        logger.error(err);
      }
    });
  }

  return true;
};

export { manageGroups, generateInvite };
