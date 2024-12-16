import pWaitFor from "p-wait-for";
import { log } from "@/lib/util";
import { setIntervalAsync } from "set-interval-async";
import { messenger } from "@/lib/messaging";
/* import { getWakaService } from "@/lib/waka-service";
 */
// People often ponder their designs or use sites like Dribbble for inspiration.
// This can lead to long periods of inactivity and leave the user annoyed when
// all their time hasn't been tracked. To prevent this, we'll allow them to be inactive
// for up to 10 minutes before we stop sending heartbeats.
const MAX_INACTIVITY_SECS = 60 * 10;
const HEARTBEAT_INTERVAL_SECS = 60;
let lastHeartbeatTs: number | null = null;
let lastDocUpdateTs: number | null = null;
let lastDocHash: string | null = null;

export default defineContentScript({
  matches: ["*://*.figma.com/design/*"],
  world: "MAIN",
  async main() {
    log.info("Content script loaded");
    await pWaitFor(() => window.figma !== undefined, { interval: 5000 });
    log.debug("Figma object loaded");

    const figma = window.figma as PluginAPI;
    /*     const wakatime = getWakaService();
     */ await figma.loadAllPagesAsync();
    setIntervalAsync(async () => {
      const root = await figma.getNodeByIdAsync(figma.root.id);
      if (!root) {
        log.error("Could not find root node. This should never happen.");
        return;
      }

      const currentDocHash = Math.random().toString();
      if (currentDocHash != lastDocHash) {
        log.debug("Document has changed");
        lastDocHash = currentDocHash;
        lastDocUpdateTs = Date.now();
      }

      if (shouldSendHeartbeat()) {
        log.debug("Sending heartbeat...");
        await messenger.sendMessage("emitHeartbeat", {
          project: figma.root.name,
          entity: getEntityName(figma),
          time: Math.floor(Date.now() / 1000),
          type: "file",
          language: "Figma",
          category: "coding",
        });
      }
    }, 12000);

    log.info(`Listening for changes to document \`${figma.root.name}\``);
  },
});

function getEntityName(figma: PluginAPI): string {
  const currentSelection = figma.currentPage.selection;
  if (currentSelection && currentSelection.length > 0) {
    return currentSelection[0].name;
  }
  return figma.root.name;
}

function shouldSendHeartbeat(): boolean {
  const heartbeatStale =
    lastHeartbeatTs === null ||
    Date.now() - lastHeartbeatTs > HEARTBEAT_INTERVAL_SECS * 1000;
  const active = Date.now() - lastDocUpdateTs! < MAX_INACTIVITY_SECS * 1000;
  const result =
    document.hasFocus() && heartbeatStale && lastDocUpdateTs !== null && active;
  if (result) {
    lastHeartbeatTs = Date.now();
  }
  log.debug(
    `Should send heartbeat: ${result} (heartbeatStale: ${heartbeatStale}, active: ${active})`
  );

  return result;
}
