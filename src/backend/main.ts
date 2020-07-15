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
  const user = await User.findOne({ where: { id: 1 || req.session.user.id } });
  gmailHandler(user);
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
    req.session.user = { id: user.getDataValue("id") };
    // if (created) {
    //   // trigger initial storage
    // }
    gmailHandler(user);
    res.send({ id: user.getDataValue("id") });
  } catch (err) {
    console.error(err);
  }
  // eventually this will be some sort of user model
  // res.send(profileObj);
});

async function gmailHandler(user: User) {
  const helper = new GmailHelper(
    user.getDataValue("accessToken"),
    user.getDataValue("refreshToken")
  );
  const d = await helper.listMessages(user.getDataValue("externalId"));
  const e = await helper.getMessageBody(
    user.getDataValue("externalId"),
    d.map((el) => el.id)
  );
  console.log(e);
  const linkResults = await Promise.all(
    e.map((content) => new PublicLinkDetector().detect(content))
  );
  const codeResults = await Promise.all(
    e.map((content) => new CodeDetector().detect(content))
  );
  console.log(
    `public link check: ${linkResults.filter((x) => x > 0.8).length} out of ${
      linkResults.length
    } failed`
  );
  console.log(
    `code check: ${codeResults.filter((x) => x > 0.8).length} out of ${
      codeResults.length
    } failed`
  );
}

// Serve static files
app.use("/", express.static(path.join(__dirname, "/www")));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
