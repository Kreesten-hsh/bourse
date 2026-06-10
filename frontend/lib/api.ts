import type { Opportunity, OpportunityStatus } from "@/types/opportunity";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type OpportunityListFilters = Readonly<{
  status?: OpportunityStatus;
  minimumScore?: number;
}>;

export type SyncResult = Readonly<{
  status: "queued" | "completed";
  collected_count: number;
  synced_at: string;
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
    }
  };
}

async function requestJson<T>(url: string, fetcher: typeof fetch, init?: RequestInit): Promise<T> {
  const response = await fetcher(url, init);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
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
