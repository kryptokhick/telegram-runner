import Bot from "../Bot";
import { ManageGroupsParam } from "./types";
import { UnixTime } from "../utils/utils";

const generateInvite = (groupId: string): Promise<string> =>
  new Promise((resolve) =>
    Bot.Client.createChatInviteLink(groupId, {
      expire_date: UnixTime(new Date()) + 600,
      member_limit: 1
    }).then((invite) => resolve(invite.invite_link))
  );

const manageGroups = (
  params: ManageGroupsParam,
  isUpgrade: boolean
): Promise<boolean> => {
  const invites: string[] = [];

  params.groupIds.forEach(async (groupId) => {
    if (isUpgrade) invites.push(await generateInvite(groupId));
    else {
      // TODO: create an own kick method with custom parameters
      Bot.Client.kickChatMember(groupId, Number(params.userId));
    }
  });

  if (isUpgrade) {
    const message: string =
      "Oh hello! I'm more than happy to tell you that you can join these " +
      `groups below:\n${invites.join("\n")}`;

    Bot.Client.sendMessage(params.userId, message);
  }
  // TODO: use the message that we get in the parameter

  return new Promise((resolve) => resolve(true));
};

export { manageGroups, generateInvite };
