type Api = {
  prefix: string;
  port: string | number;
};

type ManageGroupsParam = {
  userId: string;
  groupIds: string[];
  message: string;
};

type InviteResult = {
  code: string;
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

export { Api, ManageGroupsParam, InviteResult, ErrorResult, ActionError };
