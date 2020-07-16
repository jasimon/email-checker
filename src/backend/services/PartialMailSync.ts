import User from "../models/user";
import GmailHelper from "../mailApis/GmailHelper";
import Email from "../models/email";
import { gmail_v1 } from "googleapis";
import ScanEmails from "./ScanEmails";

const createEmails = async (
  emails: gmail_v1.Schema$Message[],
  userId: number
): Promise<{ found: Email[]; created: Email[] }> => {
  const result = await Promise.all(
    emails.map((emailMeta) =>
      Email.findOrCreate({
        where: { externalId: emailMeta.id },
        defaults: { userId },
      })
    )
  );
  return result.reduce(
    (acc, [email, created]) => {
      if (created) {
        acc.created.push(email);
      } else {
        acc.found.push(email);
      }
      return acc;
    },
    { found: [], created: [] }
  );
};

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
      const { created } = await createEmails(emails, user.id);
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
