import User from "../models/user";
import GmailHelper from "../mailApis/GmailHelper";

class WatchUser {
  async call(userId: number) {
    const user = await User.findByPk(userId);
    const helper = new GmailHelper(
      user.accessToken,
      user.refreshToken,
      user.externalId
    );
    const { historyId, expiration } = await helper.subscribeToUpdates();
    user.lastHistoryId = historyId;
    user.watchExpiration = expiration;
    return await user.save();
  }
}

export default WatchUser;
