import { Markup } from "telegraf";
import { leaveCommunity } from "./common";

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

export { confirmLeaveCommunityAction, confirmedLeaveCommunityAction };
