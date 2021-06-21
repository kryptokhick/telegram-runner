// prettier-ignore
type ManageGroupsParam = {
  platformUserId: string;
  groupIds      : string[];
  message       : string;
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

export { ManageGroupsParam, CommunityResult, ErrorResult, ActionError };
