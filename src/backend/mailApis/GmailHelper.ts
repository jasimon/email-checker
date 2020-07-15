import { google, gmail_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import contentType from "content-type";

let auth: OAuth2Client;

class GmailHelper {
  private gmailApi: gmail_v1.Gmail;
  static init(clientId: string, clientSecret: string) {
    auth = new google.auth.OAuth2(clientId, clientSecret);
  }

  constructor(access_token: string, refresh_token: string) {
    if (auth == null) {
      throw Error("Must initialize GmailHelper before using the api");
    }
    auth.setCredentials({ access_token, refresh_token });

    console.log(refresh_token);
    this.gmailApi = google.gmail({ version: "v1", auth });
  }

  async listMessages(userId: string) {
    const messages = [];
    let nextPageToken = "";
    // NOTE: may need to make this a generator if there are too many messages to fit in memory
    // TODO: save this back to the user, only do when the token is expired
    await auth.getAccessToken();
    try {
      do {
        const resp = await this.gmailApi.users.messages.list({
          userId,
          maxResults: 5,
          pageToken: nextPageToken,
        });
        // When there are no messages for some reason there is no messages prop vs empty array
        resp.data.messages && messages.push(...resp.data.messages);
        nextPageToken = resp.data.nextPageToken;
      } while (nextPageToken != null);

      return messages;
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
    const contentType = this.getContentType(respObj.headers);
    console.log(contentType);
    if (respObj.parts) {
      return respObj.parts.map(this.parse, this).join("\n");
    } else if (contentType.type === "text/plain" && respObj.body.data) {
      return this.decodeText(respObj.body.data);
    }
    // images, etc.
    return "";
  }

  private getContentType(headers: gmail_v1.Schema$MessagePartHeader[]) {
    return contentType.parse(
      headers.find((header) => header.name === "Content-Type").value
    );
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
    ).toString();
  }

  // TODO: watch endpoint
}

export default GmailHelper;
