"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { MaterialIcon } from "@/components/ui/material-icon";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { Opportunity, OpportunityStatus } from "@/types/opportunity";
import {
  applyOpportunityQuery,
  type OpportunityFilter,
  type OpportunitySort,
  sortOpportunities,
  updateOpportunityStatus
} from "./opportunity-collection";
import { OpportunityCard } from "./opportunity-card";
import { OpportunityDetailDrawer } from "./opportunity-detail-drawer";
import { sampleOpportunities } from "./sample-opportunities";

type FilterOption = Readonly<{
  id: OpportunityFilter;
  label: string;
}>;

const closeDelayMs = 300;

const filterOptions: ReadonlyArray<FilterOption> = [
  { id: "funded", label: "Financées" },
  { id: "tech", label: "Tech / Cyber" },
  { id: "africa_global", label: "Afrique & Global" },
  { id: "urgent", label: "Urgent" },
  { id: "needs_review", label: "À vérifier" },
  { id: "archived", label: "Archivées" }
];

const sortLabels: Record<OpportunitySort, string> = {
  score: "Score",
  deadline: "Échéance",
  funding: "Financement",
  recent: "Récent"
};

export function OpportunityInbox() {
  const queryClient = useQueryClient();
  const closeTimerRef = useRef<number | null>(null);
  const [opportunities, setOpportunities] = useState<ReadonlyArray<Opportunity>>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<ReadonlyArray<OpportunityFilter>>([]);
  const [sortMode, setSortMode] = useState<OpportunitySort>("score");
  const [eligibleOnly, setEligibleOnly] = useState(false);

  const opportunitiesQuery = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => api.opportunities.list()
  });

  const syncMutation = useMutation({
    mutationFn: () => api.sync.trigger(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    }
  });

  useEffect(() => {
    if (opportunitiesQuery.isSuccess) {
      const nextOpportunities = opportunitiesQuery.data.length > 0 ? opportunitiesQuery.data : sampleOpportunities;
      setOpportunities(normalizeOpportunities(nextOpportunities));
    }

    if (opportunitiesQuery.isError) {
      setOpportunities(sampleOpportunities);
    }
  }, [opportunitiesQuery.data, opportunitiesQuery.isError, opportunitiesQuery.isSuccess]);

  const visibleOpportunities = useMemo(() => {
    const queried = applyOpportunityQuery(opportunities, { searchTerm, activeFilters });
    const eligible = eligibleOnly ? queried.filter((opportunity) => opportunity.score >= 60 && opportunity.status !== "archived") : queried;

    return sortOpportunities(eligible, sortMode);
  }, [activeFilters, eligibleOnly, opportunities, searchTerm, sortMode]);

  const featuredId = visibleOpportunities[0]?.score >= 80 ? visibleOpportunities[0].id : null;

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current === null) {
      return;
    }

    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const closeDrawer = useCallback(() => {
    clearCloseTimer();
    setDrawerOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      setSelectedOpportunity(null);
      closeTimerRef.current = null;
    }, closeDelayMs);
  }, [clearCloseTimer]);

  const openDrawer = useCallback(
    (opportunity: Opportunity) => {
      clearCloseTimer();
      setSelectedOpportunity(opportunity);
      window.requestAnimationFrame(() => setDrawerOpen(true));
    },
    [clearCloseTimer]
  );

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  useEffect(() => {
    if (selectedOpportunity === null) {
      return;
    }

    const nextSelected = opportunities.find((opportunity) => opportunity.id === selectedOpportunity.id);

    if (nextSelected !== undefined && nextSelected !== selectedOpportunity) {
      setSelectedOpportunity(nextSelected);
    }
  }, [opportunities, selectedOpportunity]);

  function toggleFilter(filter: OpportunityFilter): void {
    setActiveFilters((currentFilters) => {
      if (currentFilters.includes(filter)) {
        return currentFilters.filter((currentFilter) => currentFilter !== filter);
      }

      return [...currentFilters, filter];
    });
  }

  function handleStatusChange(opportunityId: string, status: OpportunityStatus): void {
    setOpportunities((currentOpportunities) => updateOpportunityStatus(currentOpportunities, opportunityId, status));
  }

  function handleToggleSaved(opportunityId: string): void {
    setOpportunities((currentOpportunities) =>
      currentOpportunities.map((opportunity) => {
        if (opportunity.id !== opportunityId) {
          return opportunity;
        }

        return { ...opportunity, isSaved: !opportunity.isSaved };
      })
    );
  }

  if (opportunitiesQuery.isLoading && opportunities.length === 0) {
    return <OpportunityLoadingSkeleton />;
  }

  return (
    <main className="mx-auto flex w-full max-w-container-max flex-col gap-12 px-margin-mobile py-10 md:px-margin-desktop md:py-16">
      <section className="relative overflow-hidden">
        <div>
          <p className="text-label-sm uppercase tracking-[0.18em] text-secondary">Centre de veille mobilité</p>
          <h1 className="mt-4 max-w-4xl font-display text-headline-lg-mobile text-primary md:text-display-lg">
            Repérer les portes qui peuvent changer une trajectoire.
          </h1>
          <p className="mt-5 max-w-2xl text-body-lg text-on-surface-variant">
            Bourses, stages, programmes et formations financées, filtrés pour ton profil tech depuis Cotonou.
          </p>

          <label className="mt-8 block max-w-3xl">
            <span className="sr-only">Rechercher une opportunité</span>
            <div className="flex items-center gap-3 rounded border border-outline-variant bg-surface-container-lowest px-4 py-3 shadow-card transition-colors focus-within:border-primary">
              <MaterialIcon name="search" className="text-secondary" size={22} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full border-0 bg-transparent text-body-lg text-on-surface outline-none placeholder:text-secondary focus:ring-0"
                placeholder="Rechercher une bourse, un pays, une organisation..."
                type="search"
              />
            </div>
          </label>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => {
                const active = activeFilters.includes(filter.id);

                return (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleFilter(filter.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-label-md transition-colors focus:outline-none focus-visible:shadow-focus",
                      active
                        ? "border-primary-container bg-primary-container text-on-primary"
                        : "border-outline-variant bg-chip-bg text-on-surface-variant hover:bg-surface-container"
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-label-md text-on-surface-variant">
                <span className="text-secondary">Trier</span>
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as OpportunitySort)}
                  className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-label-md text-primary focus:border-primary focus:outline-none"
                  aria-label="Trier les opportunités"
                >
                  {Object.entries(sortLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  checked={eligibleOnly}
                  onChange={(event) => setEligibleOnly(event.target.checked)}
                  className="sr-only"
                  type="checkbox"
                />
                <span className={cn("relative block h-6 w-10 rounded-full transition-colors", eligibleOnly ? "bg-primary-container" : "bg-surface-container-highest")}>
                  <span className={cn("absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform", eligibleOnly && "translate-x-4")} />
                </span>
                <span className="text-label-md text-on-surface-variant">Éligibles uniquement</span>
              </label>
            </div>
        </div>
        </div>
      </section>

      {visibleOpportunities.length > 0 ? (
        <section className="grid grid-cols-1 gap-gutter md:grid-cols-12">
          {visibleOpportunities.map((opportunity, index) => {
            const isFeatured = opportunity.id === featuredId;

            return (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                isFeatured={isFeatured}
                isSelected={selectedOpportunity?.id === opportunity.id && drawerOpen}
                className={getBentoSpan(index, visibleOpportunities.length, isFeatured)}
                onOpen={openDrawer}
                onToggleSaved={handleToggleSaved}
              />
            );
          })}
        </section>
      ) : (
        <EmptyOpportunityState onSync={() => syncMutation.mutate()} />
      )}

      <OpportunityDetailDrawer
        opportunity={selectedOpportunity}
        isOpen={drawerOpen}
        onClose={closeDrawer}
        onStatusChange={handleStatusChange}
      />
    </main>
  );
}

function getBentoSpan(index: number, total: number, isFeatured: boolean): string {
  if (isFeatured && index === 0) {
    return "md:col-span-8";
  }

  if (index === 0) {
    return "md:col-span-12";
  }

  if (total - index < 4) {
    return "md:col-span-6";
  }

  return "md:col-span-4";
}

function normalizeOpportunities(opportunities: ReadonlyArray<Opportunity>): ReadonlyArray<Opportunity> {
  return opportunities.map((opportunity) => ({
    ...opportunity,
    isSaved: opportunity.isSaved ?? false
  }));
}

function EmptyOpportunityState({ onSync }: Readonly<{ onSync: () => void }>) {
  return (
    <section className="flex min-h-[420px] flex-col items-center justify-center rounded border border-outline-variant bg-surface-container-lowest p-12 text-center">
      <MaterialIcon name="explore" className="text-on-surface-variant" size={64} />
      <h2 className="mt-4 font-display text-headline-md text-primary">Aucune opportunité ici</h2>
      <p className="mt-3 max-w-md text-body-md text-on-surface-variant">
        Essaie d'autres filtres ou lance une synchronisation.
      </p>
      <button type="button" onClick={onSync} className="editorial-button-primary mt-6 px-6 py-3 text-label-md">
        Synchroniser les sources
      </button>
    </section>
  );
}

function OpportunityLoadingSkeleton() {
  return (
    <main className="mx-auto grid w-full max-w-container-max gap-8 px-margin-mobile py-12 md:px-margin-desktop">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4">
        <div className="skeleton h-12 w-52 rounded" />
        <div className="skeleton h-5 w-full max-w-xl rounded" />
        <div className="skeleton h-5 w-64 rounded" />
      </div>
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div className="skeleton h-[360px] rounded md:col-span-8" />
        <div className="skeleton h-[360px] rounded md:col-span-4" />
        <div className="skeleton h-[240px] rounded md:col-span-4" />
        <div className="skeleton h-[240px] rounded md:col-span-4" />
        <div className="skeleton h-[240px] rounded md:col-span-4" />
      </div>
    </main>
  );
}
