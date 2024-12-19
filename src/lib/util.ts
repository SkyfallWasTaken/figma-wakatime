const PREFIX = "[WakaTime for Figma]";
const STYLE = "color: #007acc; font-weight: bold;";

export const log = {
  debug: (...args: any[]) => console.debug(`%c${PREFIX}`, STYLE, ...args),
  info: (...args: any[]) => console.log(`%c${PREFIX}`, STYLE, ...args),
  warn: (...args: any[]) => console.warn(`%c${PREFIX}`, STYLE, ...args),
  error: (...args: any[]) => console.error(`%c${PREFIX}`, STYLE, ...args),
};

export async function getFileLastEditAt(filekey: string, cookie: string) {
  const response = await fetch(`https://www.figma.com/api/files/${filekey}/view`, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "x-csrf-bypass": "yes",
      Cookie: `__Host-figma.authn=${encodeURIComponent(cookie)}`,
    },
  });
  const json = await response.json();
  if (json.error) {
    throw new Error("An error occurred while fetching file metadata: " + JSON.stringify(json));
  }
  // I know the fn says "last_edit_at" but that's kinda laggy -
  // last_view_at is more accurate
  return new Date(json.meta.last_view_at).getTime();
}