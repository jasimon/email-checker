abstract class BaseDetector {
  public abstract async detect(content: string): Promise<number>;
}

export default BaseDetector;
