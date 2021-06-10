import { Router } from "express";
import { controller } from "./controller";
import validators from "./validators";

const createRouter = () => {
  const router: Router = Router();

  router.post(
    "/upgrade",
    validators.bodyTelegramId("groupId"),
    validators.bodyTelegramId("userId"),
    validators.groupsValidator,
    validators.messageValidator,
    controller.upgrade
  );

  router.post(
    "/downgrade",
    validators.bodyTelegramId("groupId"),
    validators.bodyTelegramId("userId"),
    validators.groupsValidator,
    validators.messageValidator,
    controller.downgrade
  );

  router.get(
    "/invite/:groupId",
    validators.bodyTelegramId("groupId"),
    controller.getInvite
  );

  return router;
};

export default createRouter;
