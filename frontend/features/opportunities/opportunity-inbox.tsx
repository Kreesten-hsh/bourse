"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { MaterialIcon } from "@/components/ui/material-icon";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { Opportunity } from "@/types/opportunity";
import {
  applyOpportunityQuery,
  type OpportunityFilter,
  sortOpportunities
} from "./opportunity-collection";
import { OpportunityCard } from "./opportunity-card";
import { OpportunityDetailDrawer } from "./opportunity-detail-drawer";

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

export function OpportunityInbox() {
  const queryClient = useQueryClient();
  const closeTimerRef = useRef<number | null>(null);
  const [opportunities, setOpportunities] = useState<ReadonlyArray<Opportunity>>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<ReadonlyArray<OpportunityFilter>>([]);

  const opportunitiesQuery = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => api.opportunities.list()
  });

  const savedQuery = useQuery({
    queryKey: ["savedOpportunities"],
    queryFn: () => api.saved.list()
  });

  const syncMutation = useMutation({
    mutationFn: () => api.sync.trigger(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    }
  });

  useEffect(() => {
    if (opportunitiesQuery.isSuccess && savedQuery.isSuccess) {
      const savedIds = new Set(savedQuery.data.map((o) => o.id));
      setOpportunities(
        opportunitiesQuery.data.map((opportunity) => ({
          ...opportunity,
          isSaved: savedIds.has(opportunity.id)
        }))
      );
    }

    if (opportunitiesQuery.isError) {
      setOpportunities([]);
    }
  }, [opportunitiesQuery.data, opportunitiesQuery.isError, opportunitiesQuery.isSuccess, savedQuery.data, savedQuery.isSuccess]);

  const visibleOpportunities = useMemo(() => {
    const queried = applyOpportunityQuery(opportunities, { searchTerm, activeFilters });

    return sortOpportunities(queried, "recent");
  }, [activeFilters, opportunities, searchTerm]);

  const featuredId = visibleOpportunities[0]?.score >= 80 ? visibleOpportunities[0].id : null;
  const activeOpportunityCount = opportunities.filter((opportunity) => opportunity.status !== "archived").length;
  const fundedOpportunityCount = opportunities.filter((opportunity) => opportunity.funding_type === "full" || opportunity.monthly_stipend !== null).length;

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

  async function handleToggleSaved(opportunityId: string): Promise<void> {
    const opportunity = opportunities.find((o) => o.id === opportunityId);
    if (!opportunity) return;
    
    const wasSaved = opportunity.isSaved;

    setOpportunities((currentOpportunities) =>
      currentOpportunities.map((opportunity) => {
        if (opportunity.id !== opportunityId) {
          return opportunity;
        }

        return { ...opportunity, isSaved: !opportunity.isSaved };
      })
    );

    try {
      if (wasSaved) {
        await api.saved.remove(opportunityId);
      } else {
        await api.saved.save(opportunityId);
      }
      void queryClient.invalidateQueries({ queryKey: ["savedOpportunities"] });
    } catch (error) {
      console.error("Failed to toggle save status", error);
      setOpportunities((currentOpportunities) =>
        currentOpportunities.map((opportunity) => {
          if (opportunity.id !== opportunityId) {
            return opportunity;
          }
          return { ...opportunity, isSaved: wasSaved };
        })
      );
    }
  }

  if (opportunitiesQuery.isLoading && opportunities.length === 0) {
    return <OpportunityLoadingSkeleton />;
  }

  return (
    <main className="mx-auto flex w-full max-w-container-max flex-col gap-12 px-margin-mobile py-12 md:px-margin-desktop md:py-20">
      <section className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="text-label-sm uppercase tracking-[0.18em] text-secondary">Centre de veille mobilité</p>
        <h1 className="mt-5 font-display text-headline-lg-mobile text-primary md:text-display-lg">Découverte</h1>
        <p className="mt-5 text-body-lg text-on-surface-variant">
          Trouve les opportunités financées qui peuvent ouvrir ton avenir international.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-label-md text-secondary">
          <span>{activeOpportunityCount} opportunités actives</span>
          <span className="h-1 w-1 rounded-full bg-secondary" />
          <span>{fundedOpportunityCount} financements détectés</span>
        </div>
      </section>

      <section className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-[760px] items-center justify-between gap-4 md:min-w-0">
          <div className="flex shrink-0 items-center gap-1.5">
            {filterOptions.map((filter) => {
              const active = activeFilters.includes(filter.id);

              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleFilter(filter.id)}
                  className={cn(
                    "h-8 rounded-full border px-3 text-xs font-semibold leading-none tracking-[0.03em] transition-colors focus:outline-none focus-visible:shadow-focus",
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

          <label className="relative ml-auto block w-72 shrink-0 md:w-80">
            <span className="sr-only">Rechercher une opportunité</span>
            <MaterialIcon name="search" className="absolute left-0 top-1/2 -translate-y-1/2 text-secondary" size={20} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-8 w-full border-0 border-b border-outline-variant bg-transparent pl-6 pr-1 text-xs font-semibold leading-none text-on-surface outline-none transition-colors placeholder:text-secondary focus:border-primary focus:ring-0"
              placeholder="Rechercher..."
              type="search"
            />
          </label>
        </div>
      </section>

      {opportunitiesQuery.isError ? <SourceErrorBanner /> : null}

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
        <EmptyOpportunityState isSyncing={syncMutation.isPending} onSync={() => syncMutation.mutate()} />
      )}

      <OpportunityDetailDrawer
        opportunity={selectedOpportunity}
        isOpen={drawerOpen}
        onClose={closeDrawer}
        onToggleSaved={handleToggleSaved}
      />

      <footer className="border-t border-outline-variant pt-10 text-label-md text-secondary md:flex md:items-center md:justify-between">
        <p className="font-display text-headline-md text-primary">to the world</p>
        <p className="mt-3 md:mt-0">Veille privée pour bourses, stages et programmes financés.</p>
      </footer>
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

function SourceErrorBanner() {
  return (
    <section className="flex items-center gap-3 border border-error-container bg-error-container px-4 py-3 text-body-md text-error">
      <MaterialIcon name="cancel" size={18} />
      <p>L'API locale ne répond pas. Démarre le backend puis relance une synchronisation OSINT.</p>
    </section>
  );
}

function EmptyOpportunityState({ isSyncing, onSync }: Readonly<{ isSyncing: boolean; onSync: () => void }>) {
  return (
    <section className="flex min-h-[420px] flex-col items-center justify-center rounded border border-outline-variant bg-surface-container-lowest p-12 text-center">
      <MaterialIcon name="book" className="text-outline-variant" size={64} />
      <h2 className="mt-4 font-display text-headline-md text-primary">Aucune opportunité collectée</h2>
      <p className="mt-3 max-w-md text-body-md text-on-surface-variant">
        Lance une synchronisation pour récupérer les dernières opportunités depuis les sources OSINT enregistrées.
      </p>
      <button
        type="button"
        onClick={onSync}
        disabled={isSyncing}
        className="editorial-button-primary mt-6 px-6 py-3 text-label-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSyncing ? "Synchronisation..." : "Synchroniser les sources"}
      </button>
    </section>
  );
}

function OpportunityLoadingSkeleton() {
  return (
    <main className="mx-auto grid w-full max-w-container-max gap-12 px-margin-mobile py-12 md:px-margin-desktop md:py-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5">
        <div className="skeleton h-4 w-48 rounded-full" />
        <div className="skeleton h-12 w-56 rounded" />
        <div className="skeleton h-5 w-full max-w-xl rounded" />
        <div className="skeleton h-5 w-64 rounded" />
      </div>
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div className="skeleton h-[300px] rounded md:col-span-8" />
        <div className="skeleton h-[300px] rounded md:col-span-4" />
        <div className="skeleton h-[240px] rounded md:col-span-4" />
        <div className="skeleton h-[240px] rounded md:col-span-4" />
        <div className="skeleton h-[240px] rounded md:col-span-4" />
      </div>
    </main>
  );
}
