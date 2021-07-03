import Bot from "../Bot";
import { ManageGroupsParam } from "./types";
import logger from "../utils/logger";
import { UnixTime } from "../utils/utils";

const generateInvite = async (
  userId: string,
  groupId: string
): Promise<string> => {
  await Bot.Client.unbanChatMember(groupId, +userId);
  const generate = await Bot.Client.createChatInviteLink(groupId, {
    expire_date: UnixTime(new Date()) + 900,
    member_limit: 1
  });
  return generate.invite_link;
};

const manageGroups = async (
  params: ManageGroupsParam,
  isUpgrade: boolean
): Promise<boolean> => {
  const { platformUserId } = params;

  if (isUpgrade) {
    const isMember = async (groupId: string): Promise<Boolean> => {
      try {
        const member = await Bot.Client.getChatMember(groupId, +platformUserId);
        return member !== undefined && member.status === "member";
      } catch (_) {
        return false;
      }
    };

    Promise.all(
      params.groupIds.map(async (groupId) => ({
        link: await generateInvite(params.message, groupId),
        member: await isMember(groupId)
      }))
    ).then(async (groups) => {
      const invites: string[] = [];
      (await groups).forEach(async (group) => {
        if (!group.member) invites.push(group.link);
      });

      if (invites.length) {
        const message: string = `${
          "You have 15 minutes to join these groups before the invite links " +
          "expire:\n"
        }${invites.join("\n")}`;

        Bot.Client.sendMessage(platformUserId, message);
      }
    });
  } else {
    params.groupIds.forEach(async (groupId) =>
      Bot.Client.kickChatMember(groupId, +platformUserId).catch((e) =>
        logger.error(
          `Couldn't remove Telegram user with userId "${platformUserId}"${e}`
        )
      )
    );
  }

  return true;
};

export { manageGroups, generateInvite };
