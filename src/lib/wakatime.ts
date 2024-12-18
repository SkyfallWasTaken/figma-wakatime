import { version } from "../../package.json";
import { stripIndents } from "common-tags";
import { log } from "@/lib/util";
import { setIntervalAsync } from "set-interval-async";

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

export default class WakaTime {
  private queue: PartialHeartbeat[] = [];
  apiKey: string;
  apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async trySendHeartbeats(partialHeartbeats: PartialHeartbeat[]) {
    const heartbeats = partialHeartbeats.map((partialHeartbeat) => {
      return {
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
    });

    const url = `${this.apiUrl}/users/current/heartbeats.bulk`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(heartbeats),
    });
    if (response.status != 201) {
      throw new Error(
        stripIndents`
          Failed to send heartbeat to WakaTime API.
  
          Response status: ${response.status}
          API URL: ${url}
          API Key Length: ${this.apiKey.length}
          User Agent: ${USER_AGENT}
        `.trim()
      );
    }
  }

  emitHeartbeat(partialHeartbeat: PartialHeartbeat) {
    log.debug(`Queuing heartbeat for \`${partialHeartbeat.entity}\``);
    this.queue.push(partialHeartbeat);
  }
  startFlushingHeartbeats() {
    setIntervalAsync(async () => {
      if (this.queue.length === 0) return;
      log.debug(`${this.queue.length} heartbeats in queue.`);

      try {
        await this.trySendHeartbeats(this.queue);
        log.debug("Flushed heartbeats.");
        this.queue = [];
      } catch (error) {
        log.warn("Failed to send heartbeats:", error);
      }
    }, 10000);
  }
}
