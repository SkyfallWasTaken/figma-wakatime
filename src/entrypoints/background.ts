import WakaTime from "@/lib/wakatime";
import { messenger } from "@/lib/messaging";
import { log } from "@/lib/util";

export default defineBackground(() => {
  const wakatime = new WakaTime("", "");
  messenger.onMessage("updateWakaApiKey", (message) => {
    log.debug("Received updateWakaApiKey event");
    wakatime.apiKey = message.data;
  });
  messenger.onMessage("updateWakaApiUrl", (message) => {
    log.debug("Received updateWakaApiUrl event");
    wakatime.apiUrl = message.data;
  });
  messenger.onMessage("init", async () => {
    log.debug("Received init event - starting flush loop");
    wakatime.startFlushingHeartbeats();
    messenger.onMessage("emitHeartbeat", (partialHeartbeat) => {
      log.debug("Received heartbeat request", partialHeartbeat);
      wakatime.emitHeartbeat(partialHeartbeat.data);
    });
  });
});

/* export default defineBackground(() => {});
 */
