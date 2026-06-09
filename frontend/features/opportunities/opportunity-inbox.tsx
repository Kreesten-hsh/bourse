"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Compass,
  Database,
  FileText,
  Funnel,
  Globe,
  MagnifyingGlass,
  PaperPlaneTilt
} from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/cn";
import type { Opportunity } from "@/types/opportunity";
import { OpportunityInspector } from "./opportunity-inspector";
import { OpportunityTable } from "./opportunity-table";
import { sampleOpportunities } from "./sample-opportunities";
import { selectDefaultOpportunity } from "./opportunity-view-model";

type NavigationItem = Readonly<{
  label: string;
  icon: React.ComponentType<{ size?: number; weight?: "regular" | "duotone"; className?: string }>;
  active?: boolean;
}>;

const navigationItems: ReadonlyArray<NavigationItem> = [
  { label: "Opportunites", icon: Compass, active: true },
  { label: "Pipeline", icon: PaperPlaneTilt },
  { label: "Sources", icon: Database },
  { label: "Documents", icon: FileText },
  { label: "Alertes", icon: Bell }
];

const filters: ReadonlyArray<string> = ["Financees", "Informatique", "Afrique", "Deadline"];

export function OpportunityInbox() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity>(() => selectDefaultOpportunity(sampleOpportunities));

  const sortedOpportunities = useMemo(
    () => [...sampleOpportunities].sort((first, second) => second.fitScore - first.fitScore),
    []
  );

  return (
    <main className="shell-grid min-h-[100dvh]">
      <aside className="hidden border-r border-line/80 bg-[color:var(--color-surface)]/72 px-3 py-5 backdrop-blur md:block">
        <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-ui border border-line bg-[color:var(--color-surface)] shadow-sm">
          <Globe size={22} weight="duotone" className="text-accent-strong" />
        </div>

        <nav aria-label="Navigation principale" className="flex flex-col gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "group flex h-12 w-12 items-center justify-center rounded-ui transition duration-200",
                  item.active
                    ? "bg-accent text-white shadow-[0_10px_28px_color-mix(in_oklch,var(--color-accent)_22%,transparent)]"
                    : "text-muted hover:bg-[color:var(--color-surface-raised)] hover:text-foreground active:scale-[0.98]"
                )}
                title={item.label}
              >
                <Icon size={21} weight={item.active ? "duotone" : "regular"} />
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="min-w-0 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5">
          <header className="fade-up flex flex-col gap-4 rounded-ui border border-line/80 bg-[color:var(--color-surface)]/74 p-3 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mono text-xs uppercase tracking-[0.18em] text-muted">to the world</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-foreground">Cockpit de mobilite internationale</h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block min-w-0 sm:w-[22rem]">
                <span className="sr-only">Rechercher une opportunite</span>
                <MagnifyingGlass
                  aria-hidden="true"
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  className="h-11 w-full rounded-ui border border-line bg-[color:var(--color-background)] pl-10 pr-3 text-sm outline-none transition focus:border-accent focus:shadow-focus"
                  placeholder="Rechercher par domaine, pays, organisation"
                  type="search"
                />
              </label>

              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-ui bg-accent px-4 text-sm font-medium text-white transition duration-200 hover:bg-accent-strong active:scale-[0.98]"
              >
                <Database size={18} weight="duotone" />
                Sync sources
              </button>
            </div>
          </header>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
            <section className="fade-up-delay-1 min-w-0 rounded-ui border border-line/80 bg-[color:var(--color-surface)]/78 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 border-b border-line p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="mono text-xs uppercase tracking-[0.18em] text-muted">Inbox</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">Offres a analyser</h2>
                  <p className="mt-2 text-sm text-muted">
                    {sortedOpportunities.length} opportunites suivies, triees par score de pertinence.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      className="inline-flex h-9 items-center gap-2 rounded-ui border border-line bg-[color:var(--color-background)] px-3 text-sm text-muted transition hover:text-foreground active:scale-[0.98]"
                    >
                      <Funnel size={15} />
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <OpportunityTable
                opportunities={sortedOpportunities}
                selectedOpportunityId={selectedOpportunity.id}
                onSelectOpportunity={setSelectedOpportunity}
              />
            </section>

            <OpportunityInspector opportunity={selectedOpportunity} />
          </div>
        </div>
      </section>
    </main>
  );
}
