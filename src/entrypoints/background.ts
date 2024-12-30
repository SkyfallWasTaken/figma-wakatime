import WakaTime from "@/lib/wakatime";
import { i2bMessenger } from "@/lib/messaging/i2b-messaging";
import { log, sha256 } from "@/lib/util";
import { wakaApiKey, figmaApiKey, apiUrl } from "@/lib/store";
import { get } from "svelte/store";

export default defineBackground(() => {
  log.info("Background script loaded");

  globalThis.addEventListener("error", onError);
  i2bMessenger.onMessage("error", async (message) => onError(message.data));

  const wakatime = new WakaTime(get(wakaApiKey)!, get(apiUrl)!);
  wakaApiKey.subscribe((value) => {
    if (value) {
      wakatime.apiKey = value;
    }
  });
  apiUrl.subscribe((value) => {
    if (value) {
      wakatime.apiUrl = value;
    }
  });
  i2bMessenger.onMessage("emitHeartbeat", async (message) => {
    wakatime.emitHeartbeat(message.data);
  });

  i2bMessenger.onMessage("getDocHash", async (message) => {
    const filekey = message.data;
    const response = await fetch("https://api.figma.com/v1/files/" + filekey, {
      headers: {
        "X-Figma-Token": get(figmaApiKey)!,
      },
    });
    if (!response.ok) {
      console.log(await response.text());

      // FIXME: This is bad. I know it is bad. Sorry. If it's not fixed by the 3rd of January, 2025, please let me know.
      const message = `HTTP ${response.status} when getting file ${filekey} - is the Figma API key correct?`
      onError(new ErrorEvent("error", {
        message,
      }));
      throw new Error(message);
    }
    const responseText = await response.text();
    const hash = await sha256(responseText);
    log.debug(`Hash for file ${filekey} is ${hash}`);
    return hash;
  });

  wakatime.startFlushingHeartbeats();
});

export function onError(error: ErrorEvent) {
  const errorMsg = `${error.type}: ${error.message} (at ${error.filename}:${error.lineno}:${error.colno})`;
  chrome.tabs.create({
    url: chrome.runtime.getURL(`error.html?error=${encodeURIComponent(errorMsg)}`),
    active: true
  });
}
