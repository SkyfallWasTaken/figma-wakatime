import WakaTime, { PartialHeartbeat } from "@/lib/wakatime";
import { defineProxyService } from "@webext-core/proxy-service";

class WakaService {
  constructor(private wakatime: WakaTime) {}

  async emitHeartbeat(partialHeartbeat: PartialHeartbeat) {
    await this.wakatime.emitHeartbeat(partialHeartbeat);
  }

  async startFlushingHeartbeats() {
    await this.wakatime.startFlushingHeartbeats();
  }
}

export const [registerWakaService, getWakaService] = defineProxyService(
  "WakaService",
  (wakatime: WakaTime) => new WakaService(wakatime)
);
