import GmailHelper from "../mailApis/GmailHelper";
import { createEmailsFromGmail } from "./helpers";
import RefreshUserAccessToken from "./RefreshAccessToken";
import Queue from "bull";

const emailQueue = Queue(process.env.EMAIL_QUEUE_NAME);
class FullMailSync {
  async call(userId: number) {
    const user = await new RefreshUserAccessToken().call(userId);
    const helper = new GmailHelper(
      user.accessToken,
      user.refreshToken,
      user.externalId
    );
    for await (const emails of helper.listMessages(user.externalId)) {
      const { created } = await createEmailsFromGmail(emails, user.id);

      // Doing one at a time for now for better retryability of jobs
      created.map((email) => {
        emailQueue.add(
          {
            emailIds: [email.id],
            userId: user.id,
          },
          { attempts: 5, backoff: { type: "exponentialJitter" } }
        );
      });
    }
  }
}

export default FullMailSync;
