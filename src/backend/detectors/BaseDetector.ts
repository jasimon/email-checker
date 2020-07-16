abstract class BaseDetector {
  public static readonly version: number;
  public static readonly scanType: string;
  public abstract async detect(content: string): Promise<number>;
}

export default BaseDetector;
