import Queue from "bull";
import ScanEmails from "./services/ScanEmails";
import GmailHelper from "./mailApis/GmailHelper";
const emailQueue = new Queue(process.env.EMAIL_QUEUE_NAME, {
  settings: {
    backoffStrategies: {
      exponentialJitter: function (attemptsMade, err) {
        // Eventually err should be some custom error object so we only do this for rate limits
        const jitter = Math.floor(attemptsMade * (1 - Math.random()) * 1000);
        const result = Math.floor(Math.pow(3, attemptsMade) * 3000 + jitter);
        return result;
      },
    },
  },
});
GmailHelper.init(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

emailQueue.process(async (job) => {
  const {
    data: { userId, emailIds },
  } = job;
  try {
    await new ScanEmails().call(emailIds, userId);
  } catch (err) {
    console.log("error in watcher");
    console.log(job.id);
    throw err;
  }
  job.progress(100);
});
