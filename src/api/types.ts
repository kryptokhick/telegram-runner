export type Api = {
  prefix: string;
  port: string | number;
};

export type InviteResult = {
  code: string;
};

export type ErrorResult = {
  errors: { msg: string; value: string[] }[];
};

export class ActionError extends Error {
  ids: string[];

  constructor(message: string, ids: string[]) {
    super(message);
    this.ids = ids;
  }
}
