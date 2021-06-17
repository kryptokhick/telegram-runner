import axios from "axios";
import { Markup } from "telegraf";
import { CommunityResult } from "./api/types";
import config from "./config";
import logger from "./utils/logger";

const fetchCommunitiesOfUser = async (
  idFromPlatform: string
): Promise<CommunityResult[]> =>
  (await axios.get(`${config.backendUrl}/communities/${idFromPlatform}`)).data;

const leaveCommunity = (idFromPlatform: string, communityId: string): void => {
  axios
    .post(`${config.backendUrl}/user/left`, {
      idFromPlatform,
      platform: config.platform,
      communityId
    })
    .then((res) => logger.debug(JSON.stringify(res.data)))
    .catch(logger.error);
};

const confirmLeaveCommunityAction = (ctx: any): void => {
  const data = ctx.match[0];
  const commId = data.split("_")[2];
  const commName = data.split(`leave_confirm_${commId}_`)[1];

  ctx.replyWithMarkdown(
    `You'll be kicked from every *${commName}* group. Are you sure?`,
    Markup.inlineKeyboard([
      Markup.button.callback("Yes", `leave_confirmed_${commId}`),
      Markup.button.callback("No", "no")
    ])
  );
};

const confirmedLeaveCommunityAction = (ctx: any): void => {
  leaveCommunity(
    ctx.update.callback_query.from.id,
    ctx.match[0].split("leave_confirmed_")[1]
  );
};

export {
  leaveCommunity,
  fetchCommunitiesOfUser,
  confirmLeaveCommunityAction,
  confirmedLeaveCommunityAction
};
