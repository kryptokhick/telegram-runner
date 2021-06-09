import logger from "./logger";
import { ActionError, ErrorResult } from "../api/types";

const UnixTime = (date: Date): number => Math.floor((date as unknown as number) / 1000);

const getErrorResult = (error: Error): ErrorResult => {
  let errorMsg: string;
  let ids: string[];

  if (error instanceof ActionError) {
    errorMsg = error.message;
    ids = error.ids;
  } else {
    logger.error(error);
    errorMsg = "unknown error";
    ids = [];
  }

  return {
    errors: [
      {
        msg: errorMsg,
        value: ids
      }
    ]
  };
};

export { UnixTime, getErrorResult };
