import axios from "axios";
import { CommunityResult } from "../api/types";
import config from "../config";
import logger from "../utils/logger";

const fetchCommunitiesOfUser = async (
  idFromPlatform: string
): Promise<CommunityResult[]> =>
  (
    (await axios.get(`${config.backendUrl}/communities/${idFromPlatform}`))
      .data as CommunityResult[]
  ).filter((community) => community.telegramIsMember);

const leaveCommunity = (idFromPlatform: string, communityId: string): void => {
  axios
    .post(`${config.backendUrl}/user/left`, {
      idFromPlatform,
      platform: config.platform,
      communityId
    })
    .then((res) => logger.debug(JSON.stringify(res.data)))
    .catch(logger.error);
};

export { leaveCommunity, fetchCommunitiesOfUser };
