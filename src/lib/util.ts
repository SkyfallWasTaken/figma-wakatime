const PREFIX = "[WakaTime for Figma]";
const STYLE = "color: #007acc; font-weight: bold;";

export const log = {
  debug: (...args: any[]) => console.debug(`%c${PREFIX}`, STYLE, ...args),
  info: (...args: any[]) => console.log(`%c${PREFIX}`, STYLE, ...args),
  warn: (...args: any[]) => console.warn(`%c${PREFIX}`, STYLE, ...args),
  error: (...args: any[]) => console.error(`%c${PREFIX}`, STYLE, ...args),
};
