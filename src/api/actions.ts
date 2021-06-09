import Main from "../Main";
import { ManageGroupsParam, InviteResult } from "./types";
import { UnixTime } from "../utils/utils";

const generateInvite = (groupId: string): Promise<InviteResult> =>
  new Promise((resolve) =>
    Main.Client.createChatInviteLink(groupId, {
      expire_date: UnixTime(new Date()) + 600,
      member_limit: 1
    }).then((invite) => resolve({ code: invite.invite_link }))
  );

const manageGroups = (
  params: ManageGroupsParam,
  isUpgrade: boolean
): Promise<boolean> => {
  const invites: string[] = [];

  params.groupIds.forEach(async (groupId) => {
    if (isUpgrade) invites.push((await generateInvite(groupId)).code);
    else {
      // TODO: create an own kick method with custom parameters
      Main.Client.kickChatMember(groupId, Number(params.userId));
    }
  });

  if (isUpgrade) {
    const message: string =
      "Oh hello! I'm more than happy to tell you that you can join these " +
      `groups below:\n${invites.join("\n")}`;

    Main.Client.sendMessage(params.userId, message);
  }
  // TODO: use the message that we get in the parameter

  return new Promise((resolve) => resolve(true));
};

export { manageGroups, generateInvite };
