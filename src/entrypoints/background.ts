import { apiKey, apiUrl } from "@/lib/store";
import { get } from "svelte/store";
import { getWakaService, registerWakaService } from "@/lib/waka-service";
import WakaTime from "../lib/wakatime";

export default defineBackground(() => {
  registerWakaService(new WakaTime(get(apiKey), get(apiUrl)));
  const wakatime = getWakaService();
  wakatime.startFlushingHeartbeats();
});
