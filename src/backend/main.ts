import * as express from "express";
import * as path from "path";
import dotenv from "dotenv";
import { google } from "googleapis";
import expressSession from "express-session";
import cookieParser from "cookie-parser";
import GmailHelper from "./mailApis/GmailHelper";
import User from "./models/user";
import FullMailSync from "./services/FullMailSync";
import ScanUnscannedMail from "./services/ScanUnscannedMail";

dotenv.config();

var app = express();

GmailHelper.init(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

const redirectUri = "http://localhost:8000";
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
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

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie("user_sid");
  }
  next();
});

app.get("/api/user/status", async function (req, res) {
  console.log(req.session.user);
  // const user = await User.findOne({ where: { id: 1 || req.session.user.id } });
  // gmailHandler(user);
  // historyHelper(user);
  new ScanUnscannedMail().call(1);
});

app.post("/webhooks/gmail_messages", async function (req, res) {
  const { data } = req.body.message;
  console.log(data);
  console.log(GmailHelper.decodeText(data));
  const { historyId, emailAddress: email } = JSON.parse(
    GmailHelper.decodeText(data)
  );
  const user = await User.findOne({ where: { email } });

  const helper = new GmailHelper(
    user.getDataValue("accessToken"),
    user.getDataValue("refreshToken"),
    user.getDataValue("externalId")
  );

  helper.getPartial(historyId);

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
    const [user /*, created*/] = await User.findOrCreate({
      where: { email },
      defaults: {
        firstName: givenName,
        lastName: familyName,
        externalId: sub,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      },
    });
    req.session.user = { id: user.id };
    // if (created) {
    //   // trigger initial storage
    // }
    new FullMailSync().call(user.id);
    res.send({ id: user.id });
  } catch (err) {
    console.error(err);
  }
  // eventually this will be some sort of user model
  // res.send(profileObj);
});

// async function historyHelper(user: User) {
//   const helper = new GmailHelper(
//     user.getDataValue("accessToken"),
//     user.getDataValue("refreshToken"),
//     user.getDataValue("externalId")
//   );

//   helper.getPartial("3052");
// }

// Serve static files
app.use("/", express.static(path.join(__dirname, "/www")));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
