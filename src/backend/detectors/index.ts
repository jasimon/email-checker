import CodeDetector from "./CodeDetector";
import PublicLinkDetector from "./PublicLinkDetector";

export { default as BaseDetector } from "./BaseDetector";
export const ALL_DETECTORS = [CodeDetector, PublicLinkDetector];
export { CodeDetector, PublicLinkDetector };
