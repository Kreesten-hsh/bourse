"use client";

import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/cn";
import type { Opportunity } from "@/types/opportunity";
import {
  formatDeadlineLabel,
  formatDestination,
  formatFundingSummary,
  getDaysUntilDeadline,
  isExpiredOpportunity
} from "./opportunity-view-model";

type OpportunityCardProps = Readonly<{
  opportunity: Opportunity;
  isFeatured: boolean;
  isSelected: boolean;
  className?: string;
  onOpen: (opportunity: Opportunity) => void;
  onToggleSaved: (opportunityId: string) => void;
}>;

type BadgeTone = "featured" | "urgent" | "closing" | "priority" | "default" | "expired";

export function OpportunityCard({
  opportunity,
  isFeatured,
  isSelected,
  className,
  onOpen,
  onToggleSaved
}: OpportunityCardProps) {
  const badge = buildCardBadge(opportunity, isFeatured);
  const expired = isExpiredOpportunity(opportunity);

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onOpen(opportunity);
  }

  return (
    <article
      aria-label={`Ouvrir ${opportunity.title}`}
      className={cn(
        "editorial-card group flex min-h-[260px] cursor-pointer flex-col justify-between p-5 md:p-6",
        isFeatured && "md:min-h-[274px] md:p-8",
        isSelected && "editorial-card-selected",
        expired && "opacity-60 hover:translate-y-0 hover:shadow-card",
        className
      )}
      onClick={() => onOpen(opportunity)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={badge.label} tone={badge.tone} />
            <span className="mono rounded-full bg-surface-container px-3 py-1 text-label-sm text-primary">
              {opportunity.score}/100
            </span>
          </div>
          <button
            type="button"
            aria-label={opportunity.isSaved ? "Retirer des sauvegardées" : "Sauvegarder"}
            onClick={(event) => {
              event.stopPropagation();
              onToggleSaved(opportunity.id);
            }}
            className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary focus:outline-none focus-visible:shadow-focus"
          >
            <MaterialIcon name={opportunity.isSaved ? "bookmark" : "bookmark_border"} size={22} />
          </button>
        </div>

        <div>
          <h2 className={cn("line-clamp-2 font-display text-headline-md text-primary", isFeatured && "md:text-headline-lg")}>
            {opportunity.title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-body-md text-on-surface-variant">
            <span className="inline-flex items-center gap-2">
              <MaterialIcon name="account_balance" size={16} />
              {opportunity.organization}
            </span>
            <span className="inline-flex items-center gap-2">
              <MaterialIcon name="travel_explore" size={16} />
              {formatDestination(opportunity)}
            </span>
          </div>
          <p className="mt-4 line-clamp-2 text-body-md text-on-surface-variant">
            {opportunity.summary ?? opportunity.raw_description}
          </p>
        </div>
      </div>

      <footer className="mt-8 border-t border-outline-variant pt-4">
        <div className="grid gap-2 text-label-sm text-secondary sm:grid-cols-2">
          <span className={cn("inline-flex items-center gap-2", deadlineTextClassName(opportunity))}>
            <MaterialIcon name="event" size={14} />
            {formatDeadlineLabel(opportunity)}
          </span>
          <span className="inline-flex items-center gap-2">
            <MaterialIcon name="payments" size={14} />
            {formatFundingSummary(opportunity)}
          </span>
        </div>
        <span className="mt-5 inline-flex items-center gap-1 text-label-md font-semibold text-primary transition-transform group-hover:translate-x-1">
          Voir les détails
          <MaterialIcon name="arrow_forward" size={16} />
        </span>
      </footer>
    </article>
  );
}

export function deadlineTextClassName(opportunity: Opportunity): string {
  const remainingDays = getDaysUntilDeadline(opportunity);

  if (remainingDays === null || remainingDays >= 14) {
    return "text-secondary";
  }

  if (remainingDays < 7) {
    return "text-error";
  }

  return "text-warning";
}

function buildCardBadge(opportunity: Opportunity, isFeatured: boolean): Readonly<{ label: string; tone: BadgeTone }> {
  if (isFeatured) {
    return { label: "À la une", tone: "featured" };
  }

  if (isExpiredOpportunity(opportunity)) {
    return { label: "Expirée", tone: "expired" };
  }

  const remainingDays = getDaysUntilDeadline(opportunity);

  if (remainingDays !== null && remainingDays < 7) {
    return { label: "Urgent", tone: "urgent" };
  }

  if (remainingDays !== null && remainingDays < 14) {
    return { label: "Clôture proche", tone: "closing" };
  }

  if (opportunity.score >= 80) {
    return { label: "Prioritaire", tone: "priority" };
  }

  return { label: "Nouveau", tone: "default" };
}

function StatusBadge({ label, tone }: Readonly<{ label: string; tone: BadgeTone }>) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm", badgeClassName[tone])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClassName[tone])} />
      {label}
    </span>
  );
}

const badgeClassName: Record<BadgeTone, string> = {
  featured: "bg-primary-container text-on-primary",
  urgent: "bg-error-container text-error",
  closing: "bg-warning-container text-warning",
  priority: "bg-success-container text-success",
  default: "bg-chip-bg text-on-surface-variant",
  expired: "bg-surface-container-highest text-secondary"
};

const dotClassName: Record<BadgeTone, string> = {
  featured: "bg-white",
  urgent: "bg-error",
  closing: "bg-warning",
  priority: "bg-success",
  default: "bg-outline-variant",
  expired: "bg-secondary"
};
