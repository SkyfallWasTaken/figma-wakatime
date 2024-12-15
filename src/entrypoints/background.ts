import { startFlushingHeartbeats } from "@/lib/wakatime";
import { apiKey, apiUrl } from "@/lib/store";
import { get } from "svelte/store";

export default defineBackground(() => {
  startFlushingHeartbeats(get(apiKey), get(apiUrl));
});
