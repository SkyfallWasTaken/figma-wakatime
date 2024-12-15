<script lang="ts">
  import { count } from "@/lib/store";
</script>

<button on:click={() => ($count += 1)}>
  count is {$count}
</button>
