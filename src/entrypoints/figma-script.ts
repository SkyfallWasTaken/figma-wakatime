import pWaitFor from "p-wait-for";
import { getFileLastActivityAt, log } from "@/lib/util";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";
import { m2iMessenger } from "@/lib/messaging/m2i-messaging";

// People often ponder their designs or use sites like Dribbble for inspiration.
// This can lead to long periods of inactivity and leave the user annoyed when
// all their time hasn't been tracked. To prevent this, we'll allow them to be inactive
// for up to 10 minutes before we stop sending heartbeats.
const MAX_INACTIVITY_MS = 60 * 10 * 1000;
const HEARTBEAT_INTERVAL_MS = 60 * 1000;
let lastHeartbeatTs: number | null = null;
let lastDocUpdateTs: number | null = null;

export default defineUnlistedScript(async () => {
  log.info("Unlisted content script loaded");

  try {
    await pWaitFor(
      () => window.figma !== undefined && typeof window.figma === "object",
      { interval: 5000, timeout: 12000 }
    );
  } catch (e) {
    alert(
      "Uh oh, the Figma object hasn't been loaded. Please make sure to stay focused on the page while we refresh!"
    );
    location.reload();
  }
  log.debug("Figma object loaded");
  const figmaCookie = await m2iMessenger.sendMessage("getFigmaCookie", void 0);
  log.debug("Got Figma cookie");

  const interval = setIntervalAsync(async () => {
    if (!figma) return; // Might be removed on page navigation
    const root = await figma.getNodeByIdAsync(figma.root.id);
    if (!root) {
      log.error("Could not find root node. This should never happen.");
      return;
    }

    lastDocUpdateTs = await getFileLastActivityAt(figma.fileKey!, figmaCookie)

    if (shouldSendHeartbeat()) {
      log.debug("Sending heartbeat...");
      log.debug(figma.root);
      await m2iMessenger.sendMessage("emitHeartbeat", {
        project: figma.root.name,
        entity: getEntityName(),
        time: Math.floor(Date.now() / 1000),
        type: "file",
        language: "Figma",
        category: "coding",
      });
    }
  }, 12000);
  log.info(`Listening for changes to document \`${figma.root.name}\``);

  m2iMessenger.onMessage("uninject", async () => {
    log.info("Uninjecting content script");
    await clearIntervalAsync(interval);
    return;
  });

  await figma.notify("WakaTime for Figma is running!");
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
