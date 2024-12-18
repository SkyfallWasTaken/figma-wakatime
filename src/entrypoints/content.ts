import { log } from "@/lib/util";

export default defineContentScript({
  matches: ["*://*.figma.com/design/*"],
  async main() {
    log.info("Content script loaded");
    await injectScript("/figma-script.js");
  },
});
