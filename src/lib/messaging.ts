import { PartialHeartbeat } from "@/lib/wakatime";
import { defineCustomEventMessaging } from "@webext-core/messaging/page";

interface ProtocolMap {
  emitHeartbeat(partialHeartbeat: PartialHeartbeat): void;
}

export const messenger = defineCustomEventMessaging<ProtocolMap>({
  namespace: "skyfall-figma-wakatime",
});
