import { apiKey, apiUrl } from "@/lib/store";
import { get } from "svelte/store";
import WakaTime from "@/lib/wakatime";
import { messenger } from "@/lib/messaging";
import { log } from "@/lib/util";

export default defineBackground(() => {
  const wakatime = new WakaTime(get(apiKey), get(apiUrl));

  wakatime.startFlushingHeartbeats();
  messenger.onMessage("emitHeartbeat", (partialHeartbeat) => {
    log.debug("Received heartbeat request", partialHeartbeat);
    wakatime.emitHeartbeat(partialHeartbeat.data);
  });
});

/* export default defineBackground(() => {});
 */
