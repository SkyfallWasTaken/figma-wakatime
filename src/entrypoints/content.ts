import WakaTime from "@/lib/wakatime";
import { messenger } from "@/lib/messaging";
import { log } from "@/lib/util";
import { apiKey, apiUrl } from "@/lib/store";
import { get } from "svelte/store";

export default defineContentScript({
  matches: ["*://*.figma.com/design/*"],
  async main() {
    log.info("Content script loaded");
    const wakatime = new WakaTime(get(apiKey), get(apiUrl));
    apiKey.subscribe((value) => {
      wakatime.apiKey = value;
    });
    apiUrl.subscribe((value) => {
      wakatime.apiUrl = value;
    });
    messenger.onMessage("emitHeartbeat", (message) => {
      wakatime.emitHeartbeat(message.data);
    });

    wakatime.startFlushingHeartbeats();

    await injectScript("/figma-script.js");
  },
});
