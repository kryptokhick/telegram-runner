// prettier-ignore
type ManageGroupsParam = {
  userId  : string;
  groupIds: string[];
  message : string;
};

type InviteResult = {
  code: string;
};

// prettier-ignore
type CommunityResult = {
  id              : string;
  name            : string;
  url             : string;
  telegramIsMember: boolean;
};

type ErrorResult = {
  errors: { msg: string; value: string[] }[];
};

class ActionError extends Error {
  ids: string[];

  constructor(message: string, ids: string[]) {
    super(message);
    this.ids = ids;
  }
}

export {
  ManageGroupsParam,
  InviteResult,
  CommunityResult,
  ErrorResult,
  ActionError
};
