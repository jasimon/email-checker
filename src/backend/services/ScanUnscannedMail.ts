import User from "../models/user";
import Email from "../models/email";
import CodeDetector from "../detectors/CodeDetector";
import GmailHelper from "../mailApis/GmailHelper";
import Scan from "../models/scan";

class ScanUnscannedMail {
  async call(userId: number) {
    const user = await User.findByPk(userId);
    const helper = new GmailHelper(
      user.accessToken,
      user.refreshToken,
      user.externalId
    );
    const unscannedEmails = await Email.unscannedForUser(
      user.id,
      CodeDetector.scanType
    );
    console.log(unscannedEmails.length);
    // const linkResults = await Promise.all(
    //   e.map((content) => new PublicLinkDetector().detect(content))
    // );
    const codeResults = await Promise.all(
      unscannedEmails.map(async (email) => {
        const [content] = await helper.getMessageBody([email.externalId]);
        const result = await new CodeDetector().detect(content);
        console.log(email);
        await Scan.create({
          scanType: CodeDetector.scanType,
          version: CodeDetector.version,
          result,
          emailId: email.id,
        });
        return result;
      })
    );
    console.log(codeResults);
  }
}

export default ScanUnscannedMail;
