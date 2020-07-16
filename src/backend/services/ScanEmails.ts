import Email from "../models/email";
import { Op } from "sequelize";
import Scan from "../models/scan";
import GmailHelper from "../mailApis/GmailHelper";
import User from "../models/user";
import { ALL_DETECTORS } from "../detectors";

class ScanEmails {
  // Using the id here so we can serialize more easily when moving to asynchronous task queue
  async call(emailIds: number[], userId: number, detectors = ALL_DETECTORS) {
    const emails = await Email.findAll({
      where: { id: { [Op.in]: emailIds } },
    });
    console.log(emailIds);
    console.log(emails);
    const user = await User.findByPk(userId);
    const helper = new GmailHelper(
      user.accessToken,
      user.refreshToken,
      user.externalId
    );
    await Promise.all(
      emails.map(async (email) => {
        const [content] = await helper.getMessageBody([email.externalId]);
        detectors.forEach(async (Detector) => {
          const result = await new Detector().detect(content);
          await Scan.create({
            scanType: Detector.scanType,
            version: Detector.version,
            result,
            emailId: email.id,
          });
          return result;
        });
      })
    );
  }
}

export default ScanEmails;
