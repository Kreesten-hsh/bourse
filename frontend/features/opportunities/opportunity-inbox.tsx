"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Books,
  Database,
  FileText,
  Funnel,
  GlobeHemisphereEast,
  MagnifyingGlass,
  MoonStars,
  PaperPlaneTilt,
  FadersHorizontal
} from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/cn";
import type { ApplicationStatus, Opportunity } from "@/types/opportunity";
import {
  applyOpportunityQuery,
  type OpportunityFilter,
  type OpportunitySort,
  sortOpportunities,
  updateOpportunityStatus
} from "./opportunity-collection";
import { OpportunityInspector } from "./opportunity-inspector";
import { OpportunityTable } from "./opportunity-table";
import { sampleOpportunities } from "./sample-opportunities";

type NavigationItem = Readonly<{
  label: string;
  icon: React.ComponentType<{ size?: number; weight?: "regular" | "duotone"; className?: string }>;
  active?: boolean;
}>;

type FilterOption = Readonly<{
  id: OpportunityFilter;
  label: string;
  description: string;
}>;

const navigationItems: ReadonlyArray<NavigationItem> = [
  { label: "Opportunites", icon: GlobeHemisphereEast, active: true },
  { label: "Pipeline", icon: PaperPlaneTilt },
  { label: "Sources", icon: Database },
  { label: "Documents", icon: FileText },
  { label: "Alertes", icon: Bell }
];

const filterOptions: ReadonlyArray<FilterOption> = [
  { id: "funded", label: "Financees", description: "Allocation, voyage ou prise en charge" },
  { id: "tech", label: "Tech", description: "Software, cyber, data, IA" },
  { id: "africa", label: "Afrique", description: "Ouvert Afrique, Benin ou Global South" },
  { id: "urgent", label: "Urgent", description: "Deadline proche" },
  { id: "needs_review", label: "A verifier", description: "Financement ou date ambigu" }
];

const sortLabels: Record<OpportunitySort, string> = {
  score: "Score",
  deadline: "Deadline",
  funding: "Financement",
  recent: "Recent"
};

export function OpportunityInbox() {
  const [opportunities, setOpportunities] = useState<ReadonlyArray<Opportunity>>(sampleOpportunities);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>(sampleOpportunities[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<ReadonlyArray<OpportunityFilter>>(["funded", "tech"]);
  const [sortMode, setSortMode] = useState<OpportunitySort>("score");

  const visibleOpportunities = useMemo(() => {
    const queriedOpportunities = applyOpportunityQuery(opportunities, {
      searchTerm,
      activeFilters
    });

    return sortOpportunities(queriedOpportunities, sortMode);
  }, [activeFilters, opportunities, searchTerm, sortMode]);

  const selectedOpportunity =
    visibleOpportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ??
    opportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ??
    visibleOpportunities[0] ??
    opportunities[0];

  const priorityCount = opportunities.filter((opportunity) => opportunity.scoreBand === "priority").length;
  const fundedCount = opportunities.filter((opportunity) =>
    ["fully_funded", "partially_funded", "paid"].includes(opportunity.fundingStatus)
  ).length;
  const urgentCount = opportunities.filter((opportunity) => opportunity.daysRemaining !== null && opportunity.daysRemaining <= 14).length;

  function toggleFilter(filter: OpportunityFilter): void {
    setActiveFilters((currentFilters) => {
      if (currentFilters.includes(filter)) {
        return currentFilters.filter((currentFilter) => currentFilter !== filter);
      }

      return [...currentFilters, filter];
    });
  }

  function handleStatusChange(status: ApplicationStatus): void {
    setOpportunities((currentOpportunities) => updateOpportunityStatus(currentOpportunities, selectedOpportunity.id, status));
  }

  return (
    <main className="min-h-[100dvh] px-3 py-3 sm:px-5 lg:px-7">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <header className="fade-up relative overflow-hidden rounded-[28px] royal-command text-white">
          <div className="route-field pointer-events-none absolute inset-x-8 top-6 h-24 opacity-70" aria-hidden="true" />

          <div className="relative grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:p-7">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white/12 px-3 text-sm font-medium text-white/90 ring-1 ring-white/15">
                  <MoonStars size={17} weight="duotone" />
                  Royal Mobility Console
                </span>
                <span className="mono text-xs text-white/66">Derniere collecte simulee: 09 Jun 2026, 18:00</span>
              </div>

              <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
                <div>
                  <p className="mono text-xs uppercase tracking-[0.2em] text-white/58">to the world</p>
                  <h1 className="mt-2 max-w-[12ch] text-5xl font-semibold leading-[0.93] tracking-[-0.055em] sm:text-6xl">
                    Trouver la bonne porte.
                  </h1>
                  <p className="mt-5 max-w-[64ch] text-base leading-7 text-white/74">
                    Une console pour transformer les bourses, stages, formations et offres internationales en decisions
                    claires: prioriser, preparer, postuler.
                  </p>
                </div>

                <div className="grid content-end gap-3">
                  <Metric value={priorityCount.toString()} label="prioritaires" />
                  <Metric value={fundedCount.toString()} label="financees ou payees" />
                  <Metric value={urgentCount.toString()} label="deadlines proches" />
                </div>
              </div>
            </div>

            <nav aria-label="Navigation principale" className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    aria-current={item.active ? "page" : undefined}
                    className={cn(
                      "group inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition duration-200 active:scale-[0.98]",
                      item.active
                        ? "bg-white text-accent-strong shadow-[0_18px_48px_rgb(17_25_54_/_0.22)]"
                        : "bg-white/9 text-white/72 ring-1 ring-white/12 hover:bg-white/14 hover:text-white"
                    )}
                  >
                    <Icon size={18} weight={item.active ? "duotone" : "regular"} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        <section className="fade-up-delay-1 rounded-[24px] border border-white/70 royal-surface p-4 backdrop-blur">
          <div className="grid gap-4 lg:grid-cols-[minmax(18rem,1fr)_auto_auto] lg:items-center">
            <label className="relative block min-w-0">
              <span className="sr-only">Rechercher une opportunite</span>
              <MagnifyingGlass
                aria-hidden="true"
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-accent"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-[3.25rem] w-full rounded-[18px] border border-line bg-white/72 pl-12 pr-4 text-sm text-foreground outline-none transition duration-200 placeholder:text-muted focus:border-accent focus:shadow-focus"
                placeholder="Chercher: cyber africa, remote, UNDP, allowance..."
                type="search"
              />
            </label>

            <label className="flex h-[3.25rem] items-center gap-3 rounded-[18px] border border-line bg-white/72 px-4 text-sm text-muted">
              <FadersHorizontal size={18} className="text-accent" />
              <span>Trier par</span>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as OpportunitySort)}
                className="bg-transparent font-medium text-foreground outline-none"
              >
                {Object.entries(sortLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-[18px] bg-accent px-5 text-sm font-semibold text-white shadow-[0_18px_44px_rgb(52_71_170_/_0.24)] transition duration-200 hover:bg-accent-strong active:scale-[0.98]"
            >
              <Database size={18} weight="duotone" />
              Sync sources
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filterOptions.map((filter) => {
              const isActive = activeFilters.includes(filter.id);

              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => toggleFilter(filter.id)}
                  className={cn(
                    "group inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition duration-200 active:scale-[0.98]",
                    isActive
                      ? "border-accent bg-accent text-white shadow-[0_12px_34px_rgb(52_71_170_/_0.2)]"
                      : "border-line bg-white/58 text-muted hover:border-accent/40 hover:text-foreground"
                  )}
                  title={filter.description}
                >
                  <Funnel size={15} />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
          <section className="fade-up-delay-2 min-w-0 overflow-hidden rounded-[28px] border border-white/70 royal-surface backdrop-blur">
            <div className="flex flex-col gap-4 border-b border-line/80 p-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mono text-xs uppercase tracking-[0.18em] text-accent">Inbox</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em]">Offres pretes a analyser</h2>
                <p className="mt-2 max-w-[64ch] text-sm leading-6 text-muted">
                  {visibleOpportunities.length} resultat(s) visibles sur {opportunities.length}. Les offres ambigues restent
                  marquees a verifier au lieu d'etre presentees comme financees.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/58 px-3 py-2 text-sm text-muted">
                <Books size={17} weight="duotone" className="text-accent" />
                Profil: L3 SIL, cyber, software
              </div>
            </div>

            <OpportunityTable
              opportunities={visibleOpportunities}
              selectedOpportunityId={selectedOpportunity.id}
              onSelectOpportunity={(opportunity) => setSelectedOpportunityId(opportunity.id)}
            />
          </section>

          <OpportunityInspector opportunity={selectedOpportunity} onStatusChange={handleStatusChange} />
        </div>
      </div>
    </main>
  );
}

type MetricProps = Readonly<{
  value: string;
  label: string;
}>;

function Metric({ value, label }: MetricProps) {
  return (
    <div className="flex items-center justify-between rounded-[18px] bg-white/10 px-4 py-3 ring-1 ring-white/14 backdrop-blur">
      <span className="mono text-2xl font-semibold text-white">{value}</span>
      <span className="text-sm text-white/68">{label}</span>
    </div>
  );
}
