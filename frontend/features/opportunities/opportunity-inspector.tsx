import {
  ArrowSquareOut,
  CheckCircle,
  CloudWarning,
  FileText,
  Flag,
  Lightbulb,
  MoneyWavy,
  Path
} from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/cn";
import type { ApplicationStatus, Opportunity } from "@/types/opportunity";
import { formatDeadlineLabel, formatDestination, formatFundingStatus } from "./opportunity-view-model";
import {
  documentStatusClassName,
  documentStatusLabel,
  scoreBandClassName,
  scoreBandLabel,
  statusClassName,
  statusLabel
} from "./opportunity-style";

type OpportunityInspectorProps = Readonly<{
  opportunity: Opportunity;
  onStatusChange: (status: ApplicationStatus) => void;
}>;

const workflowStatuses: ReadonlyArray<ApplicationStatus> = [
  "new",
  "to_analyze",
  "priority",
  "preparing",
  "applied",
  "result",
  "archived"
];

export function OpportunityInspector({ opportunity, onStatusChange }: OpportunityInspectorProps) {
  return (
    <aside className="fade-up-delay-2 overflow-hidden rounded-[28px] border border-white/70 royal-surface backdrop-blur xl:sticky xl:top-5 xl:max-h-[calc(100dvh-2.5rem)] xl:overflow-y-auto">
      <div className="royal-command p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mono text-xs uppercase tracking-[0.18em] text-white/62">Fiche decision</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.04em]">{opportunity.title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/68">{opportunity.organization}</p>
          </div>
          <span className="mono rounded-[16px] bg-white px-3 py-2 text-2xl font-semibold tracking-[-0.05em] text-accent-strong">
            {opportunity.fitScore}
          </span>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <HeroLine label="Destination" value={formatDestination(opportunity)} />
          <HeroLine label="Deadline" value={formatDeadlineLabel(opportunity)} />
          <HeroLine label="Financement" value={formatFundingStatus(opportunity)} />
          <HeroLine label="Niveau" value={opportunity.level} />
        </div>
      </div>

      <div className="p-5">
        <a
          href={opportunity.officialApplicationUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-accent px-4 text-sm font-semibold text-white shadow-[0_18px_44px_rgb(52_71_170_/_0.24)] transition duration-200 hover:bg-accent-strong active:scale-[0.98]"
        >
          <ArrowSquareOut size={18} weight="duotone" />
          Postuler directement
        </a>

        <section className="mt-5 rounded-[22px] border border-line bg-white/58 p-3">
          <div className="mb-3 flex items-center gap-2">
            <Path size={18} weight="duotone" className="text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Workflow</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {workflowStatuses.map((status) => {
              const isActive = opportunity.status === status;

              return (
                <button
                  key={status}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onStatusChange(status)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition duration-200 active:scale-[0.98]",
                    isActive ? statusClassName[status] : "border-line bg-white/50 text-muted hover:border-accent/35 hover:text-foreground"
                  )}
                >
                  {statusLabel[status]}
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-7 space-y-7">
          <InspectorSection icon={MoneyWavy} title="Avantages financiers et pratiques">
            <div className="grid gap-3">
              {opportunity.benefits.map((benefit) => (
                <div
                  key={`${benefit.label}-${benefit.value}`}
                  className="rounded-[18px] border border-line bg-white/60 p-3 transition duration-200 hover:border-accent/30 hover:bg-white/82"
                >
                  <div className="flex gap-3">
                    <CheckCircle
                      size={18}
                      weight="duotone"
                      className={benefit.confirmed ? "mt-0.5 shrink-0 text-success" : "mt-0.5 shrink-0 text-warning"}
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{benefit.label}</p>
                      <p className="mt-1 text-sm leading-5 text-muted">{benefit.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </InspectorSection>

          <InspectorSection icon={Flag} title="Conditions d'eligibilite">
            <div className="space-y-3">
              {opportunity.eligibility.map((condition) => (
                <div key={`${condition.label}-${condition.value}`} className="border-t border-line pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{condition.label}</p>
                    <span className={condition.blocking ? "text-xs font-semibold text-warning" : "text-xs font-semibold text-success"}>
                      {condition.blocking ? "A verifier" : "Compatible"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-muted">{condition.value}</p>
                </div>
              ))}
            </div>
          </InspectorSection>

          <InspectorSection icon={FileText} title="Documents requis">
            <div className="grid gap-2">
              {opportunity.documents.map((document) => (
                <div key={document.label} className="flex items-center justify-between gap-3 rounded-[16px] border border-line bg-white/54 px-3 py-2">
                  <span className="text-sm text-foreground">{document.label}</span>
                  <span className={cn("mono text-xs font-semibold", documentStatusClassName[document.status])}>
                    {documentStatusLabel[document.status]}
                  </span>
                </div>
              ))}
            </div>
          </InspectorSection>

          <InspectorSection icon={CloudWarning} title="Risques bloquants">
            <ul className="space-y-2">
              {opportunity.blockingRisks.map((risk) => (
                <li key={risk} className="rounded-[16px] bg-[rgb(184_68_85_/_0.07)] px-3 py-2 text-sm leading-6 text-muted">
                  {risk}
                </li>
              ))}
            </ul>
          </InspectorSection>

          <InspectorSection icon={Lightbulb} title="Angle de candidature">
            <p className="rounded-[18px] border border-line bg-white/58 p-3 text-sm leading-6 text-muted">
              {opportunity.applicationAngle}
            </p>
          </InspectorSection>

          <div className="rounded-[22px] border border-line bg-white/62 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">Pourquoi ce score</p>
              <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", scoreBandClassName[opportunity.scoreBand])}>
                {scoreBandLabel[opportunity.scoreBand]}
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {opportunity.scoreExplanation.map((reason) => (
                <li key={reason} className="flex gap-2 text-sm leading-5 text-foreground">
                  <CheckCircle size={16} weight="duotone" className="mt-0.5 shrink-0 text-accent" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}

type HeroLineProps = Readonly<{
  label: string;
  value: string;
}>;

function HeroLine({ label, value }: HeroLineProps) {
  return (
    <div className="rounded-[16px] bg-white/10 px-3 py-2 ring-1 ring-white/14">
      <p className="text-xs text-white/55">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
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
        <Icon size={18} weight="duotone" className="text-accent" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}
