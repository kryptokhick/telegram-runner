import Bot from "../Bot";
import { ManageGroupsParam } from "./types";
import { UnixTime } from "../utils/utils";
import logger from "../utils/logger";

const generateInvite = async (groupId: string): Promise<string> =>
  (
    await Bot.Client.createChatInviteLink(groupId, {
      expire_date: UnixTime(new Date()) + 900,
      member_limit: 1
    })
  ).invite_link;

const manageGroups = (
  params: ManageGroupsParam,
  isUpgrade: boolean
): Promise<boolean> => {
  const invites: string[] = [];
  const {platformUserId} = params;

  params.groupIds.forEach(async (groupId) => {
    if (isUpgrade) {
      Bot.Client.getChatMember(groupId, Number(platformUserId))
        .then(async () => invites.push(await generateInvite(groupId)))
        .catch(() =>
          logger.error(
            `Telegram user ${platformUserId} is not a member ` +
              `of the group ${groupId}`
          )
        );
    } else {
      // TODO: create an own kick method with custom parameters
      Bot.Client.kickChatMember(groupId, Number(platformUserId)).catch((e) =>
        logger.error(
          `Couldn't remove Telegram user with userId "${platformUserId}"${e}`
        )
      );
    }
  });

  if (isUpgrade && invites.length) {
    const message: string = `${
      "You have 15 minutes to join these groups before the invite links " +
      "expire:\n"
    }${invites.join("\n")}`;

    Bot.Client.sendMessage(platformUserId, message);
  }
  // TODO: use the message that we get in the parameter

  return new Promise((resolve) => resolve(true));
};

export { manageGroups, generateInvite };
