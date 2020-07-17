import { highlightAuto } from "highlight.js";
import BaseDetector from "./BaseDetector";

class CodeDetector extends BaseDetector {
  public static readonly version: number = 1;
  public static readonly scanType = "CodeDetector";

  public async detect(content: string) {
    const { language, relevance } = highlightAuto(content);
    console.log(
      language,
      relevance,
      content.length,
      relevance / content.length
    );
    // based on some very hand wavy calculations
    return content.length > 0 ? relevance / content.length: content.length;
  }
}

export default CodeDetector;
