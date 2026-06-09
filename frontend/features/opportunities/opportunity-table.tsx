import { ArrowUpRight, Calendar, MapPin, MoneyWavy } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/cn";
import type { Opportunity } from "@/types/opportunity";
import {
  formatDeadlineLabel,
  formatDestination,
  formatFundingStatus,
  formatOpportunityType,
  summarizeOpportunityBenefits
} from "./opportunity-view-model";
import { scoreBandClassName, scoreBandLabel, statusLabel } from "./opportunity-style";

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
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[56rem]">
        <div className="grid grid-cols-[5rem_minmax(18rem,1.6fr)_minmax(11rem,0.9fr)_minmax(10rem,0.8fr)_8rem] border-b border-line px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-muted">
          <span>Score</span>
          <span>Intitule</span>
          <span>Avantages</span>
          <span>Deadline</span>
          <span>Statut</span>
        </div>

        <div className="divide-y divide-line">
          {opportunities.map((opportunity) => {
            const isSelected = opportunity.id === selectedOpportunityId;

            return (
              <button
                key={opportunity.id}
                type="button"
                onClick={() => onSelectOpportunity(opportunity)}
                className={cn(
                  "grid w-full grid-cols-[5rem_minmax(18rem,1.6fr)_minmax(11rem,0.9fr)_minmax(10rem,0.8fr)_8rem] px-5 py-4 text-left transition duration-200",
                  "hover:bg-[color:var(--color-surface-raised)]/70 active:scale-[0.997]",
                  isSelected && "bg-accent/7"
                )}
              >
                <span className="mono text-lg font-semibold text-foreground">{opportunity.fitScore}</span>

                <span className="min-w-0 pr-4">
                  <span className="block truncate text-sm font-semibold text-foreground">{opportunity.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span>{opportunity.organization}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} />
                      {formatDestination(opportunity)}
                    </span>
                    <span>{formatOpportunityType(opportunity)}</span>
                  </span>
                </span>

                <span className="pr-3">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <MoneyWavy size={15} weight="duotone" className="text-accent-strong" />
                    {formatFundingStatus(opportunity)}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted">
                    {summarizeOpportunityBenefits(opportunity)}
                  </span>
                </span>

                <span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Calendar size={15} weight="duotone" className="text-accent-strong" />
                    {formatDeadlineLabel(opportunity)}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {opportunity.deadline ?? "Date non confirmee"}
                  </span>
                </span>

                <span className="flex flex-col items-start gap-2">
                  <span className={cn("rounded-ui border px-2 py-1 text-xs font-medium", scoreBandClassName[opportunity.scoreBand])}>
                    {scoreBandLabel[opportunity.scoreBand]}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted">
                    {statusLabel[opportunity.status]}
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
