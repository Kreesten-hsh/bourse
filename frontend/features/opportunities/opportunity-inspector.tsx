"use client";

import { Archive, ArrowSquareOut, CheckCircle, CloudWarning, FileText, Flag, Lightbulb, Money } from "@phosphor-icons/react";
import { motion } from "motion/react";

import { cn } from "@/lib/cn";
import { buttonTap, panelMotion } from "@/lib/motion";
import type { Opportunity, OpportunityStatus } from "@/types/opportunity";
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

  return (
    <motion.aside
      {...panelMotion}
      className="panel w-full overflow-hidden xl:sticky xl:top-5 xl:max-h-[calc(100dvh-40px)] xl:w-[420px] xl:overflow-y-auto"
    >
      <header className="border-b border-border bg-royal px-5 py-5 text-surface-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-royal-pale">{opportunity.organization}</p>
            <h2 className="mt-2 text-xl font-semibold leading-tight">{opportunity.title}</h2>
            <p className="mt-2 text-sm text-royal-pale">{formatDeadlineLabel(opportunity)} · {formatDestination(opportunity)}</p>
          </div>
          <span className="mono grid h-12 w-12 shrink-0 place-items-center rounded-md bg-surface-2 text-lg font-semibold text-royal">
            {opportunity.score}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", typeClassName[opportunity.type])}>
            {typeLabel[opportunity.type]}
          </span>
          <span className="rounded-full border border-royal-pale bg-surface-2 px-2.5 py-1 text-xs font-semibold text-royal">
            {formatFundingSummary(opportunity)}
          </span>
        </div>
      </header>

      <div className="space-y-5 p-5">
        <InspectorSection icon={Money} title="Avantages">
          <div className="grid gap-2">
            {benefits.map((benefit) => (
              <div key={benefit.label} className="flex items-center justify-between gap-3 border-b border-border-subtle py-2">
                <span className="text-sm text-ink-60">{benefit.label}</span>
                <span className={cn("text-right text-sm font-semibold", benefit.confirmed ? "text-success" : "text-ink-60")}>
                  {benefit.value}
                </span>
              </div>
            ))}
          </div>
        </InspectorSection>

        <InspectorSection icon={Flag} title="Conditions">
          <div className="grid gap-2">
            {conditions.map((condition) => (
              <div key={condition.label} className="rounded-md border border-border bg-surface-3 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-60">{condition.label}</span>
                  <span className={condition.blocking ? "text-xs font-semibold text-warning" : "text-xs font-semibold text-success"}>
                    {condition.blocking ? "À vérifier" : "OK"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink">{condition.value}</p>
              </div>
            ))}
          </div>
        </InspectorSection>

        <InspectorSection icon={FileText} title="Documents requis">
          <div className="grid gap-2">
            {opportunity.required_documents.map((document) => (
              <div key={document} className="flex items-center gap-2 text-sm text-ink">
                <CheckCircle size={16} className="text-royal" />
                {document}
              </div>
            ))}
          </div>
        </InspectorSection>

        <InspectorSection icon={CloudWarning} title="Analyse profil">
          <div className="space-y-2 text-sm leading-6 text-ink-60">
            <p>
              <span className="font-semibold text-ink">Match :</span> {opportunity.score >= 80 ? "Fort" : opportunity.score >= 60 ? "Moyen" : "Faible"}
            </p>
            <p>
              <span className="font-semibold text-ink">Avantages clés :</span> {summarizeTopAdvantages(opportunity)}
            </p>
            <p>
              <span className="font-semibold text-ink">Risque :</span> {opportunity.risks ?? "Aucun risque bloquant identifié"}
            </p>
          </div>
        </InspectorSection>

        <InspectorSection icon={Lightbulb} title="Angle recommandé">
          <p className="rounded-md border border-border bg-surface-3 p-3 text-sm leading-6 text-ink-60">
            {opportunity.candidacy_angle ?? "Préparer un angle centré sur logiciel, cybersécurité et impact local."}
          </p>
        </InspectorSection>

        <InspectorSection icon={CheckCircle} title={`Score : ${opportunity.score}/100`}>
          <div className="grid gap-2">
            {scoreLines.map((line) => (
              <div key={line.key} className="flex justify-between gap-3 text-sm">
                <span className="text-ink-60">{line.label}</span>
                <span className={line.value > 0 ? "mono font-semibold text-success" : "mono font-semibold text-danger"}>
                  {formatScoreLine(line).split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </InspectorSection>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-60">Statut</span>
          <select
            value={opportunity.status}
            onChange={(event) => onStatusChange(event.target.value as OpportunityStatus)}
            className="mt-2 h-10 w-full rounded-md border border-border bg-surface-2 px-3 text-sm text-ink outline-none focus:border-royal focus:shadow-focus"
          >
            {workflowStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel[status]}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-2">
          <motion.a
            {...buttonTap}
            href={opportunity.official_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-royal px-4 text-sm font-semibold text-surface-2 transition-colors hover:bg-royal-hover"
          >
            <ArrowSquareOut size={18} />
            Postuler directement
          </motion.a>
          <motion.button
            {...buttonTap}
            type="button"
            onClick={() => onStatusChange("applying")}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-royal px-4 text-sm font-semibold text-royal transition-colors hover:bg-royal-light"
          >
            Préparer dossier
          </motion.button>
          <button
            type="button"
            onClick={() => onStatusChange("archived")}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold text-ink-60 transition-colors hover:bg-surface-3 hover:text-danger"
          >
            <Archive size={17} />
            Archiver
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

type InspectorSectionProps = Readonly<{
  icon: React.ComponentType<{ size?: number; className?: string; weight?: "regular" | "duotone" | "fill" }>;
  title: string;
  children: React.ReactNode;
}>;

function InspectorSection({ icon: Icon, title, children }: InspectorSectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} weight="duotone" className="text-royal" />
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </section>
  );
}
