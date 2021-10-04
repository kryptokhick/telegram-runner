import { Router } from "express";
import { controller } from "./controller";
import validators from "./validators";

const createRouter = () => {
  const router: Router = Router();

  router.post(
    "/upgrade",
    [
      validators.bodyUserHash("userHash"),
      validators.groupsValidator,
      validators.messageValidator
    ],
    controller.upgrade
  );

  router.post(
    "/downgrade",
    [
      validators.bodyUserHash("userHash"),
      validators.groupsValidator,
      validators.messageValidator
    ],
    controller.downgrade
  );

  router.post(
    "/isMember",
    [validators.bodyUserHash("userHash"), validators.groupsValidator],
    controller.isMember
  );

  router.post("/group", [validators.titleValidator], controller.createGroup);

  router.get("/sendLoginCode", controller.sendLoginCode);

  router.post(
    "/signIn",
    [
      validators.notEmptyValidator("phoneCode"),
      validators.notEmptyValidator("phoneCodeHash")
    ],
    controller.signIn
  );

  return router;
};

export default createRouter;
