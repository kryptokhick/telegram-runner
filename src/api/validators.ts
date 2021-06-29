import { body, param } from "express-validator";

const getIdValidatorForParam = (fieldName: string) =>
  param(fieldName).isString().trim().isLength({ min: 6, max: 12 }).isNumeric();

const getIdValidatorForBody = (fieldName: string) =>
  body(fieldName).isString().trim().isLength({ min: 6, max: 12 }).isNumeric();

export default {
  paramTelegramdId: getIdValidatorForParam,
  bodyTelegramId: getIdValidatorForBody,
  groupsValidator: body("groupIds").isArray({ min: 1 }),
  messageValidator: body("message").isString().trim().isLength({ min: 1 })
};
