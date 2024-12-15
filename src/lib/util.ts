const PREFIX = "[Figma for WakaTime]";
export const log = {
  debug: (...args: any[]) => console.debug(PREFIX, ...args),
  info: (...args: any[]) => console.log(PREFIX, ...args),
  warn: (...args: any[]) => console.warn(PREFIX, ...args),
  error: (...args: any[]) => console.error(PREFIX, ...args),
};
