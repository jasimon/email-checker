import Email from "../models/email";
import CodeDetector from "../detectors/CodeDetector";
import ScanEmails from "./ScanEmails";

class ScanUnscannedMail {
  async call(userId: number) {
    const unscannedEmails = await Email.unscannedForUser(
      userId,
      CodeDetector.scanType
    );
    console.log(unscannedEmails.length);
    new ScanEmails().call(
      unscannedEmails.map((email) => email.id),
      userId,
      [CodeDetector]
    );
  }
}

export default ScanUnscannedMail;
