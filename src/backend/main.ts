import * as express from "express";
import * as path from "path";
import fs from "fs";
import GmailHelper from "./mailApis/GmailHelper";

var app = express();

fs.readFile(process.env.GOOGLE_CREDENTIALS_FILE, (err, content) => {
  if (err) {
    throw Error(`unable to read google credentials, recieved error: ${err}`);
  }
  const { client_id: clientId, client_secret: clientSecret } = JSON.parse(
    content.toString()
  ).web;
  GmailHelper.init(clientId, clientSecret);
});

app.use(express.json());
let profileObj;
let tokenObj;

// Simple endpoint that returns the current time
app.get("/api/time", function (req, res) {
  res.send(new Date().toISOString());
});

app.post("/api/auth", function (req, res) {
  // just store in memory for now
  profileObj = req.body.profileObj;
  tokenObj = req.body.tokenObj;
  console.log(tokenObj);
  gmailHandler(tokenObj, profileObj);
  // eventually this will be some sort of user model
  res.send(profileObj);
});

async function gmailHandler(tokenObj: any, profileObj: any) {
  const helper = new GmailHelper(tokenObj.access_token);
  const d = await helper.listMessages(profileObj.googleId);
  const e = await helper.getMessageBody(
    profileObj.googleId,
    d.map((el) => el.id)
  );
  console.log(e);
}

// Serve static files
app.use("/", express.static(path.join(__dirname, "/www")));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
