import { gmail_v1 } from "googleapis";
import Email from "../models/email";

export const createEmailsFromGmail = async (
  emails: gmail_v1.Schema$Message[],
  userId: number
): Promise<{ found: Email[]; created: Email[] }> => {
  const result = await Promise.all(
    emails.map((emailMeta) =>
      Email.findOrCreate({
        where: { externalId: emailMeta.id },
        defaults: { userId },
      })
    )
  );
  return result.reduce(
    (acc, [email, created]) => {
      if (created) {
        acc.created.push(email);
      } else {
        acc.found.push(email);
      }
      return acc;
    },
    { found: [], created: [] }
  );
};
