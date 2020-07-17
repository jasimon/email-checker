import { google, gmail_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import contentType from "content-type";
import { sleep } from "../helpers";

let auth: OAuth2Client;

const MAX_REQUESTS = 5;

class GmailHelper {
  private gmailApi: gmail_v1.Gmail;
  private externalId: string;
  static init(clientId: string, clientSecret: string) {
    auth = new google.auth.OAuth2(clientId, clientSecret);
  }

  constructor(accessToken: string, refreshToken: string, externalId: string) {
    if (auth == null) {
      throw Error("Must initialize GmailHelper before using the api");
    }
    this.externalId = externalId;
    auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    this.gmailApi = google.gmail({ version: "v1", auth });
  }

  async refreshAccessToken() {
    // TODO: save this back to the user, only do when the token is expired
    try {
      return await auth.getAccessToken();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async *listMessages(userId: string) {
    let nextPageToken = "";
    // NOTE: may need to make this a generator if there are too many messages to fit in memory
    try {
      do {
        const resp = await this.makeRequest(() =>
          this.gmailApi.users.messages.list({
            userId,
            pageToken: nextPageToken,
          })
        );
        // When there are no messages for some reason there is no messages prop vs empty array
        yield resp.data.messages || [];
        nextPageToken = resp.data.nextPageToken;
      } while (nextPageToken != null);

      return { done: true };
    } catch (err) {
      // TODO: handle different errors (e.g. rate limit)
      console.log(err);
      throw err;
    }
  }

  private async makeRequest<T>(
    requestFn: () => Promise<T>,
    count = 1
  ): Promise<T> {
    try {
      const resp = await requestFn();
      return resp;
    } catch (err) {
      console.log(err);
      if (count > MAX_REQUESTS) {
        throw err;
      }
      const seconds = Math.pow(3, count);
      // adding a random offset to the backoff to avoid a thundering herd-like problem
      const randomOffset = count * (Math.floor(Math.random() * 1000) - 500);
      await sleep(seconds * 1000 + randomOffset);
      return await this.makeRequest(requestFn, count++);
    }
  }

  async getMessageBody(messageIds: string[]) {
    //   For now just iterate since node library doesn't support batching, can add that in later
    return await Promise.all(
      messageIds.map(async (messageId) => {
        try {
          // for now bubble this error since we're handling one by one and let job queue do backoff
          const resp = await this.gmailApi.users.messages.get({
            userId: this.externalId,
            id: messageId,
          });
          const body = this.parse(resp.data.payload);
          return body;
        } catch (err) {
          console.log(err);
          throw err;
        }
      })
    );
  }

  async subscribeToUpdates() {
    try {
      const resp = await this.gmailApi.users.watch(
        { userId: this.externalId },
        {
          body: JSON.stringify({
            topicName: process.env.GMAIL_TOPIC_NAME,
          }),
        }
      );
      return resp.data;
    } catch (err) {
      console.dir(err);
      throw err;
    }
  }

  async getPartial(historyId: string): Promise<gmail_v1.Schema$Message[]> {
    const resp = await this.gmailApi.users.history.list({
      startHistoryId: historyId,
      historyTypes: ["messageAdded"],
      userId: this.externalId,
    });
    console.log(resp.data);
    if (!resp.data.history) {
      return [];
    }
    return resp.data.history
      .map((hist) => hist.messagesAdded.map((mAdd) => mAdd.message))
      .reduce((acc, arr) => acc.concat(arr), []);
  }

  parse(respObj: gmail_v1.Schema$MessagePart): any {
    // console.log(respObj.body && respObj.body.size);
    const contentType = this.getContentType(respObj.headers);
    if (respObj.parts) {
      return respObj.parts.map(this.parse, this).join("\n");
    } else if (contentType.type === "text/plain" && respObj.body.data) {
      return GmailHelper.decodeText(respObj.body.data);
    }
    // images, etc.
    return "";
  }

  private getContentType(headers: gmail_v1.Schema$MessagePartHeader[]) {
    const contentTypeHeader = headers.find(
      (header) => header.name === "Content-Type"
    );
    return contentTypeHeader
      ? contentType.parse(contentTypeHeader.value)
      : { type: "" };
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

  static decodeText(str: string) {
    // need to handle this specially because Google uses non-standard characters in their base 64 encoding
    return Buffer.from(
      str.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString();
  }

  // TODO: watch endpoint
}

export default GmailHelper;
