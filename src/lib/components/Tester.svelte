<script lang="ts">
  import { onMount } from "svelte";
  import { apiKey, apiUrl } from "@/lib/store";
  import WakaTime from "@/lib/wakatime";
  import { log } from "@/lib/util";
  import { fade } from "svelte/transition";

  let checksPassed: boolean | null = $state(null);
  let testing = $state(false);

  async function testConnection(apiKey: string, apiUrl: string) {
    if (!apiKey || !apiUrl) {
      checksPassed = false;
      return;
    }

    testing = true;
    const wakatime = new WakaTime(apiKey, apiUrl);

    try {
      const testHeartbeat = {
        entity: "welcome.txt",
        type: "file" as const,
        time: Date.now() / 1000,
        project: "welcome",
        language: "text",
        category: "coding" as const,
      };

      await wakatime.trySendHeartbeats([testHeartbeat]);
      checksPassed = true;
      log.info("WakaTime API test succeeded");
    } catch (error) {
      checksPassed = false;
      log.error("WakaTime API test failed:", error);
    } finally {
      testing = false;
    }
  }

  onMount(() => {
    $effect(() => {
      log.debug(`Effect running with apiKey: ${!!$apiKey}, apiUrl: ${$apiUrl}`);
      if ($apiKey && $apiUrl && $apiUrl.trim() !== "") {
        testConnection($apiKey, $apiUrl);
      } else {
        checksPassed = null;
      }
    });
  });
</script>

<div
  class="card transition-colors duration-300 ease-in-out {checksPassed === true
    ? 'bg-primary text-primary-content'
    : checksPassed === false
      ? 'bg-error text-error-content'
      : 'bg-base-200'} w-full shadow-xl"
  transition:fade={{ duration: 100 }}
>
  <div class="p-5">
    {#if testing}
      <div class="card-title">Testing connection...</div>
      <p class="mt-2 text-base">Sending test heartbeat to WakaTime...</p>
    {:else if checksPassed === true}
      <div class="card-title">All checks passed!</div>
      <p class="mt-2 text-base">
        WakaTime is properly configured and ready to track your Figma time. Your
        activity will be automatically synced to your WakaTime dashboard.
      </p>
    {:else if checksPassed === false}
      <div class="card-title">Some checks failed</div>
      <p class="mt-2 text-base">
        Unable to connect to WakaTime. Please check your API key and try again.
        Make sure you've copied your API key correctly from your WakaTime
        settings.
      </p>
    {:else}
      <div class="card-title">Initializing...</div>
      <p class="mt-2 text-base">Waiting for WakaTime configuration...</p>
    {/if}
  </div>
</div>
