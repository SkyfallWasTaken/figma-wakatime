<script lang="ts">
  import "./app.css";
  import { bugReportUrl } from "@/lib/util";

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const errorMsg =
    urlParams.get("error") ||
    "Unknown error. When creating a new issue, please make sure to include reproduction steps so we can figure out what's going on.";
</script>

<h1 class="text-2xl font-semibold">Uh oh, something went wrong!</h1>
<div class="text-base">
  <div
    class="font-mono text-base w-full font-semibold bg-error text-error-content px-4 py-3 rounded-sm shadow"
  >
    {errorMsg}
  </div>

  <p class="mt-4 flex flex-col gap-2">
    If you're still having issues, please open an issue on GitHub.

    <a
      class="link"
      href={bugReportUrl(errorMsg)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <button class="btn btn-primary btn-sm">Report an issue</button>
    </a>
  </p>
</div>
