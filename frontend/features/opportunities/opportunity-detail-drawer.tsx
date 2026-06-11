"use client";

import { useEffect, useRef } from "react";

import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/cn";
import type { Opportunity, OpportunityBenefit, OpportunityCondition } from "@/types/opportunity";
import { buildBenefits, buildConditions, summarizeTopAdvantages } from "./opportunity-view-model";
import { typeLabel } from "./opportunity-style";

type OpportunityDetailDrawerProps = Readonly<{
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSaved: (opportunityId: string) => void;
}>;

export function OpportunityDetailDrawer({ opportunity, isOpen, onClose, onToggleSaved }: OpportunityDetailDrawerProps) {
  const drawerRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

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

  if (opportunity === null) {
    return null;
  }

  const benefits = buildBenefits(opportunity);
  const conditions = buildConditions(opportunity);

  return (
    <>
      <button
        type="button"
        aria-label="Fermer le panneau"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-[var(--scrim)] backdrop-blur-[1px] transition-opacity duration-300",
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
          "fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-outline-variant bg-surface-container-lowest shadow-panel transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] sm:w-[600px]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface-container-lowest px-5 py-4 md:px-6 md:py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-on-surface transition-colors hover:bg-surface-container focus:outline-none focus-visible:shadow-focus"
            aria-label="Fermer"
          >
            <MaterialIcon name="close" size={18} />
          </button>

          <span className="inline-flex rounded bg-chip-bg px-2.5 py-0.5 text-label-sm text-secondary">
            {typeLabel[opportunity.type]}
          </span>
          <h2 id="drawer-title" className="mt-3 pr-10 font-display text-headline-md text-primary">
            {opportunity.title}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-body-md text-on-surface-variant">
            <MaterialIcon name="account_balance" size={18} />
            {opportunity.organization}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto bg-surface-container-lowest px-5 py-6 pb-10 md:px-8">
          <div className="grid gap-9">
            <section>
              <SectionTitle icon="rule" title="Conditions d'éligibilité" />
              <ConditionList conditions={conditions} />
            </section>

            <section>
              <SectionTitle icon="card_giftcard" title="Avantages" />
              <BenefitList benefits={benefits} />
            </section>

            <section>
              <SectionTitle icon="description" title="Documents requis" />
              <DocumentList documents={opportunity.required_documents} />
            </section>

            <ProfileAnalysis opportunity={opportunity} />

          </div>
        </div>

        <footer className="sticky bottom-0 border-t border-outline-variant bg-surface-container-lowest p-4 md:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={opportunity.official_url}
              target="_blank"
              rel="noreferrer"
              className="editorial-button-primary flex h-11 items-center justify-center gap-2 px-5 text-label-md"
            >
              <MaterialIcon name="open_in_new" size={18} />
              Postuler via portail
            </a>
            <button
              type="button"
              onClick={() => onToggleSaved(opportunity.id)}
              aria-pressed={opportunity.isSaved === true}
              className="flex h-11 items-center justify-center rounded border border-primary-container px-5 text-label-md text-primary-container transition-colors hover:bg-surface-container-low focus:outline-none focus-visible:shadow-focus"
            >
              <MaterialIcon name={opportunity.isSaved === true ? "bookmark" : "bookmark_border"} size={18} />
              {opportunity.isSaved === true ? "Sauvegardée" : "Sauvegarder"}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}

function SectionTitle({ icon, title }: Readonly<{ icon: string; title: string }>) {
  return (
    <h3 className="flex items-center gap-3 font-display text-headline-md font-semibold text-primary">
      <MaterialIcon name={icon} size={23} />
      {title}
    </h3>
  );
}

function BenefitList({ benefits }: Readonly<{ benefits: ReadonlyArray<OpportunityBenefit> }>) {
  return (
    <div className="mt-5 grid gap-3">
      {benefits.map((benefit) => (
        <div key={benefit.label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-t border-outline-variant pt-3 text-body-md first:border-t-0 first:pt-0">
          <span className="flex items-center gap-3 text-on-surface-variant">
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
    <dl className="mt-6 grid gap-4">
      {conditions.map((condition) => (
        <div key={condition.label} className="grid grid-cols-[14px_minmax(0,1fr)] gap-4 text-body-lg">
          <span className={cn("mt-3 h-1.5 w-1.5 rounded-full", condition.blocking ? "bg-warning" : "bg-secondary")} />
          <div>
            <dt className="text-label-sm uppercase tracking-[0.12em] text-secondary">{condition.label}</dt>
            <dd className={condition.blocking ? "mt-1 text-warning" : "mt-1 text-on-surface"}>{condition.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

function DocumentList({ documents }: Readonly<{ documents: ReadonlyArray<string> }>) {
  return (
    <div className="mt-6 grid gap-4">
      {documents.map((document) => (
        <div key={document} className="grid grid-cols-[14px_minmax(0,1fr)] gap-4 text-body-lg text-on-surface-variant">
          <span className="mt-3 h-1.5 w-1.5 rounded-full bg-secondary" />
          <span>{document}</span>
        </div>
      ))}
    </div>
  );
}

function ProfileAnalysis({ opportunity }: Readonly<{ opportunity: Opportunity }>) {
  return (
    <section className="border-l-2 border-primary-container bg-surface-container-low p-5">
      <p className="text-label-sm uppercase tracking-[0.14em] text-secondary">Analyse personnalisée</p>
      <h3 className="mt-3 font-display text-headline-md text-primary">
        Match {opportunity.score >= 80 ? "fort" : "à consolider"}
      </h3>
      <div className="mt-4 space-y-3 text-body-md text-on-surface-variant">
        <p>{opportunity.summary ?? opportunity.raw_description}</p>
        <p>
          <span className="font-medium text-on-surface">Risques :</span>{" "}
          <span className={opportunity.risks === null ? "text-success" : "text-error"}>
            {opportunity.risks === null ? "aucun bloquant" : "1 point à vérifier"}
          </span>
        </p>
        <p className="italic">{opportunity.risks ?? "Aucun risque bloquant identifié pour cette étape."}</p>
        <p>
          <span className="font-medium text-on-surface">Angle recommandé :</span>{" "}
          {opportunity.candidacy_angle ?? "Mettre en avant logiciel, cybersécurité et impact local."}
        </p>
        <p className="text-label-md font-semibold text-primary">{summarizeTopAdvantages(opportunity)}</p>
      </div>
    </section>
  );
}
