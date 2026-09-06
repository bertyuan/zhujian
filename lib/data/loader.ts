import patchsetsData from "@/data/patchsets.json";
import metadataData from "@/data/metadata.json";
import syncStateData from "@/data/internal/sync-state.json";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { LoreMessage } from "../lore/types";
import { validateLoreMessages } from "../lore/sync";
import { messageRouteId } from "../messages/routing";
import type { PatchDetail, PatchsetDetail, PatchsetSummary, SyncMetadata, SyncRunState } from "./schema";
import { validatePatchsetDetail, validatePatchsetSummaries, validateSyncMetadata, validateSyncRunState } from "./validation";

export interface PatchMessagePageData {
  message: LoreMessage;
  patch: PatchDetail;
  patchset: PatchsetDetail;
  previous?: PatchDetail;
  next?: PatchDetail;
}

let patchsetDetailsPromise: Promise<PatchsetDetail[]> | undefined;
let loreMessagesPromise: Promise<LoreMessage[]> | undefined;
let patchMessageIndexPromise: Promise<Map<string, PatchMessagePageData>> | undefined;

export function getPatchsets(): PatchsetSummary[] {
  return validatePatchsetSummaries(patchsetsData);
}

export function getMetadata(): SyncMetadata {
  return validateSyncMetadata(metadataData);
}

export function getSyncRunState(): SyncRunState {
  return validateSyncRunState(syncStateData);
}

export async function getPatchset(id: string): Promise<PatchsetDetail | null> {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  try {
    const file = await readFile(path.join(process.cwd(), "data", "patchsets", `${id}.json`), "utf8");
    return validatePatchsetDetail(JSON.parse(file), `data/patchsets/${id}.json`);
  } catch {
    return null;
  }
}

export async function getPatchsetDetails(): Promise<PatchsetDetail[]> {
  patchsetDetailsPromise ??= Promise.all(getPatchsets().map(async (summary) => {
    const detail = await getPatchset(summary.id);
    if (!detail) throw new Error(`Missing generated detail for ${summary.id}`);
    return detail;
  }));
  return patchsetDetailsPromise;
}

async function getLoreMessages(): Promise<LoreMessage[]> {
  loreMessagesPromise ??= readFile(path.join(process.cwd(), "data", "internal", "lore-messages.json"), "utf8")
    .then((content) => {
      const cache = JSON.parse(content) as { messages?: unknown };
      return validateLoreMessages(cache.messages);
    });
  return loreMessagesPromise;
}

async function getPatchMessageIndex(): Promise<Map<string, PatchMessagePageData>> {
  patchMessageIndexPromise ??= Promise.all([getPatchsetDetails(), getLoreMessages()]).then(([patchsets, messages]) => {
    const loreById = new Map(messages.map((message) => [message.messageId, message]));
    const index = new Map<string, PatchMessagePageData>();

    for (const patchset of patchsets) {
      patchset.patches.forEach((patch, patchIndex) => {
        const message = loreById.get(patch.messageId);
        if (!message) throw new Error(`Missing cached lore message ${patch.messageId}`);
        const routeId = messageRouteId(patch.messageId);
        if (index.has(routeId)) throw new Error(`Duplicate message route ${routeId}`);
        index.set(routeId, {
          message,
          patch,
          patchset,
          ...(patchset.patches[patchIndex - 1] ? { previous: patchset.patches[patchIndex - 1] } : {}),
          ...(patchset.patches[patchIndex + 1] ? { next: patchset.patches[patchIndex + 1] } : {}),
        });
      });
    }

    return index;
  });
  return patchMessageIndexPromise;
}

export async function getPatchMessageRouteIds(): Promise<string[]> {
  return [...(await getPatchMessageIndex()).keys()];
}

export async function getPatchMessage(routeId: string): Promise<PatchMessagePageData | null> {
  return (await getPatchMessageIndex()).get(routeId) ?? null;
}
