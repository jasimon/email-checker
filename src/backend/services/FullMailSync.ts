import User from "../models/user";
import GmailHelper from "../mailApis/GmailHelper";
import PublicLinkDetector from "../detectors/PublicLinkDetector";
import CodeDetector from "../detectors/CodeDetector";
import Email from "../models/email";

class FullMailSync {
  async call(userId: number) {
    const user = await User.findByPk(userId);
    const helper = new GmailHelper(
      user.accessToken,
      user.refreshToken,
      user.externalId
    );
    const emails = await helper.listMessages(user.externalId);
    // TODO: error handling
    emails.map((emailMeta) => {
      Email.findOrCreate({
        where: { externalId: emailMeta.id },
        defaults: { userId },
      });
    });
    if (false) {
      const e = await helper.getMessageBody(emails.map((el) => el.id));
      console.log(e);
      const linkResults = await Promise.all(
        e.map((content) => new PublicLinkDetector().detect(content))
      );
      const codeResults = await Promise.all(
        e.map((content) => new CodeDetector().detect(content))
      );
      console.log(
        `public link check: ${
          linkResults.filter((x) => x > 0.8).length
        } out of ${linkResults.length} failed`
      );
      console.log(
        `code check: ${codeResults.filter((x) => x > 0.8).length} out of ${
          codeResults.length
        } failed`
      );
    }
  }
}

export default FullMailSync;
