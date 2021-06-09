import { Router } from "express";
import controller from "./controller";
// import validators from "./validators";

const createRouter = () => {
  const router: Router = Router();

  router.post(
    "/upgrade",
    // TODO: add validators
    controller.upgrade
  );

  router.post(
    "/downgrade",
    // TODO: add validators
    controller.downgrade
  );

  router.get(
    "/invite/:guildId",
    // TODO: add validators
    controller.getInvite
  );

  return router;
};

export default createRouter;
