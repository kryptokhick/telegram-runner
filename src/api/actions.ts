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

  params.groupIds.forEach(async (groupId) => {
    if (isUpgrade) invites.push(await generateInvite(groupId));
    else {
      // TODO: create an own kick method with custom parameters
      Bot.Client.kickChatMember(groupId, Number(params.platformUserId)).catch(
        (e) =>
          logger.error(
            `Couldn't remove user with userId "${params.platformUserId}"${  e}`
          )
      );
    }
  });

  if (isUpgrade) {
    const message: string =
      "Oh hello! I'm more than happy to tell you that you can join these " +
      `groups below:\n${invites.join("\n")}`;

    Bot.Client.sendMessage(params.platformUserId, message);
  }
  // TODO: use the message that we get in the parameter

  return new Promise((resolve) => resolve(true));
};

export { manageGroups, generateInvite };
