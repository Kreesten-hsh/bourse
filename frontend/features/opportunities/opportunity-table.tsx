"use client";

import { ArrowsMerge, CalendarBlank, CloudWarning, CurrencyCircleDollar } from "@phosphor-icons/react";
import { motion } from "motion/react";

import { cn } from "@/lib/cn";
import { rowMotion, scoreBadgeMotion } from "@/lib/motion";
import type { Opportunity } from "@/types/opportunity";
import {
  formatDeadlineLabel,
  formatDestination,
  formatFundingSummary,
  isExpiredOpportunity
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
    <div className="overflow-x-auto">
      <table className="min-w-[1120px] w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-ink-60">
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Titre</th>
            <th className="px-4 py-3">Organisation</th>
            <th className="px-4 py-3">Pays</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Financement</th>
            <th className="px-4 py-3">Deadline</th>
            <th className="px-4 py-3">Statut</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opportunity, index) => {
            const isSelected = opportunity.id === selectedOpportunityId;
            const isExpired = isExpiredOpportunity(opportunity);

            return (
              <motion.tr
                key={opportunity.id}
                {...rowMotion(index)}
                onClick={() => onSelectOpportunity(opportunity)}
                className={cn(
                  "group cursor-pointer border-l-2 border-transparent transition-colors duration-150 hover:bg-surface-3",
                  isSelected && "border-l-royal bg-[var(--royal-alpha10)]",
                  isExpired && "text-ink-30"
                )}
              >
                <td className="border-t border-border-subtle px-4 py-3">
                  <motion.span
                    {...scoreBadgeMotion}
                    className={cn(
                      "mono flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                      scoreBandClassName[getScoreBand(opportunity.score)]
                    )}
                  >
                    {opportunity.score}
                  </motion.span>
                </td>
                <td className="max-w-[330px] border-t border-border-subtle px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-ink">{opportunity.title}</span>
                    {opportunity.is_duplicate ? (
                      <ArrowsMerge
                        size={16}
                        className="shrink-0 text-warning"
                        aria-label="Doublon détecté"
                        title={`Similaire à ${opportunity.duplicate_of_id ?? "une autre source"}`}
                      />
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-ink-60">{opportunity.summary ?? opportunity.source_name}</p>
                </td>
                <td className="border-t border-border-subtle px-4 py-3 text-sm text-ink-60">{opportunity.organization}</td>
                <td className="border-t border-border-subtle px-4 py-3 text-sm text-ink-60">{formatDestination(opportunity)}</td>
                <td className="border-t border-border-subtle px-4 py-3">
                  <span className={cn("rounded-full border px-2 py-1 text-xs font-semibold", typeClassName[opportunity.type])}>
                    {typeLabel[opportunity.type]}
                  </span>
                </td>
                <td className="border-t border-border-subtle px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                    <CurrencyCircleDollar size={17} className="text-royal" />
                    {formatFundingSummary(opportunity)}
                  </span>
                </td>
                <td className="border-t border-border-subtle px-4 py-3">
                  <DeadlineCell opportunity={opportunity} />
                </td>
                <td className="border-t border-border-subtle px-4 py-3">
                  <span className={cn("rounded-full border px-2 py-1 text-xs font-semibold", statusClassName[opportunity.status])}>
                    {isExpired ? "Expirée" : statusLabel[opportunity.status]}
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DeadlineCell({ opportunity }: Readonly<{ opportunity: Opportunity }>) {
  const label = formatDeadlineLabel(opportunity);
  const isUnknown = opportunity.deadline === null || opportunity.deadline_confirmed === false;
  const isUrgent = opportunity.deadline !== null && Date.parse(opportunity.deadline) - Date.now() < 7 * 86_400_000;

  if (isUnknown) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-warning bg-warning-bg px-2 py-1 text-xs font-semibold text-warning">
        <CloudWarning size={14} />
        À vérifier
      </span>
    );
  }

  return (
    <span className={cn("mono inline-flex items-center gap-1.5 text-xs font-semibold", isUrgent ? "text-danger" : "text-ink-60")}>
      <CalendarBlank size={15} />
      {label}
    </span>
  );
}

function OpportunityEmptyState({ onSync }: Readonly<{ onSync: () => void }>) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-xl border border-royal-mid bg-royal-light text-royal">
        <CloudWarning size={28} weight="duotone" />
      </div>
      <p className="mt-4 text-sm font-semibold text-ink">Aucune opportunité pour ces filtres</p>
      <p className="mt-2 max-w-[34rem] text-sm leading-6 text-ink-60">
        Les filtres actifs ont masqué toutes les offres. Lance une sync ou retire un filtre.
      </p>
      <button
        type="button"
        onClick={onSync}
        className="mt-5 rounded-md bg-royal px-4 py-2 text-sm font-semibold text-surface-2 transition-colors hover:bg-royal-hover active:bg-royal-active"
      >
        Lancer une sync
      </button>
    </div>
  );
}
