import { readFile } from "node:fs/promises";
import path from "node:path";
import { writeGeneratedData, writeJsonAtomic } from "../data/generate.ts";
import { deduplicateMessages } from "./parser.ts";
import { buildLoreQuery, syncStart } from "./query.ts";
import { buildPatchsets } from "./series.ts";
import type { LoreMessage, LoreSource } from "./types";

interface LoreSyncState {
  lastSuccessfulSync?: string;
}

interface LoreMessageCache {
  messages: LoreMessage[];
}

export interface LoreSyncOptions {
  root: string;
  source: LoreSource;
  initialSince: string;
  forceInitialSince?: boolean;
  now?: Date;
}

export interface LoreSyncReport {
  query: string;
  retrievedMessages: number;
  newMessages: number;
  cachedMessages: number;
  series: number;
  patches: number;
  staleFilesRemoved: number;
  synchronizedAt: string;
}

async function readOptionalJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw new Error(`Unable to read ${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function validateCachedMessages(value: unknown): LoreMessage[] {
  if (!Array.isArray(value)) throw new Error("Lore message cache must contain a messages array");
  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object") throw new Error(`Invalid cached lore message at index ${index}`);
    const message = raw as Partial<LoreMessage>;
    const requiredStrings: Array<keyof LoreMessage> = ["messageId", "subject", "date", "body", "loreUrl", "rawUrl"];
    if (requiredStrings.some((key) => typeof message[key] !== "string")) {
      throw new Error(`Invalid cached lore message fields at index ${index}`);
    }
    if (!message.from || typeof message.from.name !== "string" || typeof message.from.email !== "string") {
      throw new Error(`Invalid cached lore sender at index ${index}`);
    }
    if (!Array.isArray(message.references) || message.references.some((reference) => typeof reference !== "string")) {
      throw new Error(`Invalid cached lore references at index ${index}`);
    }
    if (Number.isNaN(Date.parse(message.date as string))) throw new Error(`Invalid cached lore date at index ${index}`);
    return message as LoreMessage;
  });
}

export async function synchronizeLore(options: LoreSyncOptions): Promise<LoreSyncReport> {
  const internalDirectory = path.join(options.root, "data", "internal");
  const stateFile = path.join(internalDirectory, "lore-state.json");
  const cacheFile = path.join(internalDirectory, "lore-messages.json");
  const runStateFile = path.join(internalDirectory, "sync-state.json");
  const synchronizedAt = (options.now ?? new Date()).toISOString();

  try {
    const state = await readOptionalJson<LoreSyncState>(stateFile, {});
    const cache = await readOptionalJson<LoreMessageCache>(cacheFile, { messages: [] });
    const cachedMessages = validateCachedMessages(cache.messages);
    const start = syncStart(
      state.lastSuccessfulSync,
      options.initialSince,
      options.forceInitialSince,
    );
    const query = buildLoreQuery(start);
    const retrieved = deduplicateMessages(await options.source.search(query));
    const knownIds = new Set(cachedMessages.map((message) => message.messageId));
    const mergedMessages = deduplicateMessages([...cachedMessages, ...retrieved]);
    const details = buildPatchsets({ messages: mergedMessages });
    const result = await writeGeneratedData(options.root, details, {
      mode: "live",
      generatedAt: synchronizedAt,
      sources: { lore: { status: "ok", lastSuccessfulSync: synchronizedAt } },
    });

    await writeJsonAtomic(cacheFile, { messages: mergedMessages });
    await writeJsonAtomic(stateFile, { lastSuccessfulSync: synchronizedAt });
    await writeJsonAtomic(runStateFile, {
      status: "ok",
      attemptedAt: synchronizedAt,
      lastSuccessfulSync: synchronizedAt,
    });

    return {
      query,
      retrievedMessages: retrieved.length,
      newMessages: retrieved.filter((message) => !knownIds.has(message.messageId)).length,
      cachedMessages: mergedMessages.length,
      series: result.details.length,
      patches: result.details.reduce((sum, detail) => sum + detail.patches.length, 0),
      staleFilesRemoved: result.staleFilesRemoved,
      synchronizedAt,
    };
  } catch (error) {
    await writeJsonAtomic(runStateFile, {
      status: "error",
      attemptedAt: synchronizedAt,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
