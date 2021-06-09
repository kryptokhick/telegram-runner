import Main from "../Main";
import { ManageGroupsParam, InviteResult } from "./types";
import { UnixTime } from "../utils/utils";

async function generateInvite(groupId: string): Promise<InviteResult> {
  return {
    code: (
      await Main.Client.createChatInviteLink(groupId, {
        expire_date: UnixTime(new Date()) + 600,
        member_limit: 1
      })
    ).invite_link
  };
}

async function manageGroups(
  params: ManageGroupsParam,
  isUpgrade: boolean
): Promise<boolean> {
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

  return true;
}

export { manageGroups, generateInvite };
