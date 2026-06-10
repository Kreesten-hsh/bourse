import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";

import { sampleOpportunities } from "@/features/opportunities/sample-opportunities";
import { formatDeadlineLabel } from "@/features/opportunities/opportunity-view-model";
import { getScoreBand, scoreBandClassName, statusLabel } from "@/features/opportunities/opportunity-style";
import { cn } from "@/lib/cn";
import type { Opportunity, OpportunityStatus } from "@/types/opportunity";

const columns: ReadonlyArray<Readonly<{ status: OpportunityStatus; title: string }>> = [
  { status: "new", title: "Nouveau" },
  { status: "analyzing", title: "À analyser" },
  { status: "priority", title: "Prioritaire" },
  { status: "applying", title: "Dossier en cours" },
  { status: "applied", title: "Postulé" },
  { status: "result", title: "Résultat" }
];

export function PipelineBoard() {
  return (
    <section className="mx-auto max-w-[1500px]">
      <div className="panel p-5">
        <h1 className="text-2xl font-semibold text-ink">Pipeline</h1>
        <p className="mt-1 text-sm text-ink-60">Changer le statut depuis la fiche opportunité; le drag-drop viendra après stabilisation.</p>
      </div>

      <div className="mt-4 grid gap-3 overflow-x-auto lg:grid-cols-3 2xl:grid-cols-6">
        {columns.map((column) => {
          const opportunities = sampleOpportunities.filter((opportunity) => opportunity.status === column.status);

          return (
            <section key={column.status} className="panel min-h-[420px] min-w-[240px] p-3">
              <h2 className="text-sm font-semibold text-ink">
                {column.title} ({opportunities.length})
              </h2>
              <div className="mt-3 grid gap-2">
                {opportunities.map((opportunity) => (
                  <PipelineCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function PipelineCard({ opportunity }: Readonly<{ opportunity: Opportunity }>) {
  return (
    <article className="rounded-md border border-border bg-surface-2 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-5 text-ink">{opportunity.title}</h3>
        <span
          className={cn(
            "mono grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
            scoreBandClassName[getScoreBand(opportunity.score)]
          )}
        >
          {opportunity.score}
        </span>
      </div>
      <p className="mt-2 text-xs text-ink-60">{opportunity.organization}</p>
      <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-ink-60">
        <CalendarBlank size={14} className="text-royal" />
        {formatDeadlineLabel(opportunity)}
      </p>
      <p className="mt-2 text-xs text-ink-30">{statusLabel[opportunity.status]}</p>
    </article>
  );
}
