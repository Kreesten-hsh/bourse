"use client";

import { ArrowRight, ArrowsMerge, CalendarBlank, CloudWarning, CurrencyCircleDollar, MapPin } from "@phosphor-icons/react";
import { motion } from "motion/react";

import { cn } from "@/lib/cn";
import { rowMotion, scoreBadgeMotion } from "@/lib/motion";
import type { Opportunity } from "@/types/opportunity";
import {
  formatDeadlineLabel,
  formatDestination,
  formatFundingSummary,
  isExpiredOpportunity,
  summarizeTopAdvantages
} from "./opportunity-view-model";
import { getScoreBand, scoreBandClassName, statusClassName, statusLabel, typeClassName, typeLabel } from "./opportunity-style";

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
                "fine-focus group w-full rounded-lg border bg-surface-2 px-4 py-4 text-left transition duration-150 md:px-5",
                "hover:-translate-y-0.5 hover:border-royal-mid hover:shadow-md active:translate-y-0",
                isSelected ? "border-royal bg-surface-2 shadow-lg" : "border-border-subtle",
                isExpired && "opacity-60"
              )}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem_4.5rem] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-md border px-2 py-1 text-[11px] font-semibold", typeClassName[opportunity.type])}>
                      {typeLabel[opportunity.type]}
                    </span>
                    <span className={cn("rounded-md border px-2 py-1 text-[11px] font-semibold", statusClassName[opportunity.status])}>
                      {statusLabel[opportunity.status]}
                    </span>
                    {opportunity.is_duplicate ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning">
                        <ArrowsMerge size={14} />
                        Doublon
                      </span>
                    ) : null}
                    {isExpired ? <span className="text-[11px] font-semibold text-danger">Expirée</span> : null}
                  </div>

                  <h2 className="mt-3 text-lg font-semibold leading-tight text-ink md:text-xl">
                    {opportunity.title}
                  </h2>
                  <p className="mt-1 text-sm text-ink-60">{opportunity.organization}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {buildKeySignals(opportunity).map((signal) => (
                      <span key={signal} className="rounded-md bg-surface-3 px-2.5 py-1 text-xs font-medium text-ink-60">
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2 text-sm text-ink-60">
                  <CardMeta icon={MapPin} value={formatDestination(opportunity)} />
                  <CardMeta icon={CurrencyCircleDollar} value={formatFundingSummary(opportunity)} />
                  <CardMeta icon={CalendarBlank} value={formatDeadlineLabel(opportunity)} urgent={isDeadlineCritical(opportunity)} />
                </div>

                <div className="flex items-center justify-between gap-3 lg:flex-col lg:justify-center">
                  <motion.span
                    {...scoreBadgeMotion}
                    className={cn(
                      "mono grid h-11 w-11 place-items-center rounded-full text-sm font-semibold",
                      scoreBandClassName[getScoreBand(opportunity.score)]
                    )}
                  >
                    {opportunity.score}
                  </motion.span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-royal opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
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
    <span className={cn("inline-flex min-w-0 items-center gap-2", urgent ? "font-semibold text-danger" : "text-ink-60")}>
      <Icon size={17} weight="duotone" className={urgent ? "shrink-0 text-danger" : "shrink-0 text-royal"} />
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

function OpportunityEmptyState({ onSync }: Readonly<{ onSync: () => void }>) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg bg-surface-2 px-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-lg bg-royal-light text-royal">
        <CloudWarning size={26} weight="duotone" />
      </div>
      <p className="mt-4 text-sm font-semibold text-ink">Aucune opportunité pour ces filtres</p>
      <p className="mt-2 max-w-[32rem] text-sm leading-6 text-ink-60">
        Retire un filtre ou lance une synchronisation. Les offres ambiguës restent disponibles avec le filtre à vérifier.
      </p>
      <button
        type="button"
        onClick={onSync}
        className="fine-focus mt-5 rounded-md bg-royal px-4 py-2 text-sm font-semibold text-surface-2 transition hover:bg-royal-hover active:scale-[0.98]"
      >
        Lancer une sync
      </button>
    </div>
  );
}
