import Main from "../Main";
import { InviteResult } from "./types";
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

export default { generateInvite };
