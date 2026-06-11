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
import { buttonTap } from "@/lib/motion";
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
import { statusLabel, typeLabel } from "./opportunity-style";

type OpportunityInspectorProps = Readonly<{
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: OpportunityStatus) => void;
}>;

const workflowStatuses: ReadonlyArray<OpportunityStatus> = ["new", "analyzing", "priority", "applying", "applied", "result", "archived"];

export function OpportunityInspector({ opportunity, isOpen, onClose, onStatusChange }: OpportunityInspectorProps) {
  if (opportunity === null) {
    return null;
  }

  const benefits = buildBenefits(opportunity);
  const conditions = buildConditions(opportunity);
  const scoreLines = buildScoreLines(opportunity);
  const scoreWidth = `${Math.min(100, Math.max(0, opportunity.score))}%`;

  return (
    <>
      <button
        type="button"
        aria-label="Fermer le panneau de détail"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out focus:outline-none",
          isOpen ? "cursor-default opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="opportunity-detail-title"
        className={cn(
          "fixed right-0 top-0 z-50 h-screen w-full overflow-y-auto rounded-none border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out sm:w-[400px] sm:rounded-l-2xl",
          isOpen ? "pointer-events-auto translate-x-0" : "pointer-events-none translate-x-full"
        )}
      >
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 pb-4 pt-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-700">{opportunity.organization}</p>
              <h2 id="opportunity-detail-title" className="mt-2 line-clamp-3 text-xl font-bold leading-tight text-slate-900">
                {opportunity.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {formatDeadlineLabel(opportunity)} · {formatDestination(opportunity)}
              </p>
            </div>

            <button
              type="button"
              autoFocus
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-300 ease-in-out hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Fermer"
            >
              <span aria-hidden="true" className="relative block h-4 w-4">
                <span className="absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                <span className="absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
              </span>
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {typeLabel[opportunity.type]}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {formatFundingSummary(opportunity)}
            </span>
          </div>

          <motion.a
            {...buttonTap}
            href={opportunity.official_url}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowSquareOut size={18} />
            Postuler directement
          </motion.a>
        </header>

        <div className="space-y-6 px-5 pb-6 pt-5">
          <AttentionSection opportunity={opportunity} />
          <BenefitsSection benefits={benefits} />
          <DocumentsSection documents={opportunity.required_documents} />
          <ConditionsSection conditions={conditions} />
          <AnalysisSection opportunity={opportunity} />
          <ScoreSection score={opportunity.score} scoreWidth={scoreWidth} lines={scoreLines} />

          <label className="block border-t border-slate-200 pt-4">
            <span className="text-xs font-semibold uppercase text-slate-500">Statut</span>
            <select
              value={opportunity.status}
              onChange={(event) => onStatusChange(event.target.value as OpportunityStatus)}
              className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all duration-300 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 transition-all duration-300 ease-in-out hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Préparer dossier
            </motion.button>
            <button
              type="button"
              onClick={() => onStatusChange("archived")}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-500 transition-all duration-300 ease-in-out hover:bg-slate-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Archive size={17} />
              Archiver
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function AttentionSection({ opportunity }: Readonly<{ opportunity: Opportunity }>) {
  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Lightbulb size={18} weight="duotone" className="text-blue-700" />
        <h3 className="text-sm font-bold text-slate-900">Pourquoi elle mérite votre attention</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">
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
          <Money size={18} weight="duotone" className="text-blue-700" />
          <h3 id="benefits-title" className="text-base font-bold text-slate-900">
            Avantages
          </h3>
        </div>
        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">À vérifier</span>
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <span className="text-sm text-slate-500">{benefit.label}</span>
      <span className={cn("text-right text-sm font-semibold", benefit.confirmed ? "text-blue-700" : "text-slate-500")}>
        {benefit.value}
      </span>
    </div>
  );
}

function DocumentsSection({ documents }: Readonly<{ documents: ReadonlyArray<string> }>) {
  return (
    <section aria-labelledby="documents-title" className="border-t border-slate-200 pt-4">
      <div className="flex items-center gap-2">
        <FileText size={18} weight="duotone" className="text-blue-700" />
        <h3 id="documents-title" className="text-sm font-bold text-slate-900">
          Documents
        </h3>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        {documents.map((document) => (
          <div key={document} className="inline-flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle size={16} className="shrink-0 text-blue-700" />
            <span>{document}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ConditionsSection({ conditions }: Readonly<{ conditions: ReadonlyArray<OpportunityCondition> }>) {
  return (
    <section aria-labelledby="conditions-title" className="border-t border-slate-200 pt-4">
      <div className="flex items-center gap-2">
        <Flag size={18} weight="duotone" className="text-blue-700" />
        <h3 id="conditions-title" className="text-sm font-bold text-slate-900">
          Conditions
        </h3>
      </div>
      <dl className="mt-3 grid gap-y-3">
        {conditions.map((condition) => (
          <div key={condition.label}>
            <dt className="text-xs font-semibold uppercase text-slate-500">{condition.label}</dt>
            <dd className={cn("mt-1 text-sm leading-6", condition.blocking ? "text-amber-700" : "text-slate-700")}>{condition.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function AnalysisSection({ opportunity }: Readonly<{ opportunity: Opportunity }>) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex items-center gap-2">
        <CloudWarning size={18} weight="duotone" className="text-blue-700" />
        <h3 className="text-sm font-bold text-slate-900">Analyse personnalisée</h3>
      </div>
      <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        <p>
          <span className="font-semibold text-slate-900">Match:</span> {opportunity.score >= 80 ? "Fort" : opportunity.score >= 60 ? "Moyen" : "Faible"}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Avantages clés:</span> {summarizeTopAdvantages(opportunity)}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Risque:</span> {opportunity.risks ?? "Aucun risque bloquant identifié"}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Angle:</span>{" "}
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
    <section aria-labelledby="score-title" className="border-t border-slate-200 pt-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 id="score-title" className="text-sm font-bold text-slate-900">
            Score expliqué
          </h3>
          <p className="mt-1 text-xs text-slate-500">Facteurs qui changent la priorité.</p>
        </div>
        <span className="mono text-xl font-semibold text-blue-700">{score}/100</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-50">
        <div className="h-full rounded-full bg-blue-600" style={{ width: scoreWidth }} />
      </div>
      <div className="mt-3 grid gap-2">
        {lines.map((line) => (
          <div key={line.key} className="flex justify-between gap-3 text-sm">
            <span className="text-slate-500">{line.label}</span>
            <span className={line.value > 0 ? "mono font-semibold text-blue-700" : "mono font-semibold text-red-700"}>
              {formatScoreLine(line).split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
