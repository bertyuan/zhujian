import type { ManualStatusOverride, PatchsetDetail, PatchsetStatus, PatchsetSummary } from "../data/schema";
import { readSupabaseConfig, SupabaseRest } from "../data/supabase.ts";

interface OverrideRow {
  patchset_id: string;
  status: PatchsetStatus;
  reason: string;
  actor_label: string;
  set_at: string;
}

let database: SupabaseRest | undefined;

function store(): SupabaseRest {
  database ??= new SupabaseRest(readSupabaseConfig());
  return database;
}

export async function manualStatusOverrides(): Promise<Map<string, ManualStatusOverride>> {
  return store().select<OverrideRow>("buding_patchset_status_overrides").then((rows) => new Map(rows.map((row) => [row.patchset_id, {
    status: row.status,
    reason: row.reason,
    actor: row.actor_label,
    setAt: row.set_at,
  }])))
    // Deploying application code before the migration should not make public
    // read pages unavailable. Writes remain blocked until it is applied.
    .catch(() => new Map());
}

export function withManualStatus<T extends PatchsetSummary | PatchsetDetail>(patchset: T, overrides: Map<string, ManualStatusOverride>): T {
  const manualStatus = overrides.get(patchset.id);
  return manualStatus ? { ...patchset, status: manualStatus.status, manualStatus } : patchset;
}
