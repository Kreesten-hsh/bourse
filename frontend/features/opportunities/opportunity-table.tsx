"use client";

import { ArrowRight, ArrowsMerge, CalendarBlank, CloudWarning, CurrencyCircleDollar, MapPin } from "@phosphor-icons/react";
import { motion } from "motion/react";

import { cn } from "@/lib/cn";
import { rowMotion } from "@/lib/motion";
import type { Opportunity, OpportunityStatus, OpportunityType } from "@/types/opportunity";
import {
  formatDeadlineLabel,
  formatDestination,
  formatFundingSummary,
  isExpiredOpportunity,
  summarizeTopAdvantages
} from "./opportunity-view-model";
import { statusLabel, typeLabel } from "./opportunity-style";

type OpportunityTableProps = Readonly<{
  opportunities: ReadonlyArray<Opportunity>;
  selectedOpportunityId: string | null;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onSync: () => void;
}>;

export function OpportunityTable({
  opportunities,
  selectedOpportunityId,
  onSelectOpportunity,
  onSync
}: OpportunityTableProps) {
  if (opportunities.length === 0) {
    return <OpportunityEmptyState onSync={onSync} />;
  }

  return (
    <section aria-label="Liste des opportunités" className="grid gap-3" role="list">
      {opportunities.map((opportunity, index) => {
        const isSelected = opportunity.id === selectedOpportunityId;
        const isExpired = isExpiredOpportunity(opportunity);

        return (
          <motion.article key={opportunity.id} {...rowMotion(index)} role="listitem">
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectOpportunity(opportunity)}
              className={cn(
                "group w-full cursor-pointer rounded-xl border bg-white px-4 py-4 text-left shadow-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 md:px-5",
                "hover:-translate-y-1 hover:border-blue-200 hover:shadow-md",
                isSelected ? "border-blue-300 shadow-md ring-2 ring-blue-500" : "border-slate-200",
                isExpired && "opacity-60"
              )}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem_4.5rem] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2 py-1 text-xs font-medium", typePillClassName[opportunity.type])}>
                      {typeLabel[opportunity.type]}
                    </span>
                    <span className={cn("rounded-full px-2 py-1 text-xs font-medium", statusPillClassName[opportunity.status])}>
                      {statusLabel[opportunity.status]}
                    </span>
                    {opportunity.is_duplicate ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                        <ArrowsMerge size={14} />
                        Doublon
                      </span>
                    ) : null}
                    {isExpired ? <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">Expirée</span> : null}
                  </div>

                  <h2 className="mt-3 line-clamp-2 text-lg font-bold leading-tight text-slate-900 md:text-xl">
                    {opportunity.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{opportunity.organization}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {buildKeySignals(opportunity).map((signal) => (
                      <span key={signal} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2 text-sm text-slate-500">
                  <CardMeta icon={MapPin} value={formatDestination(opportunity)} />
                  <CardMeta icon={CurrencyCircleDollar} value={formatFundingSummary(opportunity)} />
                  <CardMeta icon={CalendarBlank} value={formatDeadlineLabel(opportunity)} urgent={isDeadlineCritical(opportunity)} />
                </div>

                <div className="flex items-center justify-between gap-3 lg:flex-col lg:justify-center">
                  <span className={cn("mono grid h-11 w-11 place-items-center rounded-full text-sm font-semibold", scorePillClassName(opportunity.score))}>
                    {opportunity.score}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100">
                    Lire
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </button>
          </motion.article>
        );
      })}
    </section>
  );
}

type CardMetaProps = Readonly<{
  icon: React.ComponentType<{ size?: number; className?: string; weight?: "regular" | "duotone" }>;
  value: string;
  urgent?: boolean;
}>;

function CardMeta({ icon: Icon, value, urgent = false }: CardMetaProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", urgent ? "font-semibold text-red-700" : "text-slate-500")}>
      <Icon size={17} weight="duotone" className={urgent ? "shrink-0 text-red-700" : "shrink-0 text-blue-600"} />
      <span className="truncate">{value}</span>
    </span>
  );
}

function buildKeySignals(opportunity: Opportunity): ReadonlyArray<string> {
  return [
    opportunity.required_domains.slice(0, 2).join(" / "),
    opportunity.required_level,
    summarizeTopAdvantages(opportunity)
  ].filter((signal) => signal.length > 0);
}

function isDeadlineCritical(opportunity: Opportunity): boolean {
  if (opportunity.deadline === null || opportunity.deadline_confirmed === false) {
    return false;
  }

  return Date.parse(opportunity.deadline) - Date.now() < 14 * 86_400_000;
}

function scorePillClassName(score: number): string {
  if (score >= 80) {
    return "bg-blue-600 text-white";
  }

  if (score >= 60) {
    return "bg-amber-500 text-white";
  }

  return "bg-slate-200 text-slate-700";
}

function OpportunityEmptyState({ onSync }: Readonly<{ onSync: () => void }>) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="grid h-14 w-14 place-items-center rounded-xl bg-blue-50 text-blue-700">
        <CloudWarning size={26} weight="duotone" />
      </div>
      <p className="mt-4 text-sm font-bold text-slate-900">Aucune opportunité pour ces filtres</p>
      <p className="mt-2 max-w-[32rem] text-sm leading-6 text-slate-500">
        Retire un filtre ou lance une synchronisation. Les offres ambiguës restent disponibles avec le filtre à vérifier.
      </p>
      <button
        type="button"
        onClick={onSync}
        className="mt-5 cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Lancer une sync
      </button>
    </div>
  );
}

const typePillClassName: Record<OpportunityType, string> = {
  scholarship: "bg-blue-50 text-blue-700",
  internship: "bg-emerald-50 text-emerald-700",
  job: "bg-amber-50 text-amber-700",
  fellowship: "bg-indigo-50 text-indigo-700",
  training: "bg-slate-100 text-slate-700",
  volunteer: "bg-sky-50 text-sky-700"
};

const statusPillClassName: Record<OpportunityStatus, string> = {
  new: "bg-slate-100 text-slate-700",
  analyzing: "bg-blue-50 text-blue-700",
  priority: "bg-emerald-50 text-emerald-700",
  applying: "bg-amber-50 text-amber-700",
  applied: "bg-indigo-50 text-indigo-700",
  result: "bg-slate-100 text-slate-700",
  archived: "bg-red-50 text-red-700"
};
