import { ArrowRight, CalendarBlank, CheckCircle, Compass } from "@phosphor-icons/react/dist/ssr";

import { sampleOpportunities } from "@/features/opportunities/sample-opportunities";
import { formatDeadlineLabel } from "@/features/opportunities/opportunity-view-model";
import { getScoreBand, scoreBandClassName, statusLabel } from "@/features/opportunities/opportunity-style";
import { cn } from "@/lib/cn";
import type { Opportunity, OpportunityStatus } from "@/types/opportunity";

const journeyStages: ReadonlyArray<Readonly<{ status: OpportunityStatus; title: string; intent: string }>> = [
  { status: "new", title: "Nouveau", intent: "Signaux à qualifier rapidement." },
  { status: "analyzing", title: "À analyser", intent: "Vérifier conditions, financement et risques." },
  { status: "priority", title: "Prioritaire", intent: "Candidatures qui méritent une action." },
  { status: "applying", title: "Dossier en cours", intent: "Documents et angle de candidature." },
  { status: "applied", title: "Postulé", intent: "Suivi après soumission." },
  { status: "result", title: "Résultat", intent: "Décision, retour ou prochaine action." }
];

export function PipelineBoard() {
  const groupedOpportunities = journeyStages.map((stage) => ({
    ...stage,
    opportunities: sampleOpportunities.filter((opportunity) => opportunity.status === stage.status)
  }));

  return (
    <section className="mx-auto grid max-w-[1320px] gap-6">
      <header className="grid gap-4 rounded-lg px-1 md:grid-cols-[minmax(0,1fr)_320px] md:items-end">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-royal">
            <Compass size={18} weight="duotone" />
            Application journey
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink">Votre trajectoire de candidature</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink-60">
            Une vue calme pour suivre les opportunités depuis le premier signal jusqu'au résultat, sans bruit analytique.
          </p>
        </div>

        <div className="rounded-md border border-royal-mid bg-royal-light px-4 py-3">
          <p className="text-sm font-medium text-ink-60">Prochaine action</p>
          <p className="mt-1 text-lg font-semibold text-ink">Traiter les priorités avant les nouvelles offres.</p>
        </div>
      </header>

      <div className="grid gap-4">
        {groupedOpportunities.map((stage, index) => (
          <JourneyStage
            key={stage.status}
            index={index}
            title={stage.title}
            intent={stage.intent}
            status={stage.status}
            opportunities={stage.opportunities}
          />
        ))}
      </div>
    </section>
  );
}

function JourneyStage({
  index,
  title,
  intent,
  status,
  opportunities
}: Readonly<{
  index: number;
  title: string;
  intent: string;
  status: OpportunityStatus;
  opportunities: ReadonlyArray<Opportunity>;
}>) {
  return (
    <section className="grid gap-3 rounded-lg border border-border-subtle bg-surface-2 px-4 py-4 shadow-sm md:grid-cols-[220px_minmax(0,1fr)] md:gap-5">
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <span className="mono grid h-8 w-8 place-items-center rounded-full bg-royal text-xs font-semibold text-surface-2">
            {index + 1}
          </span>
          <span className="mt-2 hidden h-full w-px bg-border-subtle md:block" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">
            {title} <span className="text-ink-60">({opportunities.length})</span>
          </h2>
          <p className="mt-1 text-sm leading-6 text-ink-60">{intent}</p>
          <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-royal">
            <CheckCircle size={14} weight="duotone" />
            {statusLabel[status]}
          </p>
        </div>
      </div>

      {opportunities.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {opportunities.map((opportunity) => (
            <PipelineCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-border-subtle bg-surface-3 px-4 py-5 text-sm text-ink-60">
          Aucune opportunité dans cette étape.
        </div>
      )}
    </section>
  );
}

function PipelineCard({ opportunity }: Readonly<{ opportunity: Opportunity }>) {
  return (
    <article className="group rounded-md border border-border-subtle bg-surface-2 px-4 py-3 transition duration-150 hover:-translate-y-0.5 hover:border-royal-mid hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-5 text-ink">{opportunity.title}</h3>
          <p className="mt-1 text-xs text-ink-60">{opportunity.organization}</p>
        </div>
        <span
          className={cn(
            "mono grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold",
            scoreBandClassName[getScoreBand(opportunity.score)]
          )}
        >
          {opportunity.score}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-60">
        <span className="inline-flex items-center gap-1 font-medium">
          <CalendarBlank size={14} className="text-royal" />
          {formatDeadlineLabel(opportunity)}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-royal opacity-0 transition-opacity group-hover:opacity-100">
          Ouvrir
          <ArrowRight size={14} />
        </span>
      </div>
    </article>
  );
}
