import { highlightAuto } from "highlight.js";
class CodeDetector {
  public readonly version: number = 1;

  public detect(content: string) {
    console.log(content);
    const { language, relevance } = highlightAuto(content);
    console.log(language, relevance);
    // based on some very hand wavy calculations
    return relevance < 20;
  }
}

export default CodeDetector;
