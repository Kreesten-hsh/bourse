import type { Opportunity, OpportunityStatus } from "@/types/opportunity";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const DEFAULT_REQUEST_TIMEOUT_MS = 4_000;

export type OpportunityListFilters = Readonly<{
  status?: OpportunityStatus;
  minimumScore?: number;
}>;

export type SyncResult = Readonly<{
  status: "queued" | "completed";
  collected_count: number;
  synced_at: string;
}>;

export type SourceType = "api" | "rss" | "scraper" | "manual";
export type SourceFrequency = "daily" | "weekly" | "monthly" | "manual";
export type SourceStatus = "enabled" | "disabled" | "error";

export type SourceRead = Readonly<{
  id: string;
  name: string;
  url: string;
  type: SourceType;
  frequency: SourceFrequency;
  adapter_key: string;
  is_active: boolean;
  status: SourceStatus;
  last_sync_at: string | null;
  last_result_count: number;
  last_error: string | null;
}>;

export type SourceCreatePayload = Readonly<{
  name: string;
  url: string;
  type: SourceType;
  frequency: SourceFrequency;
  adapter_key: string;
  is_active: boolean;
}>;

export type CollectionRunRead = Readonly<{
  id: string;
  source_id: string;
  source_name: string;
  started_at: string;
  finished_at: string;
  status: "completed" | "failed";
  pages_seen: number;
  items_found: number;
  items_created: number;
  items_updated: number;
  duplicates_skipped: number;
  error: string | null;
}>;

export type ApiClient = Readonly<{
  opportunities: {
    list: (filters?: OpportunityListFilters) => Promise<ReadonlyArray<Opportunity>>;
    get: (id: string) => Promise<Opportunity>;
    updateStatus: (id: string, status: OpportunityStatus) => Promise<Opportunity>;
  };
  sync: {
    trigger: () => Promise<SyncResult>;
    status: () => Promise<SyncResult>;
  };
  sources: {
    list: () => Promise<ReadonlyArray<SourceRead>>;
    create: (payload: SourceCreatePayload) => Promise<SourceRead>;
    collect: (id: string) => Promise<CollectionRunRead>;
    runs: () => Promise<ReadonlyArray<CollectionRunRead>>;
  };
}>;

export function createApiClient(fetcher: typeof fetch = fetch): ApiClient {
  return {
    opportunities: {
      list: (filters = {}) => requestJson<ReadonlyArray<Opportunity>>(buildUrl("/api/v1/opportunities", filters), fetcher),
      get: (id) => requestJson<Opportunity>(buildUrl(`/api/v1/opportunities/${encodeURIComponent(id)}`), fetcher),
      updateStatus: (id, status) =>
        requestJson<Opportunity>(buildUrl(`/api/v1/opportunities/${encodeURIComponent(id)}/status`), fetcher, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status })
        })
    },
    sync: {
      trigger: () =>
        requestJson<SyncResult>(buildUrl("/api/v1/sources/sync"), fetcher, {
          method: "POST"
        }),
      status: () => requestJson<SyncResult>(buildUrl("/api/v1/sources/sync/status"), fetcher)
    },
    sources: {
      list: () => requestJson<ReadonlyArray<SourceRead>>(buildUrl("/api/v1/sources"), fetcher),
      create: (payload) =>
        requestJson<SourceRead>(buildUrl("/api/v1/sources"), fetcher, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }),
      collect: (id) =>
        requestJson<CollectionRunRead>(buildUrl(`/api/v1/sources/${encodeURIComponent(id)}/collect`), fetcher, {
          method: "POST"
        }),
      runs: () => requestJson<ReadonlyArray<CollectionRunRead>>(buildUrl("/api/v1/sources/runs"), fetcher)
    }
  };
}

async function requestJson<T>(url: string, fetcher: typeof fetch, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), DEFAULT_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetcher(url, { ...init, signal: init?.signal ?? controller.signal });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

function buildUrl(path: string, filters?: OpportunityListFilters): string {
  const url = new URL(path, BASE_URL);

  if (filters?.status !== undefined) {
    url.searchParams.set("status", filters.status);
  }

  if (filters?.minimumScore !== undefined) {
    url.searchParams.set("minimum_score", filters.minimumScore.toString());
  }

  return url.toString();
}

export const api = createApiClient();
