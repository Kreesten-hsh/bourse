import { ArrowUpRight, CalendarBlank, CompassRose, MapPin, MoneyWavy } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/cn";
import type { Opportunity } from "@/types/opportunity";
import {
  formatDeadlineLabel,
  formatDestination,
  formatFundingStatus,
  formatOpportunityType,
  summarizeOpportunityBenefits
} from "./opportunity-view-model";
import { scoreBandClassName, scoreBandLabel, statusClassName, statusLabel } from "./opportunity-style";

type OpportunityTableProps = Readonly<{
  opportunities: ReadonlyArray<Opportunity>;
  selectedOpportunityId: string;
  onSelectOpportunity: (opportunity: Opportunity) => void;
}>;

export function OpportunityTable({
  opportunities,
  selectedOpportunityId,
  onSelectOpportunity
}: OpportunityTableProps) {
  if (opportunities.length === 0) {
    return (
      <div className="px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[rgb(52_71_170_/_0.08)] text-accent">
          <CompassRose size={24} weight="duotone" />
        </div>
        <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em]">Aucune offre ne correspond aux filtres</h3>
        <p className="mx-auto mt-2 max-w-[54ch] text-sm leading-6 text-muted">
          Retire un filtre ou cherche avec un terme plus large. Les offres non confirmees restent visibles avec le filtre
          "A verifier".
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[62rem] p-3">
        <div className="grid grid-cols-[5.5rem_minmax(19rem,1.6fr)_minmax(14rem,1fr)_minmax(11rem,0.8fr)_9rem] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          <span>Fit</span>
          <span>Opportunite</span>
          <span>Avantages</span>
          <span>Deadline</span>
          <span>Workflow</span>
        </div>

        <div className="space-y-2">
          {opportunities.map((opportunity, index) => {
            const isSelected = opportunity.id === selectedOpportunityId;

            return (
              <button
                key={opportunity.id}
                type="button"
                onClick={() => onSelectOpportunity(opportunity)}
                style={{ animationDelay: `${index * 45}ms` }}
                className={cn(
                  "fade-scale grid w-full grid-cols-[5.5rem_minmax(19rem,1.6fr)_minmax(14rem,1fr)_minmax(11rem,0.8fr)_9rem] items-center rounded-[22px] border px-4 py-4 text-left transition duration-200",
                  "hover:-translate-y-0.5 hover:border-accent/35 hover:bg-white/82 hover:shadow-[0_18px_42px_rgb(52_71_170_/_0.12)] active:scale-[0.997]",
                  isSelected
                    ? "border-accent bg-white shadow-[0_18px_52px_rgb(52_71_170_/_0.18)]"
                    : "border-white/70 bg-white/48"
                )}
              >
                <span>
                  <span className="mono block text-2xl font-semibold tracking-[-0.04em] text-accent">{opportunity.fitScore}</span>
                  <span className={cn("mt-2 inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold", scoreBandClassName[opportunity.scoreBand])}>
                    {scoreBandLabel[opportunity.scoreBand]}
                  </span>
                </span>

                <span className="min-w-0 pr-5">
                  <span className="block truncate text-base font-semibold tracking-[-0.02em] text-foreground">
                    {opportunity.title}
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span>{opportunity.organization}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} className="text-accent" />
                      {formatDestination(opportunity)}
                    </span>
                    <span>{formatOpportunityType(opportunity)}</span>
                  </span>
                </span>

                <span className="pr-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <MoneyWavy size={16} weight="duotone" className="text-accent" />
                    {formatFundingStatus(opportunity)}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted">
                    {summarizeOpportunityBenefits(opportunity)}
                  </span>
                </span>

                <span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <CalendarBlank size={16} weight="duotone" className="text-accent" />
                    {formatDeadlineLabel(opportunity)}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {opportunity.deadline ?? "Date non confirmee"}
                  </span>
                </span>

                <span className="flex flex-col items-start gap-2">
                  <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", statusClassName[opportunity.status])}>
                    {statusLabel[opportunity.status]}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                    Ouvrir
                    <ArrowUpRight size={12} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
