import User from "../models/user";
import GmailHelper from "../mailApis/GmailHelper";

class PartialMailSync {
  async call(email: string, newHistoryId: string) {
    const user = await User.findOne({ where: { email } });
    const helper = new GmailHelper(
      user.accessToken,
      user.refreshToken,
      user.externalId
    );
    const resp = await helper.getPartial(user.lastHistoryId);
    console.log(resp);
  }
}

export default PartialMailSync;
