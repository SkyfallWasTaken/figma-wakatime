export default defineContentScript({
  matches: ["*://*.figma.com/design/*"],
  async main() {
    console.log("Loading WakaTime for Figma...");
  },
});
