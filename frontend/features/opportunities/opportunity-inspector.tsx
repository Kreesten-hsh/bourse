"use client";

import {
  Archive,
  ArrowSquareOut,
  CheckCircle,
  CloudWarning,
  FileText,
  Flag,
  Lightbulb,
  Money
} from "@phosphor-icons/react";
import { motion } from "motion/react";

import { cn } from "@/lib/cn";
import { buttonTap, panelMotion } from "@/lib/motion";
import type { Opportunity, OpportunityBenefit, OpportunityCondition, OpportunityStatus } from "@/types/opportunity";
import { buildScoreLines, formatScoreLine } from "./scoring-view-model";
import {
  buildBenefits,
  buildConditions,
  formatDeadlineLabel,
  formatDestination,
  formatFundingSummary,
  summarizeTopAdvantages
} from "./opportunity-view-model";
import { statusLabel, typeClassName, typeLabel } from "./opportunity-style";

type OpportunityInspectorProps = Readonly<{
  opportunity: Opportunity | null;
  onStatusChange: (status: OpportunityStatus) => void;
}>;

const workflowStatuses: ReadonlyArray<OpportunityStatus> = ["new", "analyzing", "priority", "applying", "applied", "result", "archived"];

export function OpportunityInspector({ opportunity, onStatusChange }: OpportunityInspectorProps) {
  if (opportunity === null) {
    return null;
  }

  const benefits = buildBenefits(opportunity);
  const conditions = buildConditions(opportunity);
  const scoreLines = buildScoreLines(opportunity);
  const scoreWidth = `${Math.min(100, Math.max(0, opportunity.score))}%`;

  return (
    <motion.aside
      {...panelMotion}
      aria-label={`Fiche de ${opportunity.title}`}
      className="premium-surface w-full overflow-hidden xl:sticky xl:top-5 xl:max-h-[calc(100dvh-40px)] xl:w-[440px] xl:overflow-y-auto"
    >
      <header className="px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-royal">{opportunity.organization}</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-ink">{opportunity.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-60">
              {formatDeadlineLabel(opportunity)} · {formatDestination(opportunity)}
            </p>
          </div>
          <span className="mono grid h-12 w-12 shrink-0 place-items-center rounded-md bg-royal text-lg font-semibold text-surface-2">
            {opportunity.score}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", typeClassName[opportunity.type])}>
            {typeLabel[opportunity.type]}
          </span>
          <span className="rounded-full border border-border-subtle bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-60">
            {formatFundingSummary(opportunity)}
          </span>
        </div>

        <motion.a
          {...buttonTap}
          href={opportunity.official_url}
          target="_blank"
          rel="noreferrer"
          className="fine-focus mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-royal px-4 text-sm font-semibold text-surface-2 transition-colors hover:bg-royal-hover"
        >
          <ArrowSquareOut size={18} />
          Postuler directement
        </motion.a>
      </header>

      <div className="space-y-6 px-5 pb-5">
        <AttentionSection opportunity={opportunity} />
        <BenefitsSection benefits={benefits} />
        <DocumentsSection documents={opportunity.required_documents} />
        <ConditionsSection conditions={conditions} />
        <AnalysisSection opportunity={opportunity} />
        <ScoreSection score={opportunity.score} scoreWidth={scoreWidth} lines={scoreLines} />

        <label className="block border-t border-border-subtle pt-4">
          <span className="text-xs font-semibold uppercase text-ink-60">Statut</span>
          <select
            value={opportunity.status}
            onChange={(event) => onStatusChange(event.target.value as OpportunityStatus)}
            className="fine-focus mt-2 h-10 w-full rounded-md border border-border-subtle bg-surface-2 px-3 text-sm text-ink outline-none"
          >
            {workflowStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel[status]}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-2">
          <motion.button
            {...buttonTap}
            type="button"
            onClick={() => onStatusChange("applying")}
            className="fine-focus inline-flex h-10 items-center justify-center gap-2 rounded-md border border-royal px-4 text-sm font-semibold text-royal transition-colors hover:bg-royal-light"
          >
            Préparer dossier
          </motion.button>
          <button
            type="button"
            onClick={() => onStatusChange("archived")}
            className="fine-focus inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold text-ink-60 transition-colors hover:bg-surface-3 hover:text-danger"
          >
            <Archive size={17} />
            Archiver
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

function AttentionSection({ opportunity }: Readonly<{ opportunity: Opportunity }>) {
  return (
    <section className="rounded-md border border-royal-mid bg-royal-light px-4 py-4">
      <div className="flex items-center gap-2">
        <Lightbulb size={18} weight="duotone" className="text-royal" />
        <h3 className="text-sm font-semibold text-ink">Pourquoi elle mérite votre attention</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink">
        {opportunity.summary ??
          "Elle combine mobilité internationale, domaine technique et potentiel de financement. La décision doit se faire sur les conditions et la date limite."}
      </p>
    </section>
  );
}

function BenefitsSection({ benefits }: Readonly<{ benefits: ReadonlyArray<OpportunityBenefit> }>) {
  return (
    <section aria-labelledby="benefits-title">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Money size={18} weight="duotone" className="text-royal" />
          <h3 id="benefits-title" className="text-base font-semibold text-ink">
            Avantages
          </h3>
        </div>
        <span className="text-xs font-semibold text-royal">À vérifier avant candidature</span>
      </div>
      <div className="grid gap-2">
        {benefits.map((benefit) => (
          <BenefitRow key={benefit.label} benefit={benefit} />
        ))}
      </div>
    </section>
  );
}

function BenefitRow({ benefit }: Readonly<{ benefit: OpportunityBenefit }>) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-surface-3 px-3 py-2">
      <span className="text-sm text-ink-60">{benefit.label}</span>
      <span className={cn("text-right text-sm font-semibold", benefit.confirmed ? "text-success" : "text-ink-60")}>
        {benefit.value}
      </span>
    </div>
  );
}

function DocumentsSection({ documents }: Readonly<{ documents: ReadonlyArray<string> }>) {
  return (
    <section aria-labelledby="documents-title" className="border-t border-border-subtle pt-4">
      <div className="flex items-center gap-2">
        <FileText size={18} weight="duotone" className="text-royal" />
        <h3 id="documents-title" className="text-sm font-semibold text-ink">
          Documents
        </h3>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {documents.map((document) => (
          <div key={document} className="inline-flex items-center gap-2 text-sm text-ink">
            <CheckCircle size={16} className="shrink-0 text-royal" />
            <span>{document}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ConditionsSection({ conditions }: Readonly<{ conditions: ReadonlyArray<OpportunityCondition> }>) {
  return (
    <section aria-labelledby="conditions-title" className="border-t border-border-subtle pt-4">
      <div className="flex items-center gap-2">
        <Flag size={18} weight="duotone" className="text-royal" />
        <h3 id="conditions-title" className="text-sm font-semibold text-ink">
          Conditions
        </h3>
      </div>
      <dl className="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-1">
        {conditions.map((condition) => (
          <div key={condition.label}>
            <dt className="text-xs font-semibold uppercase text-ink-60">{condition.label}</dt>
            <dd className={cn("mt-1 text-sm leading-6", condition.blocking ? "text-warning" : "text-ink")}>{condition.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function AnalysisSection({ opportunity }: Readonly<{ opportunity: Opportunity }>) {
  return (
    <section className="rounded-md border border-pink-border bg-pink px-4 py-4">
      <div className="flex items-center gap-2">
        <CloudWarning size={18} weight="duotone" className="text-royal" />
        <h3 className="text-sm font-semibold text-ink">Analyse personnalisée</h3>
      </div>
      <div className="mt-3 space-y-2 text-sm leading-6 text-ink-60">
        <p>
          <span className="font-semibold text-ink">Match:</span> {opportunity.score >= 80 ? "Fort" : opportunity.score >= 60 ? "Moyen" : "Faible"}
        </p>
        <p>
          <span className="font-semibold text-ink">Avantages clés:</span> {summarizeTopAdvantages(opportunity)}
        </p>
        <p>
          <span className="font-semibold text-ink">Risque:</span> {opportunity.risks ?? "Aucun risque bloquant identifié"}
        </p>
        <p>
          <span className="font-semibold text-ink">Angle:</span>{" "}
          {opportunity.candidacy_angle ?? "Positionner logiciel, cybersécurité et impact local comme fil conducteur."}
        </p>
      </div>
    </section>
  );
}

function ScoreSection({
  score,
  scoreWidth,
  lines
}: Readonly<{
  score: number;
  scoreWidth: string;
  lines: ReturnType<typeof buildScoreLines>;
}>) {
  return (
    <section aria-labelledby="score-title" className="border-t border-border-subtle pt-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 id="score-title" className="text-sm font-semibold text-ink">
            Score expliqué
          </h3>
          <p className="mt-1 text-xs text-ink-60">Lecture rapide des facteurs qui changent la priorité.</p>
        </div>
        <span className="mono text-xl font-semibold text-royal">{score}/100</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-royal-light">
        <div className="h-full rounded-full bg-royal" style={{ width: scoreWidth }} />
      </div>
      <div className="mt-3 grid gap-2">
        {lines.map((line) => (
          <div key={line.key} className="flex justify-between gap-3 text-sm">
            <span className="text-ink-60">{line.label}</span>
            <span className={line.value > 0 ? "mono font-semibold text-success" : "mono font-semibold text-danger"}>
              {formatScoreLine(line).split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
