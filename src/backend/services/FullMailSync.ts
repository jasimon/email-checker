import User from "../models/user";
import GmailHelper from "../mailApis/GmailHelper";
import { createEmailsFromGmail } from "./helpers";
import ScanEmails from "./ScanEmails";

class FullMailSync {
  async call(userId: number) {
    const user = await User.findByPk(userId);
    const helper = new GmailHelper(
      user.accessToken,
      user.refreshToken,
      user.externalId
    );
    for await (const emails of helper.listMessages(user.externalId)) {
      const { created } = await createEmailsFromGmail(emails, user.id);
      await new ScanEmails().call(
        created.map((email) => email.id),
        user.id
      );
    }
  }
}

export default FullMailSync;
