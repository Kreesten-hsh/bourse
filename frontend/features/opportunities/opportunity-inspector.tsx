import {
  ArrowSquareOut,
  CheckCircle,
  CloudWarning,
  FileText,
  Flag,
  Lightbulb,
  MoneyWavy
} from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/cn";
import type { Opportunity } from "@/types/opportunity";
import { formatDeadlineLabel, formatDestination, formatFundingStatus } from "./opportunity-view-model";
import {
  documentStatusClassName,
  documentStatusLabel,
  scoreBandClassName,
  scoreBandLabel,
  statusLabel
} from "./opportunity-style";

type OpportunityInspectorProps = Readonly<{
  opportunity: Opportunity;
}>;

export function OpportunityInspector({ opportunity }: OpportunityInspectorProps) {
  return (
    <aside className="fade-up-delay-2 rounded-ui border border-line/80 bg-[color:var(--color-surface)]/82 p-5 shadow-sm backdrop-blur xl:sticky xl:top-4 xl:max-h-[calc(100dvh-2rem)] xl:overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mono text-xs uppercase tracking-[0.18em] text-muted">Fiche offre</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">{opportunity.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{opportunity.organization}</p>
        </div>
        <span className={cn("rounded-ui border px-2.5 py-1 text-xs font-medium", scoreBandClassName[opportunity.scoreBand])}>
          {opportunity.fitScore}
        </span>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <InfoLine label="Destination" value={formatDestination(opportunity)} />
        <InfoLine label="Deadline" value={formatDeadlineLabel(opportunity)} />
        <InfoLine label="Financement" value={formatFundingStatus(opportunity)} />
        <InfoLine label="Statut" value={statusLabel[opportunity.status]} />
      </div>

      <a
        href={opportunity.officialApplicationUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-ui bg-accent px-4 text-sm font-medium text-white transition duration-200 hover:bg-accent-strong active:scale-[0.98]"
      >
        <ArrowSquareOut size={18} weight="duotone" />
        Postuler directement
      </a>

      <div className="mt-7 space-y-7">
        <InspectorSection icon={MoneyWavy} title="Avantages">
          <div className="space-y-3">
            {opportunity.benefits.map((benefit) => (
              <div key={`${benefit.label}-${benefit.value}`} className="flex gap-3 border-t border-line pt-3">
                <CheckCircle
                  size={17}
                  weight="duotone"
                  className={benefit.confirmed ? "mt-0.5 shrink-0 text-success" : "mt-0.5 shrink-0 text-warning"}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{benefit.label}</p>
                  <p className="mt-1 text-sm leading-5 text-muted">{benefit.value}</p>
                </div>
              </div>
            ))}
          </div>
        </InspectorSection>

        <InspectorSection icon={Flag} title="Conditions">
          <div className="space-y-3">
            {opportunity.eligibility.map((condition) => (
              <div key={`${condition.label}-${condition.value}`} className="border-t border-line pt-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{condition.label}</p>
                  <span className={condition.blocking ? "text-xs font-medium text-warning" : "text-xs font-medium text-success"}>
                    {condition.blocking ? "A verifier" : "Compatible"}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-5 text-muted">{condition.value}</p>
              </div>
            ))}
          </div>
        </InspectorSection>

        <InspectorSection icon={FileText} title="Documents">
          <div className="grid gap-2">
            {opportunity.documents.map((document) => (
              <div key={document.label} className="flex items-center justify-between gap-3 rounded-ui border border-line px-3 py-2">
                <span className="text-sm text-foreground">{document.label}</span>
                <span className={cn("mono text-xs font-medium", documentStatusClassName[document.status])}>
                  {documentStatusLabel[document.status]}
                </span>
              </div>
            ))}
          </div>
        </InspectorSection>

        <InspectorSection icon={CloudWarning} title="Risques bloquants">
          <ul className="space-y-2">
            {opportunity.blockingRisks.map((risk) => (
              <li key={risk} className="text-sm leading-6 text-muted">
                {risk}
              </li>
            ))}
          </ul>
        </InspectorSection>

        <InspectorSection icon={Lightbulb} title="Angle de candidature">
          <p className="text-sm leading-6 text-muted">{opportunity.applicationAngle}</p>
        </InspectorSection>

        <div className="rounded-ui border border-line bg-[color:var(--color-background)] p-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{scoreBandLabel[opportunity.scoreBand]}</p>
          <ul className="mt-3 space-y-2">
            {opportunity.scoreExplanation.map((reason) => (
              <li key={reason} className="text-sm leading-5 text-foreground">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

type InfoLineProps = Readonly<{
  label: string;
  value: string;
}>;

function InfoLine({ label, value }: InfoLineProps) {
  return (
    <div className="rounded-ui border border-line bg-[color:var(--color-background)] px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

type InspectorSectionProps = Readonly<{
  icon: React.ComponentType<{ size?: number; weight?: "regular" | "duotone"; className?: string }>;
  title: string;
  children: React.ReactNode;
}>;

function InspectorSection({ icon: Icon, title, children }: InspectorSectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} weight="duotone" className="text-accent-strong" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}
