import * as express from "express";
import * as path from "path";
import dotenv from "dotenv";
import { google } from "googleapis";
import expressSession from "express-session";
import cookieParser from "cookie-parser";
import GmailHelper from "./mailApis/GmailHelper";
import User from "./models/user";
import FullMailSync from "./services/FullMailSync";
import PartialMailSync from "./services/PartialMailSync";
import Email from "./models/email";
import Scan from "./models/scan";
import { Op } from "sequelize";
import { ALL_DETECTORS } from "./detectors";
import WatchUser from "./services/watchUser";
import Queue from "bull";
import { setQueues, UI } from "bull-board";

dotenv.config();

var app = express();
const emailQueue = new Queue(process.env.EMAIL_QUEUE_NAME);
setQueues([emailQueue]);

GmailHelper.init(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

app.use(express.json());
app.use(cookieParser());

app.use(
  expressSession({
    name: "user_sid",
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

async function authEndpoint(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!req.session.user) {
    res.sendStatus(401);
  }
  next();
}

app.get("/api/user/status", authEndpoint, async function (req, res) {
  console.log(req.session);
  const { id } = req.session.user;
  const emailIds = (
    await Email.findAll({
      where: { userId: id },
      attributes: ["id"],
    })
  ).map((email) => email.id);
  const scanMetrics = await Promise.all(
    ALL_DETECTORS.map(async (Detector) => {
      const totalScans = await Scan.count({
        where: {
          scanType: Detector.scanType,
        },
        include: [{ model: Email, where: { userId: id }, required: true }],
      });
      const failedScans = await Scan.count({
        where: {
          scanType: Detector.scanType,
          result: { [Op.gt]: 0.8 },
        },
        include: [{ model: Email, where: { userId: id }, required: true }],
      });
      return { totalScans, failedScans, type: Detector.scanType };
    })
  );
  // have to use a normal find method here to include the email model
  const lastScan = (
    await Scan.findAll({
      order: [["createdAt", "DESC"]],
      attributes: ["createdAt"],
      limit: 1,
      include: [{ model: Email, where: { userId: id }, required: true }],
    })
  )[0];
  res.set(
    "etag",
    ((lastScan && lastScan.createdAt) || new Date()).getTime().toString()
  );
  res.send({ scanMetrics, emailCount: emailIds.length });
});

app.post("/webhooks/gmail_messages", async function (req, res) {
  const { data } = req.body.message;
  const { historyId, emailAddress: email } = JSON.parse(
    GmailHelper.decodeText(data)
  );
  new PartialMailSync().call(email, historyId);

  res.sendStatus(200);
});

app.post("/api/auth", async function (req, res) {
  try {
    const { tokens } = await oauth2Client.getToken(req.body.code);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const {
      sub,
      email,
      given_name: givenName,
      family_name: familyName,
    } = ticket.getPayload();
    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        firstName: givenName,
        lastName: familyName,
        externalId: sub,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        accessTokenExpiry: new Date(tokens.expiry_date),
      },
    });
    req.session.user = { id: user.id };
    if (created) {
      // trigger initial storage
      // wait on the watch so we don't miss any emails
      await new WatchUser().call(user.id);
      new FullMailSync().call(user.id);
    }
    res.send({ id: user.id });
  } catch (err) {
    console.error(err);
    throw err;
  }
});

app.use("/admin/queues", UI);
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie("user_sid");
  }
  next();
});
// Serve static files
app.use("/", express.static(path.join(__dirname, "/www")));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
