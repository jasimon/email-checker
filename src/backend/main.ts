import * as express from "express";
import * as path from "path";
import dotenv from "dotenv";
import { google } from "googleapis";
import expressSession from "express-session";
import cookieParser from "cookie-parser";
import GmailHelper from "./mailApis/GmailHelper";
import CodeDetector from "./detectors/CodeDetector";
import PublicLinkDetector from "./detectors/PublicLinkDetector";
import User from "./models/user";

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
let profileObj;
let tokenObj;

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
    req.session.user = user.toJSON();
    // if (created) {
    //   // trigger initial storage
    // }
  } catch (err) {
    console.error(err);
  }
  false && gmailHandler(tokenObj, profileObj);
  // eventually this will be some sort of user model
  // res.send(profileObj);
});

async function gmailHandler(tokenObj: any, profileObj: any) {
  const helper = new GmailHelper(tokenObj.access_token);
  const d = await helper.listMessages(profileObj.googleId);
  const e = await helper.getMessageBody(
    profileObj.googleId,
    d.map((el) => el.id)
  );
  console.log(e);
  e.map((content) => {
    new CodeDetector().detect(content);
    new PublicLinkDetector().detect(content);
  });
}

// Serve static files
app.use("/", express.static(path.join(__dirname, "/www")));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
