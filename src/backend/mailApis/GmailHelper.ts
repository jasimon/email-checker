import { google, gmail_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

let auth: OAuth2Client;

class GmailHelper {
  private gmailApi: gmail_v1.Gmail;
  static init(clientId: string, clientSecret: string) {
    auth = new google.auth.OAuth2(clientId, clientSecret);
  }

  constructor(access_token: string) {
    if (auth == null) {
      throw Error("Must initialize GmailHelper before using the api");
    }
    auth.setCredentials({ access_token });
    this.gmailApi = google.gmail({ version: "v1", auth });
  }

  async listMessages(userId: string) {
    try {
      const resp = await this.gmailApi.users.messages.list({ userId });
      return resp.data.messages;
    } catch (err) {
      // TODO: handle different errors (e.g. rate limit)
      console.log(err);
      throw err;
    }
  }

  async getMessageBody(userId: string, messageIds: string[]) {
    //   For now just iterate since node library doesn't support batching, can add that in later
    return await Promise.all(
      messageIds.map(async (messageId) => {
        try {
          const resp = await this.gmailApi.users.messages.get({
            userId,
            id: messageId,
          });
          const body = this.parse(resp.data.payload);
          return body;
        } catch (err) {
          console.log(err);
          return err;
        }
      })
    );
  }

  parse(respObj: gmail_v1.Schema$MessagePart): any {
    // console.log(respObj.body && respObj.body.size);
    if (respObj.parts) {
      return respObj.parts.map(this.parse, this);
    } else if (respObj.body && respObj.body.data) {
      return this.decodeText(respObj.body.data);
    }
    // images, etc.
    return "";
  }

  async getAttachments(userId: string, messageIds: string[]) {
    return await Promise.all(
      messageIds.map(async (id) => {
        try {
          const resp = await this.gmailApi.users.messages.attachments.get({
            userId,
            id,
          });
          return resp.data;
        } catch (err) {
          console.log(err);
          return err;
        }
      })
    );
  }

  private decodeText(str: string) {
    // need to handle this specially because Google uses non-standard characters in their base 64 encoding
    return Buffer.from(
      str.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("binary");
  }

  // TODO: watch endpoint
}

export default GmailHelper;
