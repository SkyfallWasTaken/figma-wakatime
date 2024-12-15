import pWaitFor from "p-wait-for";

export default defineContentScript({
  matches: ["*://*.figma.com/design/*"],
  world: "MAIN",
  async main() {
    console.log("Loading WakaTime for Figma...");
    await pWaitFor(() => window.figma !== undefined, { timeout: 5000 });
    console.log("I am logging.");
    console.log("WOAH:" + figma.root.name);
  },
});
