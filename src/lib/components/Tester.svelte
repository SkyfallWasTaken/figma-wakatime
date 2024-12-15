<script lang="ts">
  import Check from "lucide-svelte/icons/check";
  import ErrorCircle from "lucide-svelte/icons/circle-x";
  const checks = [
    { label: "Sent heartbeats to WakaTime", success: true },
    { label: "Signed in to Figma", success: true },
  ];
</script>

<div class="card bg-primary text-primary-content w-full shadow-xl">
  <div class="p-5">
    <h2 class="card-title">Everything looks good!</h2>
    <ul class="*:text-base">
      {#each checks as { label, success }}
        <li class="flex items-center">
          {#if success}
            <Check class="w-5 h-5 mr-1" />
          {:else}
            <ErrorCircle class="w-5 h-5 mr-1" />
          {/if}
          {label}
        </li>
      {/each}
    </ul>
  </div>
</div>
