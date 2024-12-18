import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  manifest: {
    name: "WakaTime for Figma",
    version: "1.0.0",
    description:
      "Metrics, insights, and time tracking automatically generated from your Figma activity.",
    permissions: ["storage", "scripting", "tabs", "activeTab"], // FIXME: reduce perms
    host_permissions: ["<all_urls>"],
    web_accessible_resources: [
      {
        resources: ["/figma-script.js"],
        matches: ["https://*.figma.com/*"],
      },
    ],
  },
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-svelte"],
});
