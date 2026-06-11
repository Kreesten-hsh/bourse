"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  tone: "blue" | "amber" | "slate";
}>;

const closeAnimationDurationMs = 300;

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
  const closeTimerRef = useRef<number | null>(null);
  const [opportunities, setOpportunities] = useState<ReadonlyArray<Opportunity>>([]);
  const [selectedAd, setSelectedAd] = useState<Opportunity | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
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

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current === null) {
      return;
    }

    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const closeDetailPanel = useCallback(() => {
    clearCloseTimer();
    setIsPanelOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      setSelectedAd(null);
      closeTimerRef.current = null;
    }, closeAnimationDurationMs);
  }, [clearCloseTimer]);

  const openDetailPanel = useCallback(
    (opportunity: Opportunity) => {
      clearCloseTimer();
      setSelectedAd(opportunity);
      window.requestAnimationFrame(() => setIsPanelOpen(true));
    },
    [clearCloseTimer]
  );

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  useEffect(() => {
    if (!isPanelOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDetailPanel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeDetailPanel, isPanelOpen]);

  useEffect(() => {
    document.body.style.overflow = isPanelOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isPanelOpen]);

  useEffect(() => {
    if (selectedAd === null) {
      return;
    }

    const visibleSelectedAd = visibleOpportunities.find((opportunity) => opportunity.id === selectedAd.id);

    if (visibleSelectedAd === undefined) {
      closeDetailPanel();
      return;
    }

    if (visibleSelectedAd !== selectedAd) {
      setSelectedAd(visibleSelectedAd);
    }
  }, [closeDetailPanel, selectedAd, visibleOpportunities]);

  function toggleFilter(filter: OpportunityFilter): void {
    setActiveFilters((currentFilters) => {
      if (currentFilters.includes(filter)) {
        return currentFilters.filter((currentFilter) => currentFilter !== filter);
      }

      return [...currentFilters, filter];
    });
  }

  function handleStatusChange(status: OpportunityStatus): void {
    if (selectedAd === null) {
      return;
    }

    setOpportunities((currentOpportunities) => updateOpportunityStatus(currentOpportunities, selectedAd.id, status));
    setSelectedAd((currentAd) => {
      if (currentAd === null) {
        return null;
      }

      return {
        ...currentAd,
        status,
        updated_at: new Date().toISOString()
      };
    });
  }

  function handleSync(): void {
    syncMutation.mutate();
  }

  if (opportunitiesQuery.isLoading && opportunities.length === 0) {
    return <OpportunityLoadingSkeleton />;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <OpportunityHero metrics={heroMetrics} lastSyncLabel={lastSyncLabel} />

      {opportunitiesQuery.isError ? <SourceErrorBanner /> : null}

      <section
        aria-labelledby="opportunity-command-title"
        className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:px-5 md:py-5"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <SearchCommand searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <SortControl sortMode={sortMode} onSortChange={setSortMode} />
            <motion.button
              {...buttonTap}
              type="button"
              onClick={handleSync}
              className={cn(
                "inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500",
                syncMutation.isPending
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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
                    "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500",
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  )}
                >
                  <Funnel size={14} />
                  {filter.label}
                </button>
              );
            })}
          </div>

          <p className="text-sm text-slate-500" aria-live="polite">
            {visibleOpportunities.length} opportunité(s) lisible(s)
          </p>
        </div>
      </section>

      <section className="min-w-0">
        <OpportunityTable
          opportunities={visibleOpportunities}
          selectedOpportunityId={isPanelOpen ? selectedAd?.id ?? null : null}
          onSelectOpportunity={openDetailPanel}
          onSync={handleSync}
        />
      </section>

      <OpportunityInspector
        opportunity={selectedAd}
        isOpen={isPanelOpen}
        onClose={closeDetailPanel}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

function OpportunityHero({ metrics, lastSyncLabel }: Readonly<{ metrics: ReadonlyArray<HeroMetric>; lastSyncLabel: string }>) {
  return (
    <header className="grid gap-5 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(300px,0.68fr)] md:items-end">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
          <Compass size={18} weight="duotone" />
          Mobility Intelligence Command Center
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 md:text-[2.75rem]">
          Good morning, Kreesten
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Les opportunités internationales sont classées pour une lecture rapide: financement, urgence, pertinence profil.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
        {metrics.map((metric) => (
          <div key={metric.label} className={cn("rounded-xl border px-4 py-3 shadow-sm", metricClassName[metric.tone])}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <span className="mono text-lg font-semibold text-slate-900">{metric.value}</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">{metric.detail}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 md:col-span-2">Dernière sync: {lastSyncLabel}</p>
    </header>
  );
}

function SearchCommand({ searchTerm, onSearchChange }: Readonly<{ searchTerm: string; onSearchChange: (value: string) => void }>) {
  return (
    <label className="relative block">
      <span id="opportunity-command-title" className="sr-only">
        Recherche opportunités
      </span>
      <MagnifyingGlass size={23} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" />
      <input
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-base font-medium text-slate-900 outline-none transition-all duration-300 ease-in-out placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
    <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500">
      <span>Trier</span>
      <select
        value={sortMode}
        onChange={(event) => onSortChange(event.target.value as OpportunitySort)}
        className="bg-transparent text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
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
    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm">
      <CloudWarning size={18} />
      Source API locale indisponible: les offres de démonstration restent utilisables.
    </div>
  );
}

function OpportunityLoadingSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="skeleton h-5 w-64 rounded-xl" />
        <div className="skeleton mt-4 h-12 max-w-xl rounded-xl" />
        <div className="skeleton mt-4 h-5 max-w-2xl rounded-xl" />
      </div>
      <div className="grid gap-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="skeleton h-36 rounded-xl" />
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
      tone: "blue"
    },
    {
      label: "Fenêtre courte",
      value: String(criticalCount),
      detail: "Deadlines à moins de 14 jours.",
      tone: "amber"
    },
    {
      label: "Nouveaux signaux",
      value: String(newCount),
      detail: "Offres fraîches à qualifier.",
      tone: "slate"
    }
  ];
}

const metricClassName: Record<HeroMetric["tone"], string> = {
  blue: "border-blue-200 bg-blue-50",
  amber: "border-amber-200 bg-amber-50",
  slate: "border-slate-200 bg-slate-50"
};
