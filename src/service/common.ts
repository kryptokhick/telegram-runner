import axios from "axios";
import { CommunityResult } from "../api/types";
import config from "../config";
import logger from "../utils/logger";

const fetchCommunitiesOfUser = async (
  platformUserId: string
): Promise<CommunityResult[]> =>
  (
    (await axios.get(`${config.backendUrl}/communities/${platformUserId}`))
      .data as CommunityResult[]
  ).filter((community) => community.telegramIsMember);

const leaveCommunity = (platformUserId: string, communityId: string): void => {
  axios
    .post(`${config.backendUrl}/user/left`, {
      platformUserId,
      platform: config.platform,
      communityId
    })
    .then((res) => logger.debug(JSON.stringify(res.data)))
    .catch(logger.error);
};

export { leaveCommunity, fetchCommunitiesOfUser };
