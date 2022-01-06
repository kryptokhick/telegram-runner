import config from "../config";
import mtprotoApi from "../mtproto";
import logger from "../utils/logger";

const sendLoginCode = async () =>
  mtprotoApi.call("auth.sendCode", {
    phone_number: config.phoneNumber,
    api_id: config.mtproto.apiId,
    api_hash: config.mtproto.apiHash,
    settings: {
      _: "codeSettings"
    }
  });

const signIn = async (phoneCode: string, phoneCodeHash: string) =>
  mtprotoApi.call("auth.signIn", {
    phone_number: config.phoneNumber,
    phone_code: phoneCode,
    phone_code_hash: phoneCodeHash
  });

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
