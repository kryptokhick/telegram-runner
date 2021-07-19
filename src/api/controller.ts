import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { isMember, manageGroups } from "./actions";
import { IsMemberParam, ManageGroupsParam } from "./types";
import { getErrorResult } from "../utils/utils";
import logger from "../utils/logger";

const controller = {
  upgrade: (req: Request, res: Response): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const params: ManageGroupsParam = req.body;

    manageGroups(params, true)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        const errorMsg = getErrorResult(error);
        res.status(400).json(errorMsg);
      });
  },

  downgrade: (req: Request, res: Response): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const params: ManageGroupsParam = req.body;

    manageGroups(params, false)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        const errorMsg = getErrorResult(error);
        res.status(400).json(errorMsg);
      });
  },

  isMember: async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      const params: IsMemberParam = req.body;
      let isTelegramMember = false;
      await Promise.all(
        params.groupIds.map(async (groupId) => {
          const inGroup = await isMember(groupId, +params.platformUserId);
          if (inGroup) {
            isTelegramMember = true;
          }
        })
      );
      res.status(200).json(isTelegramMember);
    } catch (err) {
      logger.error(err);
    }
  }
};

export { controller };
