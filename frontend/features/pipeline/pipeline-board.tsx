"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/cn";
import type { Opportunity, OpportunityStatus } from "@/types/opportunity";
import { OpportunityDetailDrawer } from "@/features/opportunities/opportunity-detail-drawer";
import { sampleOpportunities } from "@/features/opportunities/sample-opportunities";
import { formatDeadlineLabel, formatDestination } from "@/features/opportunities/opportunity-view-model";

type JourneyStage = Readonly<{
  status: OpportunityStatus;
  title: string;
  promise: string;
  icon: string;
}>;

type GroupedStage = JourneyStage &
  Readonly<{
    opportunities: ReadonlyArray<Opportunity>;
  }>;

const closeDelayMs = 300;

const journeyStages: ReadonlyArray<JourneyStage> = [
  { status: "new", title: "Nouvelles", promise: "Signaux à qualifier avant qu'ils ne deviennent urgents.", icon: "travel_explore" },
  { status: "analyzing", title: "À analyser", promise: "Conditions, financement et risques à clarifier.", icon: "manage_search" },
  { status: "priority", title: "Prioritaires", promise: "Les candidatures qui méritent une vraie action.", icon: "stars" },
  { status: "applying", title: "Dossier en cours", promise: "Documents, angle narratif et preuves à assembler.", icon: "edit_document" },
  { status: "applied", title: "Postulées", promise: "Soumissions à suivre sans perdre le fil.", icon: "outgoing_mail" },
  { status: "result", title: "Résultat", promise: "Décisions, relances et prochaines bifurcations.", icon: "task_alt" }
];

export function PipelineBoard() {
  const closeTimerRef = useRef<number | null>(null);
  const [opportunities, setOpportunities] = useState<ReadonlyArray<Opportunity>>(sampleOpportunities);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const groupedStages = useMemo(
    () =>
      journeyStages.map((stage) => ({
        ...stage,
        opportunities: opportunities.filter((opportunity) => opportunity.status === stage.status)
      })),
    [opportunities]
  );

  const priorityCount = opportunities.filter((opportunity) => opportunity.status === "priority").length;
  const inProgressCount = opportunities.filter((opportunity) => opportunity.status === "applying").length;

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

  return (
    <main className="mx-auto flex w-full max-w-container-max flex-col gap-10 px-margin-mobile py-12 md:px-margin-desktop md:py-20">
      <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <p className="text-label-sm uppercase tracking-[0.16em] text-secondary">Parcours de candidature</p>
          <h1 className="mt-3 font-display text-headline-lg-mobile text-primary md:text-display-lg">Suivi des candidatures</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
            Une trajectoire claire pour passer d'une opportunité repérée à une candidature envoyée, sans transformer ton avenir en tableau de bord.
          </p>
        </div>

        <aside className="editorial-card p-5">
          <p className="text-label-sm uppercase tracking-[0.14em] text-secondary">Aujourd'hui</p>
          <p className="mt-3 font-display text-headline-md text-primary">{priorityCount} priorités</p>
          <p className="mt-2 text-body-md text-on-surface-variant">
            {inProgressCount} dossier{inProgressCount > 1 ? "s" : ""} en cours. Traite d'abord les échéances proches, puis affine l'angle de candidature.
          </p>
        </aside>
      </header>

      <section className="grid gap-4">
        {groupedStages.map((stage, index) => (
          <JourneyStageRow key={stage.status} stage={stage} index={index} onOpen={openDrawer} />
        ))}
      </section>

      <OpportunityDetailDrawer
        opportunity={selectedOpportunity}
        isOpen={drawerOpen}
        onClose={closeDrawer}
        onToggleSaved={handleToggleSaved}
      />
    </main>
  );
}

function JourneyStageRow({
  stage,
  index,
  onOpen
}: Readonly<{
  stage: GroupedStage;
  index: number;
  onOpen: (opportunity: Opportunity) => void;
}>) {
  return (
    <section className="grid gap-4 border-t border-outline-variant pt-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
      <header className="flex gap-4">
        <span className="mono grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-label-sm text-on-primary">
          {index + 1}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <MaterialIcon name={stage.icon} className="text-primary" size={18} />
            <h2 className="font-display text-headline-sm text-primary">
              {stage.title} <span className="text-secondary">({stage.opportunities.length})</span>
            </h2>
          </div>
          <p className="mt-2 text-body-sm text-on-surface-variant">{stage.promise}</p>
        </div>
      </header>

      {stage.opportunities.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stage.opportunities.map((opportunity) => (
            <PipelineCard key={opportunity.id} opportunity={opportunity} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[120px] items-center rounded border border-dashed border-outline-variant bg-surface-container-lowest px-5 py-4 text-body-sm text-secondary">
          Aucune opportunité dans cette étape.
        </div>
      )}
    </section>
  );
}

function PipelineCard({
  opportunity,
  onOpen
}: Readonly<{
  opportunity: Opportunity;
  onOpen: (opportunity: Opportunity) => void;
}>) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onOpen(opportunity);
  }

  return (
    <article
      aria-label={`Ouvrir ${opportunity.title}`}
      className="editorial-card min-h-[180px] cursor-pointer p-4"
      onClick={() => onOpen(opportunity)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-label-sm text-secondary">{opportunity.organization}</p>
          <h3 className="mt-1 line-clamp-2 font-display text-headline-sm text-primary">{opportunity.title}</h3>
        </div>
        <span className={cn("mono grid h-10 w-10 shrink-0 place-items-center rounded-full text-label-sm font-semibold", scoreToneClassName(opportunity.score))}>
          {opportunity.score}
        </span>
      </div>

      <dl className="mt-5 grid gap-2 text-label-sm text-on-surface-variant">
        <div className="flex items-center gap-2">
          <MaterialIcon name="event" size={14} />
          <dt className="sr-only">Échéance</dt>
          <dd>{formatDeadlineLabel(opportunity)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <MaterialIcon name="public" size={14} />
          <dt className="sr-only">Destination</dt>
          <dd>{formatDestination(opportunity)}</dd>
        </div>
      </dl>

      <span className="mt-5 inline-flex items-center gap-1 text-label-md text-primary">
        Ouvrir le dossier
        <MaterialIcon name="arrow_forward" size={15} />
      </span>
    </article>
  );
}

function scoreToneClassName(score: number): string {
  if (score >= 80) {
    return "bg-success-container text-success";
  }

  if (score >= 60) {
    return "bg-warning-container text-warning";
  }

  return "bg-surface-container-highest text-secondary";
}
