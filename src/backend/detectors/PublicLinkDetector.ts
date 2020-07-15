import axios from "axios";
import BaseDetector from "./BaseDetector";

const DOCS_REGEX = /https?:\/\/docs.google.com[^\s]*/g;
const PAPER_REGEX = /https?:\/\/paper.dropbox.com[^\s]*/g;

class PublicLinkDetector extends BaseDetector {
  public readonly version: number = 1;
  public async detect(content: string) {
    // 1. find all docs links
    // keeping separate for now since we may want to handle differently based on http response codes
    const docsMatches = content.match(DOCS_REGEX) || [];
    const paperMatches = content.match(PAPER_REGEX) || [];
    if (!docsMatches) {
      return 0;
    }
    // GET all links, return false if any return 200 (vs 302 to redirect to sign in)
    return (
      await Promise.all([
        ...docsMatches.map(this.testLink),
        ...paperMatches.map(this.testLink),
      ])
    ).every((x) => x)
      ? 0
      : 1;
  }

  private async testLink(url: string): Promise<boolean> {
    try {
      await axios(url, { maxRedirects: 0 });
      console.log("failed", url);
      return false;
    } catch (err) {
      console.log("succeeded", url);
      return true;
    }
  }
}

export default PublicLinkDetector;
