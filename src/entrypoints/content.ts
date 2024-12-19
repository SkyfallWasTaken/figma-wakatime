import { m2iMessenger } from "@/lib/messaging/m2i-messaging";
import { i2bMessenger } from "@/lib/messaging/i2b-messaging";
import { log } from "@/lib/util";

export default defineContentScript({
  matches: ["*://*.figma.com/design/*"],
  async main() {
    log.info("Content script loaded");
    m2iMessenger.onMessage("emitHeartbeat", (message) => {
      log.debug("I have a heartbeat! Yay!");
      i2bMessenger.sendMessage("emitHeartbeat", message.data);
    });
    m2iMessenger.onMessage("getFigmaCookie", async () => {
      return await i2bMessenger.sendMessage("getFigmaCookie", void 0);
    });
    await injectScript("/figma-script.js");
  },
});
