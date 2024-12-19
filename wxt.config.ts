import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/auto-icons", "@wxt-dev/module-svelte"],
  manifest: {
    name: "WakaTime for Figma",
    description:
      "Metrics, insights, and time tracking automatically generated from your Figma activity.",
    permissions: ["storage", "activeTab", "cookies"],
    host_permissions: ["<all_urls>"],
    web_accessible_resources: [
      {
        resources: ["/figma-script.js"],
        matches: ["https://*.figma.com/*"],
      },
    ],
  },
  extensionApi: "chrome"
});
