import { PartialHeartbeat } from "@/lib/wakatime";
import { defineCustomEventMessaging } from "@webext-core/messaging/page";

interface ProtocolMap {
  updateWakaApiKey(apiKey: string): void;
  updateWakaApiUrl(apiUrl: string): void;
  emitHeartbeat(partialHeartbeat: PartialHeartbeat): void;
  init(data: null): void;
}

export const messenger = defineCustomEventMessaging<ProtocolMap>({
  namespace: "skyfall-figma-wakatime",
});
