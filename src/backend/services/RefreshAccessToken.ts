import User from "../models/user";
import GmailHelper from "../mailApis/GmailHelper";

class RefreshUserAccessToken {
  async call(userId: number) {
    const user = await User.findByPk(userId);
    if (user.accessTokenExpiry < new Date()) {
      const helper = new GmailHelper(
        user.accessToken,
        user.refreshToken,
        user.externalId
      );
      const resp = await helper.refreshAccessToken();
      user.accessToken = resp.token;
      //   set to 55 mins in the future since it expires after an hour and we don't want to worry about crossing over
      user.accessTokenExpiry = new Date(new Date().getTime() + 55 * 60 * 1000);
    }
    return user;
  }
}

export default RefreshUserAccessToken;
