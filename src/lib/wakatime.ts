import { version } from "../../package.json";
import { apiKey, apiUrl } from "./store";
import { get } from "svelte/store";
import { stripIndents } from "common-tags";
import { log } from "@/lib/util";

function getOS(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("win")) return "Windows";
  if (userAgent.includes("mac")) return "Mac";
  if (userAgent.includes("linux")) return "Linux";
  return "none";
}

function getBrowser(): string {
  const ua = navigator.userAgent.toLowerCase();
  switch (true) {
    case ua.includes("chrome"):
      return "Chrome";
    case ua.includes("firefox"):
      return "Firefox";
    case ua.includes("safari"):
      return "Safari";
    case ua.includes("edge"):
      return "Edge";
    default:
      return "Unknown";
  }
}

const USER_AGENT = `wakatime/unset (${getOS()}-${getBrowser()}-none) figma-wakatime/${version}`;
log.info(`Sending heartbeats with User-Agent: ${USER_AGENT}`);

export interface PartialHeartbeat {
  entity: string;
  type: "file";
  category: "coding";
  time: number;
  project: string;
  language: string;
}
type ZeroedFields = {
  lines: number;
  line_additions: number;
  line_deletions: number;
  lineno: number;
  cursorpos: number;
};
type Heartbeat = PartialHeartbeat & {
  is_write: boolean;
  editor: "Figma";
  machine: string;
  operating_system: string;
  user_agent: string;
} & ZeroedFields;

async function trySendHeartbeat(partialHeartbeat: PartialHeartbeat) {
  const apiKeyValue = get(apiKey);
  if (!apiKeyValue) {
    log.error("API Key is not set. Skipping sending heartbeat.");
    return;
  }
  const apiUrlValue = get(apiUrl);
  if (!apiUrlValue) {
    log.error("API URL is not set. Skipping sending heartbeat.");
    return;
  }

  const heartbeat: Heartbeat = {
    ...partialHeartbeat,
    is_write: true,
    editor: "Figma",
    machine: `${getBrowser()} on ${getOS()}`,
    operating_system: getOS(),
    user_agent: USER_AGENT,

    lines: 0,
    line_additions: 0,
    line_deletions: 0,
    lineno: 0,
    cursorpos: 0,
  };

  const url = `${apiUrlValue}/heartbeats`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKeyValue}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(heartbeat),
  });
  if (response.status != 201) {
    throw new Error(
      stripIndents`
        Failed to send heartbeat to WakaTime API.

        Response status: ${response.status}
        API URL: ${url}
        API Key Length: ${apiKeyValue.length}
        User Agent: ${USER_AGENT}
      `.trim()
    );
  }
}

const queue: PartialHeartbeat[] = [];
export async function emitHeartbeat(partialHeartbeat: PartialHeartbeat) {
  queue.push(partialHeartbeat);
}

setInterval(async () => {
  if (queue.length === 0) return;

  try {
    const partialHeartbeat = queue[0];
    await trySendHeartbeat(partialHeartbeat);
    log.debug("Flushed heartbeat.");
    queue.shift();
  } catch (error) {
    log.warn("Failed to send heartbeat:", error);
  }
}, 10000);
