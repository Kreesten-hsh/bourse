"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowsClockwise, CloudWarning, Compass, Funnel, MagnifyingGlass } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";

import { api } from "@/lib/api";
import { buttonTap } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { Opportunity, OpportunityStatus } from "@/types/opportunity";
import {
  applyOpportunityQuery,
  type OpportunityFilter,
  type OpportunitySort,
  sortOpportunities,
  updateOpportunityStatus
} from "./opportunity-collection";
import { getDaysUntilDeadline } from "./opportunity-view-model";
import { OpportunityInspector } from "./opportunity-inspector";
import { OpportunityTable } from "./opportunity-table";
import { sampleOpportunities } from "./sample-opportunities";

type FilterOption = Readonly<{
  id: OpportunityFilter;
  label: string;
}>;

type HeroMetric = Readonly<{
  label: string;
  value: string;
  detail: string;
  tone: "royal" | "warning" | "quiet";
}>;

const filterOptions: ReadonlyArray<FilterOption> = [
  { id: "funded", label: "Financées" },
  { id: "tech", label: "Tech / Cyber" },
  { id: "africa_global", label: "Afrique & Global" },
  { id: "urgent", label: "Urgent (< 14j)" },
  { id: "needs_review", label: "À vérifier" },
  { id: "archived", label: "Archivées" }
];

const sortLabels: Record<OpportunitySort, string> = {
  score: "Score",
  deadline: "Deadline",
  funding: "Financement",
  recent: "Récent"
};

export function OpportunityInbox() {
  const queryClient = useQueryClient();
  const [opportunities, setOpportunities] = useState<ReadonlyArray<Opportunity>>([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<ReadonlyArray<OpportunityFilter>>([]);
  const [sortMode, setSortMode] = useState<OpportunitySort>("score");
  const [lastSyncLabel, setLastSyncLabel] = useState("09 juin 2026, 06:00");

  const opportunitiesQuery = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => api.opportunities.list()
  });

  const syncMutation = useMutation({
    mutationFn: () => api.sync.trigger(),
    onSuccess: (result) => {
      setLastSyncLabel(new Date(result.synced_at).toLocaleString("fr-FR"));
      void queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    }
  });

  useEffect(() => {
    if (opportunitiesQuery.isSuccess) {
      setOpportunities(opportunitiesQuery.data.length > 0 ? opportunitiesQuery.data : sampleOpportunities);
    }

    if (opportunitiesQuery.isError) {
      setOpportunities(sampleOpportunities);
    }
  }, [opportunitiesQuery.data, opportunitiesQuery.isError, opportunitiesQuery.isSuccess]);

  const visibleOpportunities = useMemo(() => {
    const queried = applyOpportunityQuery(opportunities, {
      searchTerm,
      activeFilters
    });

    return sortOpportunities(queried, sortMode);
  }, [activeFilters, opportunities, searchTerm, sortMode]);

  const heroMetrics = useMemo(() => buildHeroMetrics(opportunities), [opportunities]);

  useEffect(() => {
    if (selectedOpportunityId === null) {
      return;
    }

    const selectedIsVisible = visibleOpportunities.some((opportunity) => opportunity.id === selectedOpportunityId);

    if (!selectedIsVisible) {
      setSelectedOpportunityId(null);
    }
  }, [selectedOpportunityId, visibleOpportunities]);

  const selectedOpportunity =
    selectedOpportunityId === null
      ? null
      : visibleOpportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ?? null;

  function toggleFilter(filter: OpportunityFilter): void {
    setActiveFilters((currentFilters) => {
      if (currentFilters.includes(filter)) {
        return currentFilters.filter((currentFilter) => currentFilter !== filter);
      }

      return [...currentFilters, filter];
    });
  }

  function handleStatusChange(status: OpportunityStatus): void {
    if (selectedOpportunity === null) {
      return;
    }

    setOpportunities((currentOpportunities) => updateOpportunityStatus(currentOpportunities, selectedOpportunity.id, status));
  }

  function handleSync(): void {
    syncMutation.mutate();
  }

  if (opportunitiesQuery.isLoading && opportunities.length === 0) {
    return <OpportunityLoadingSkeleton />;
  }

  return (
    <div className="mx-auto flex max-w-[1480px] flex-col gap-6">
      <OpportunityHero metrics={heroMetrics} lastSyncLabel={lastSyncLabel} />

      {opportunitiesQuery.isError ? <SourceErrorBanner /> : null}

      <section aria-labelledby="opportunity-command-title" className="premium-surface px-4 py-4 md:px-5 md:py-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <SearchCommand searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <SortControl sortMode={sortMode} onSortChange={setSortMode} />
            <motion.button
              {...buttonTap}
              type="button"
              onClick={handleSync}
              className={cn(
                "fine-focus inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors duration-150",
                syncMutation.isPending
                  ? "border-royal bg-royal text-surface-2"
                  : "border-border-subtle bg-surface-2 text-ink hover:bg-royal-light hover:text-royal"
              )}
            >
              <ArrowsClockwise size={17} />
              Sync
            </motion.button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((filter) => {
              const isActive = activeFilters.includes(filter.id);

              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => toggleFilter(filter.id)}
                  className={cn(
                    "fine-focus inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "border-royal bg-royal text-surface-2"
                      : "border-border-subtle bg-surface-2 text-ink-60 hover:bg-royal-light hover:text-royal"
                  )}
                >
                  <Funnel size={14} />
                  {filter.label}
                </button>
              );
            })}
          </div>

          <p className="text-sm text-ink-60" aria-live="polite">
            {visibleOpportunities.length} opportunité(s) lisible(s)
          </p>
        </div>
      </section>

      <div className={cn("grid gap-5", selectedOpportunity !== null && "xl:grid-cols-[minmax(0,1fr)_440px]")}>
        <section className="min-w-0">
          <OpportunityTable
            opportunities={visibleOpportunities}
            selectedOpportunityId={selectedOpportunity?.id ?? null}
            onSelectOpportunity={(opportunity) => setSelectedOpportunityId(opportunity.id)}
            onSync={handleSync}
          />
        </section>

        <OpportunityInspector opportunity={selectedOpportunity} onStatusChange={handleStatusChange} />
      </div>
    </div>
  );
}

function OpportunityHero({ metrics, lastSyncLabel }: Readonly<{ metrics: ReadonlyArray<HeroMetric>; lastSyncLabel: string }>) {
  return (
    <header className="grid gap-5 rounded-lg px-1 pt-2 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.74fr)] md:items-end">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-royal">
          <Compass size={18} weight="duotone" />
          Mobility Intelligence Command Center
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink md:text-[2.75rem]">
          Good morning, Kreesten
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-ink-60">
          Les opportunités internationales sont classées pour une lecture rapide: ce qui finance, ce qui presse, et ce qui mérite une candidature.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
        {metrics.map((metric) => (
          <div key={metric.label} className={cn("rounded-md border px-4 py-3 shadow-sm", metricClassName[metric.tone])}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink-60">{metric.label}</p>
              <span className="mono text-lg font-semibold text-ink">{metric.value}</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-ink-60">{metric.detail}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-60 md:col-span-2">Dernière sync: {lastSyncLabel}</p>
    </header>
  );
}

function SearchCommand({ searchTerm, onSearchChange }: Readonly<{ searchTerm: string; onSearchChange: (value: string) => void }>) {
  return (
    <label className="relative block">
      <span id="opportunity-command-title" className="sr-only">
        Recherche opportunités
      </span>
      <MagnifyingGlass size={23} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-royal" />
      <input
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        className="fine-focus h-14 w-full rounded-lg border border-border-subtle bg-surface-2 pl-12 pr-4 text-base font-medium text-ink outline-none transition placeholder:text-ink-30"
        placeholder="Rechercher titre, organisation, pays, domaine..."
        type="search"
      />
    </label>
  );
}

function SortControl({
  sortMode,
  onSortChange
}: Readonly<{ sortMode: OpportunitySort; onSortChange: (value: OpportunitySort) => void }>) {
  return (
    <label className="inline-flex h-10 items-center gap-2 rounded-md border border-border-subtle bg-surface-2 px-3 text-sm text-ink-60">
      <span>Trier</span>
      <select
        value={sortMode}
        onChange={(event) => onSortChange(event.target.value as OpportunitySort)}
        className="fine-focus bg-transparent text-sm font-semibold text-ink outline-none"
        aria-label="Trier les opportunités"
      >
        {Object.entries(sortLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SourceErrorBanner() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-danger bg-danger-bg px-3 py-2 text-sm text-danger">
      <CloudWarning size={18} />
      Source API locale indisponible: les offres de démonstration restent utilisables.
    </div>
  );
}

function OpportunityLoadingSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1480px] gap-5">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div className="skeleton h-5 w-64 rounded-md" />
          <div className="skeleton mt-4 h-12 max-w-xl rounded-md" />
          <div className="skeleton mt-4 h-5 max-w-2xl rounded-md" />
        </div>
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="skeleton h-20 rounded-md" />
          ))}
        </div>
      </div>
      <div className="premium-surface p-4">
        <div className="skeleton h-14 rounded-lg" />
      </div>
      <div className="grid gap-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="skeleton h-36 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function buildHeroMetrics(opportunities: ReadonlyArray<Opportunity>): ReadonlyArray<HeroMetric> {
  const priorityCount = opportunities.filter((opportunity) => opportunity.score >= 80 && opportunity.status !== "archived").length;
  const criticalCount = opportunities.filter((opportunity) => {
    const daysUntilDeadline = getDaysUntilDeadline(opportunity);

    return daysUntilDeadline !== null && daysUntilDeadline >= 0 && daysUntilDeadline < 14;
  }).length;
  const newCount = opportunities.filter((opportunity) => opportunity.status === "new").length;

  return [
    {
      label: "Priorités fortes",
      value: String(priorityCount),
      detail: "Candidatures à lire avant tout le reste.",
      tone: "royal"
    },
    {
      label: "Fenêtre courte",
      value: String(criticalCount),
      detail: "Deadlines a moins de 14 jours.",
      tone: "warning"
    },
    {
      label: "Nouveaux signaux",
      value: String(newCount),
      detail: "Offres fraîches à qualifier.",
      tone: "quiet"
    }
  ];
}

const metricClassName: Record<HeroMetric["tone"], string> = {
  royal: "border-royal-mid bg-royal-light",
  warning: "border-warning bg-warning-bg",
  quiet: "border-border-subtle bg-surface-2"
};
