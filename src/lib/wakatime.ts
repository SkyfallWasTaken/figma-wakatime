import { version } from "../../package.json";
import { stripIndents } from "common-tags";
import { base64Encode, log } from "@/lib/util";

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
  category: "designing";
  time: number;
  project: string;
  language: string;
}

export default class WakaTime {
  private queue: PartialHeartbeat[] = [];
  private baseInterval = 10000; // 10 seconds
  private maxInterval = 300000; // 5 minutes
  private currentInterval = 10000;
  private retryCount = 0;
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

        lines: 1,
        line_additions: 0,
        line_deletions: 0,
        lineno: 1,
        cursorpos: 1,
      };
    });

    const url = `${this.apiUrl}/users/current/heartbeats.bulk`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${await base64Encode(this.apiKey)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(heartbeats),
    });
    if (response.status != 201 && response.status != 202) {
      throw new Error(
        stripIndents`
          Failed to send heartbeat to WakaTime API.
  
          Response status: ${response.status}
          API URL: ${url}
          API Key Length: ${this.apiKey.length}
          User Agent: ${USER_AGENT}

          ${await response.text()}
        `.trim()
      );
    }
  }

  emitHeartbeat(partialHeartbeat: PartialHeartbeat) {
    log.debug(`Queuing heartbeat for \`${partialHeartbeat.entity}\``);
    this.queue.push(partialHeartbeat);
  }

  startFlushingHeartbeats() {
    const scheduleNextFlush = (delay: number) => {
      setTimeout(async () => {
        if (this.queue.length === 0) {
          // Reset backoff on success with empty queue
          this.currentInterval = this.baseInterval;
          this.retryCount = 0;
          scheduleNextFlush(this.currentInterval);
          return;
        }

        log.debug(`${this.queue.length} heartbeats in queue.`);

        try {
          await this.trySendHeartbeats(this.queue);
          log.debug("Flushed heartbeats.");
          this.queue = [];
          // Reset backoff on success
          this.currentInterval = this.baseInterval;
          this.retryCount = 0;
        } catch (error) {
          log.warn("Failed to send heartbeats:", error);
          // Implement exponential backoff
          this.retryCount++;
          this.currentInterval = Math.min(
            this.baseInterval * Math.pow(2, this.retryCount),
            this.maxInterval
          );
          log.debug(`Retrying in ${this.currentInterval / 1000} seconds`);
        }

        scheduleNextFlush(this.currentInterval);
      }, delay);
    };

    scheduleNextFlush(this.baseInterval);
  }
}
