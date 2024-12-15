<script lang="ts">
  import Check from "lucide-svelte/icons/check";
  import Cross from "lucide-svelte/icons/x";
  const checks = [
    { label: "Sent heartbeats to WakaTime", success: true },
    { label: "Signed in to Figma", success: false },
  ];
  const allChecksPassed = checks.every(({ success }) => success);
</script>

<div
  class="card {allChecksPassed
    ? 'bg-primary text-primary-content'
    : 'bg-error text-error-content'} w-full shadow-xl"
>
  <div class="p-5">
    {#if allChecksPassed}
      <div class="card-title">All checks passed!</div>
    {:else}
      <div class="card-title">Some checks failed</div>
    {/if}
    <ul class="*:text-base">
      {#each checks as { label, success }}
        <li class="flex items-center">
          {#if success}
            <Check class="w-5 h-5 mr-1" />
          {:else}
            <Cross class="w-5 h-5 mr-1" />
          {/if}
          {label}
        </li>
      {/each}
    </ul>
  </div>
</div>
