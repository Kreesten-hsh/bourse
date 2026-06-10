"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowsClockwise, CloudWarning, Funnel, MagnifyingGlass } from "@phosphor-icons/react";
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
import { OpportunityInspector } from "./opportunity-inspector";
import { OpportunityTable } from "./opportunity-table";
import { sampleOpportunities } from "./sample-opportunities";

type FilterOption = Readonly<{
  id: OpportunityFilter;
  label: string;
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

  useEffect(() => {
    if (visibleOpportunities.length === 0) {
      setSelectedOpportunityId(null);
      return;
    }

    const selectedIsVisible = visibleOpportunities.some((opportunity) => opportunity.id === selectedOpportunityId);

    if (!selectedIsVisible) {
      setSelectedOpportunityId(visibleOpportunities[0].id);
    }
  }, [selectedOpportunityId, visibleOpportunities]);

  const selectedOpportunity =
    visibleOpportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ?? visibleOpportunities[0] ?? null;

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
    <div className="mx-auto flex max-w-[1560px] flex-col gap-4">
      <TopBar
        searchTerm={searchTerm}
        sortMode={sortMode}
        lastSyncLabel={lastSyncLabel}
        syncPending={syncMutation.isPending}
        onSearchChange={setSearchTerm}
        onSortChange={setSortMode}
        onSync={handleSync}
      />

      {opportunitiesQuery.isError ? <SourceErrorBanner /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
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
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors duration-150",
                  isActive ? "border-royal bg-royal text-surface-2" : "border-border bg-surface-2 text-ink-60 hover:bg-royal-light hover:text-royal"
                )}
              >
                <Funnel size={14} />
                {filter.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-ink-60">{visibleOpportunities.length} offre(s) lisible(s)</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="panel min-w-0 overflow-hidden">
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

type TopBarProps = Readonly<{
  searchTerm: string;
  sortMode: OpportunitySort;
  lastSyncLabel: string;
  syncPending: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (value: OpportunitySort) => void;
  onSync: () => void;
}>;

function TopBar({
  searchTerm,
  sortMode,
  lastSyncLabel,
  syncPending,
  onSearchChange,
  onSortChange,
  onSync
}: TopBarProps) {
  return (
    <header className="panel grid gap-3 p-4 lg:grid-cols-[220px_minmax(280px,1fr)_auto] lg:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Opportunités</h1>
        <p className="mt-1 text-sm text-ink-60">Dernière sync : {lastSyncLabel}</p>
      </div>

      <label className="relative block">
        <span className="sr-only">Rechercher</span>
        <MagnifyingGlass size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-royal" />
        <input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-11 w-full rounded-md border border-border bg-surface-2 pl-10 pr-3 text-sm text-ink outline-none transition-shadow placeholder:text-ink-30 focus:border-royal focus:shadow-focus"
          placeholder="Rechercher par titre, organisation, pays..."
          type="search"
        />
      </label>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <select
          value={sortMode}
          onChange={(event) => onSortChange(event.target.value as OpportunitySort)}
          className="h-10 rounded-md border border-border bg-surface-2 px-3 text-sm text-ink outline-none focus:border-royal focus:shadow-focus"
          aria-label="Trier les opportunités"
        >
          {Object.entries(sortLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <motion.button
          {...buttonTap}
          type="button"
          onClick={onSync}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors duration-150",
            syncPending
              ? "border-royal bg-royal text-surface-2"
              : "border-border bg-transparent text-ink hover:bg-royal-light hover:text-royal"
          )}
        >
          <ArrowsClockwise size={17} />
          Sync
        </motion.button>
      </div>
    </header>
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
    <div className="mx-auto grid max-w-[1560px] gap-4">
      <div className="panel p-4">
        <div className="skeleton h-7 w-48 rounded-md" />
        <div className="skeleton mt-4 h-11 rounded-md" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="panel p-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="skeleton mb-3 h-14 rounded-md" />
          ))}
        </div>
        <div className="panel p-4">
          <div className="skeleton h-32 rounded-md" />
          <div className="skeleton mt-4 h-52 rounded-md" />
        </div>
      </div>
    </div>
  );
}
