"use client";

import { useEffect, useRef, useState } from "react";

import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/cn";
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
import { deadlineTextClassName } from "./opportunity-card";
import { statusLabel, typeLabel } from "./opportunity-style";

type OpportunityDetailDrawerProps = Readonly<{
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (opportunityId: string, status: OpportunityStatus) => void;
}>;

const workflowStatuses: ReadonlyArray<OpportunityStatus> = ["new", "analyzing", "priority", "applying", "applied", "result", "archived"];

export function OpportunityDetailDrawer({ opportunity, isOpen, onClose, onStatusChange }: OpportunityDetailDrawerProps) {
  const drawerRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [scoreOpen, setScoreOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    drawerRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setScoreOpen(false);
  }, [opportunity?.id]);

  if (opportunity === null) {
    return null;
  }

  const benefits = buildBenefits(opportunity);
  const conditions = buildConditions(opportunity);
  const scoreLines = buildScoreLines(opportunity);

  return (
    <>
      <button
        type="button"
        aria-label="Fermer le panneau"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-[var(--scrim)] transition-opacity duration-300",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-outline-variant bg-surface-container-lowest shadow-panel transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] sm:w-[440px]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface-container-lowest p-6 shadow-card">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container focus:outline-none focus-visible:shadow-focus"
            aria-label="Fermer"
          >
            <MaterialIcon name="close" size={22} />
          </button>

          <span className="inline-flex rounded-full bg-chip-bg px-3 py-1 text-label-sm text-on-surface-variant">
            {typeLabel[opportunity.type]}
          </span>
          <h2 id="drawer-title" className="mt-4 pr-10 font-display text-headline-md text-primary">
            {opportunity.title}
          </h2>
          <p className="mt-3 flex items-center gap-2 text-body-md text-on-surface-variant">
            <MaterialIcon name="account_balance" size={18} />
            {opportunity.organization}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1 text-label-sm">
            <MaterialIcon name="event" size={16} />
            <span className={deadlineTextClassName(opportunity)}>{formatDeadlineLabel(opportunity)}</span>
          </div>
          <a
            href={opportunity.official_url}
            target="_blank"
            rel="noreferrer"
            className="editorial-button-primary mt-5 flex h-11 w-fit items-center gap-2 px-5 text-label-md"
          >
            <MaterialIcon name="open_in_new" size={18} />
            Postuler directement
          </a>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto bg-surface-container-low p-6">
          <WhySection opportunity={opportunity} />

          <SectionTitle icon="card_giftcard" title="Avantages" />
          <BenefitList benefits={benefits} />

          <SectionTitle icon="description" title="Documents" />
          <DocumentList documents={opportunity.required_documents} />

          <SectionTitle icon="rule" title="Conditions" />
          <ConditionList conditions={conditions} />

          <ProfileAnalysis opportunity={opportunity} />

          <section className="border-t border-outline-variant pt-4">
            <button
              type="button"
              onClick={() => setScoreOpen((current) => !current)}
              className="flex w-full items-center justify-between text-left focus:outline-none focus-visible:shadow-focus"
              aria-expanded={scoreOpen}
            >
              <span className="text-label-md font-semibold text-primary">Score : {opportunity.score}/100</span>
              <MaterialIcon name="expand_more" className={scoreOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
            {scoreOpen ? (
              <div className="mt-4 grid gap-2">
                {scoreLines.map((line) => (
                  <div key={line.key} className="flex justify-between gap-4 text-label-md">
                    <span className="text-on-surface-variant">{line.label}</span>
                    <span className={line.value > 0 ? "mono text-success" : "mono text-error"}>{formatScoreLine(line).split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>

        <footer className="sticky bottom-0 border-t border-outline-variant bg-surface-container-lowest p-6 shadow-card">
          <label className="block">
            <span className="text-label-sm uppercase text-secondary">Statut</span>
            <select
              value={opportunity.status}
              onChange={(event) => onStatusChange(opportunity.id, event.target.value as OpportunityStatus)}
              className="mt-2 h-11 w-full rounded border border-outline-variant bg-white px-3 text-label-md text-on-surface focus:border-primary focus:outline-none"
            >
              {workflowStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabel[status]}
                </option>
              ))}
            </select>
          </label>

          <a
            href={opportunity.official_url}
            target="_blank"
            rel="noreferrer"
            className="editorial-button-primary mt-4 flex h-12 w-full items-center justify-center gap-2 px-6 text-label-md"
          >
            <MaterialIcon name="open_in_new" size={18} />
            Postuler directement
          </a>
          <button
            type="button"
            onClick={() => onStatusChange(opportunity.id, "applying")}
            className="mt-3 flex h-12 w-full items-center justify-center rounded border border-primary-container px-6 text-label-md text-primary-container transition-colors hover:bg-surface-container-low focus:outline-none focus-visible:shadow-focus"
          >
            Préparer le dossier
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(opportunity.id, "archived")}
            className="mt-3 w-full text-center text-label-md text-on-surface-variant transition-colors hover:text-error focus:outline-none focus-visible:shadow-focus"
          >
            Archiver
          </button>
        </footer>
      </aside>
    </>
  );
}

function SectionTitle({ icon, title }: Readonly<{ icon: string; title: string }>) {
  return (
    <h3 className="flex items-center gap-2 text-label-sm uppercase text-secondary">
      <MaterialIcon name={icon} size={18} />
      {title}
    </h3>
  );
}

function WhySection({ opportunity }: Readonly<{ opportunity: Opportunity }>) {
  return (
    <section className="rounded border border-border-card bg-surface-container-lowest p-4 shadow-card">
      <h3 className="text-label-sm uppercase text-secondary">Pourquoi elle mérite ton attention</h3>
      <p className="mt-3 text-body-md text-on-surface-variant">{opportunity.summary ?? opportunity.raw_description}</p>
      <p className="mt-3 text-label-md text-primary">{formatDestination(opportunity)} · {formatFundingSummary(opportunity)}</p>
    </section>
  );
}

function BenefitList({ benefits }: Readonly<{ benefits: ReadonlyArray<OpportunityBenefit> }>) {
  return (
    <div className="-mt-5 grid gap-3">
      {benefits.map((benefit) => (
        <div key={benefit.label} className="flex items-center justify-between gap-4 text-body-md">
          <span className="flex items-center gap-2 text-on-surface-variant">
            <MaterialIcon name={benefit.confirmed ? "check_circle" : "cancel"} className={benefit.confirmed ? "text-success" : "text-secondary"} />
            {benefit.label}
          </span>
          <span className="mono text-right text-on-surface">{benefit.value}</span>
        </div>
      ))}
    </div>
  );
}

function ConditionList({ conditions }: Readonly<{ conditions: ReadonlyArray<OpportunityCondition> }>) {
  return (
    <dl className="-mt-5 grid gap-3">
      {conditions.map((condition) => (
        <div key={condition.label} className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 text-body-md">
          <dt className="text-secondary">{condition.label}</dt>
          <dd className={condition.blocking ? "text-warning" : "text-on-surface"}>{condition.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DocumentList({ documents }: Readonly<{ documents: ReadonlyArray<string> }>) {
  return (
    <div className="-mt-5 grid gap-3">
      {documents.map((document) => (
        <div key={document} className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <MaterialIcon name="radio_button_unchecked" size={18} />
          {document}
        </div>
      ))}
    </div>
  );
}

function ProfileAnalysis({ opportunity }: Readonly<{ opportunity: Opportunity }>) {
  return (
    <section className="rounded border border-border-card bg-surface-container-lowest p-4 shadow-card">
      <h3 className="text-label-sm uppercase text-secondary">Analyse profil</h3>
      <div className="mt-3 space-y-2 text-body-md text-on-surface-variant">
        <p>
          <span className="font-medium text-on-surface">Match profil :</span>{" "}
          <span className={opportunity.score >= 80 ? "text-success" : "text-warning"}>
            {opportunity.score >= 80 ? "Fort" : "À consolider"}
          </span>
        </p>
        <p>
          <span className="font-medium text-on-surface">Risques :</span>{" "}
          <span className={opportunity.risks === null ? "text-success" : "text-error"}>{opportunity.risks === null ? "Aucun bloquant" : "1 point à vérifier"}</span>
        </p>
        <p className="italic">{opportunity.risks ?? "Aucun risque bloquant identifié pour cette étape."}</p>
        <p>
          <span className="font-medium text-on-surface">Angle recommandé :</span>{" "}
          {opportunity.candidacy_angle ?? "Mettre en avant logiciel, cybersécurité et impact local."}
        </p>
        <p className="text-label-md text-primary">{summarizeTopAdvantages(opportunity)}</p>
      </div>
    </section>
  );
}
