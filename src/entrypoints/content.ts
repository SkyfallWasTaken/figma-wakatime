import pWaitFor from "p-wait-for";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default defineContentScript({
  matches: ["*://*.figma.com/design/*"],
  async main() {
    console.log("Loading WakaTime for Figma...");
    await sleep(15000);
    alert(figma.root.name);
  },
});
