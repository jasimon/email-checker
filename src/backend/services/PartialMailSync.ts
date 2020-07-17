import User from "../models/user";
import GmailHelper from "../mailApis/GmailHelper";
import ScanEmails from "./ScanEmails";
import { createEmailsFromGmail } from "./helpers";

class PartialMailSync {
  async call(email: string, newHistoryId: string) {
    const user = await User.findOne({ where: { email } });
    const helper = new GmailHelper(
      user.accessToken,
      user.refreshToken,
      user.externalId
    );
    try {
      const emails = await helper.getPartial(user.lastHistoryId);
      console.log(emails);
      const { created } = await createEmailsFromGmail(emails, user.id);
      user.lastHistoryId = newHistoryId;
      await user.save();
      new ScanEmails().call(
        created.map((email) => email.id),
        user.id
      );
    } catch (err) {
      // swallow for now, at some point would be worth retrying
      console.error(err);
    }
  }
}

export default PartialMailSync;
