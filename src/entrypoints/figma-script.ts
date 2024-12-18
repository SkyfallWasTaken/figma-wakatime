import pWaitFor from "p-wait-for";
import { log } from "@/lib/util";
import { setIntervalAsync } from "set-interval-async";
import { messenger } from "@/lib/messaging";
import { apiKey, apiUrl } from "@/lib/store";
/* import { getWakaService } from "@/lib/waka-service";
 */
// People often ponder their designs or use sites like Dribbble for inspiration.
// This can lead to long periods of inactivity and leave the user annoyed when
// all their time hasn't been tracked. To prevent this, we'll allow them to be inactive
// for up to 10 minutes before we stop sending heartbeats.
const MAX_INACTIVITY_MS = 60 * 10 * 1000;
const HEARTBEAT_INTERVAL_MS = 60 * 1000;
let lastHeartbeatTs: number | null = null;
let lastDocUpdateTs: number | null = null;
let lastDocHash: string | null = null;

export default defineUnlistedScript(async () => {
  log.info("Unlisted content script loaded");

  await pWaitFor(
    () => window.figma !== undefined && typeof window.figma === "object",
    { interval: 5000 }
  );
  log.debug("Figma object loaded");

  apiKey.subscribe((value) => {
    messenger.sendMessage("updateWakaApiKey", value);
  });
  apiUrl.subscribe((value) => {
    messenger.sendMessage("updateWakaApiUrl", value);
  });
  messenger.sendMessage("init", null);
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
      /* await messenger.sendMessage("emitHeartbeat", {
        project: window.figma.root.name,
        entity: getEntityName(window.figma),
        time: Math.floor(Date.now() / 1000),
        type: "file",
        language: "Figma",
        category: "coding",
      }); */
    }
  }, 12000);
  log.info(`Listening for changes to document \`${figma.root.name}\``);
});

function getEntityName(): string {
  const currentSelection = figma.currentPage.selection;
  if (currentSelection && currentSelection.length > 0) {
    return currentSelection[0].name;
  }
  return figma.root.name;
}

function shouldSendHeartbeat(): boolean {
  const now = Date.now();
  const heartbeatStale =
    lastHeartbeatTs === null || now - lastHeartbeatTs > HEARTBEAT_INTERVAL_MS;
  const active =
    document.hasFocus() && now - lastDocUpdateTs! < MAX_INACTIVITY_MS;
  const result = heartbeatStale && lastDocUpdateTs !== null && active;
  if (result) {
    lastHeartbeatTs = now;
  }
  log.debug(
    `Should send heartbeat: ${result} (heartbeatStale: ${heartbeatStale}, active: ${active}, now: ${now}, lastDocUpdateTs: ${lastDocUpdateTs}, lastHeartbeatTs: ${lastHeartbeatTs})`
  );

  return result;
}
