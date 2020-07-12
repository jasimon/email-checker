import axios from "axios";

const URL_REGEX = /https?:\/\/docs.google.com[^\s]*/g;

class PublicLinkDetector {
  public readonly version: number = 1;
  public detect(content: string) {
    // 1. find all docs links
    const matches = content.match(URL_REGEX);
    if (!matches) {
      return true;
    }
    // GET all links, return false if any return 200 (vs 302 to redirect to sign in)
    return matches
      .map(async (match) => {
        try {
          await axios(match, { maxRedirects: 0 });
          console.log("failed", match);
          return false;
        } catch (err) {
          console.log("succeeded", match);
          return true;
        }
      })
      .every((x) => x);
  }
}

export default PublicLinkDetector;
