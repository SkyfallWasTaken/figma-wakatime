import WakaTime from "@/lib/wakatime";
import { i2bMessenger } from "@/lib/messaging/i2b-messaging";
import { log } from "@/lib/util";
import { apiKey, apiUrl } from "@/lib/store";
import { get } from "svelte/store";

export default defineBackground(() => {
  log.info("Background script loaded");
  const wakatime = new WakaTime(get(apiKey)!, get(apiUrl)!);
  apiKey.subscribe((value) => {
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
    log.debug("I have a heartbeat!");
    wakatime.emitHeartbeat(message.data);
  });
  i2bMessenger.onMessage("getFigmaCookie", async () => {
    return (await browser.cookies.get({
      name: "__Host-figma.authn",
      url: "https://www.figma.com",
    }))?.value!
  });

  wakatime.startFlushingHeartbeats();
});

/* export default defineBackground(() => {});
 */
