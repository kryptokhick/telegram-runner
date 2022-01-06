import { sendLoginCode, signIn } from "../service/actions";
import logger from "../utils/logger";

(async () => {
  const result = await sendLoginCode();
  const phoneCodeHash = result.phone_code_hash;
  logger.info(result);

  logger.verbose("Login code: ");
  const stdin = process.openStdin();
  stdin.addListener("data", (d) => {
    const input = d.toString().trim();
    signIn(input, phoneCodeHash).then((result2) => logger.info(result2));
  });
})();
