import { PartialHeartbeat } from "@/lib/wakatime";
import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  updateWakaApiKey(apiKey: string): void;
  updateWakaApiUrl(apiUrl: string): void;
  emitHeartbeat(partialHeartbeat: PartialHeartbeat): void;
  init(data: null): void;
}

export const messenger = defineExtensionMessaging<ProtocolMap>();
