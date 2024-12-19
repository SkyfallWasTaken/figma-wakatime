import { PartialHeartbeat } from "@/lib/wakatime";

export default interface ProtocolMap {
  emitHeartbeat(partialHeartbeat: PartialHeartbeat): void;
  getFigmaCookie(data: unknown): Promise<string>;
}
