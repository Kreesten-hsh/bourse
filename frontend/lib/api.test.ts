import type { OpportunityStatus } from "@/types/opportunity";
import { createApiClient } from "./api";

const requestedUrls: string[] = [];
const okResponse = new Response("[]", {
  status: 200,
  headers: { "Content-Type": "application/json" }
});

const fetcher: typeof fetch = async (input) => {
  requestedUrls.push(input.toString());

  return okResponse;
};

const client = createApiClient(fetcher);
const status: OpportunityStatus = "priority";

void client.opportunities.list({ status, minimumScore: 80 });
void client.opportunities.updateStatus("abc", "applying");

if (requestedUrls.some((url) => url.includes("minimum_score=80")) && status !== "priority") {
  throw new Error("API client must keep typed opportunity filters.");
}
