import { notFound } from "next/navigation";
import { ArrowSquareOut, CheckCircle, CurrencyCircleDollar, Flag } from "@phosphor-icons/react/dist/ssr";

import { buildBenefits, buildConditions, formatDestination, formatFundingSummary } from "@/features/opportunities/opportunity-view-model";
import { buildScoreLines, formatScoreLine } from "@/features/opportunities/scoring-view-model";
import { sampleOpportunities } from "@/features/opportunities/sample-opportunities";

type OpportunityDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
  const { id } = await params;
  const opportunity = sampleOpportunities.find((item) => item.id === id);

  if (opportunity === undefined) {
    notFound();
  }

  const benefits = buildBenefits(opportunity);
  const conditions = buildConditions(opportunity);
  const scoreLines = buildScoreLines(opportunity);

  return (
    <article className="mx-auto grid max-w-5xl gap-4">
      <header className="panel p-6">
        <p className="text-sm font-semibold text-royal">{opportunity.organization}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{opportunity.title}</h1>
        <p className="mt-3 text-sm text-ink-60">{formatDestination(opportunity)} · {formatFundingSummary(opportunity)}</p>
        <a
          href={opportunity.official_url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-royal px-4 text-sm font-semibold text-surface-2 hover:bg-royal-hover"
        >
          <ArrowSquareOut size={18} />
          Postuler directement
        </a>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <DetailPanel icon={CurrencyCircleDollar} title="Avantages">
          {benefits.map((benefit) => (
            <Line key={benefit.label} label={benefit.label} value={benefit.value} />
          ))}
        </DetailPanel>
        <DetailPanel icon={Flag} title="Conditions">
          {conditions.map((condition) => (
            <Line key={condition.label} label={condition.label} value={condition.value} />
          ))}
        </DetailPanel>
      </section>

      <section className="panel p-5">
        <h2 className="text-lg font-semibold text-ink">Documents requis</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {opportunity.required_documents.map((document) => (
            <span key={document} className="inline-flex items-center gap-2 text-sm text-ink">
              <CheckCircle size={16} className="text-royal" />
              {document}
            </span>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-lg font-semibold text-ink">Score {opportunity.score}/100</h2>
        <div className="mt-4 grid gap-2">
          {scoreLines.map((line) => (
            <Line key={line.key} label={line.label} value={formatScoreLine(line)} />
          ))}
        </div>
      </section>
    </article>
  );
}

type PanelIcon = React.ComponentType<{ size?: number; className?: string; weight?: "regular" | "duotone" }>;

function DetailPanel({ icon: Icon, title, children }: Readonly<{ icon: PanelIcon; title: string; children: React.ReactNode }>) {
  return (
    <section className="panel p-5">
      <div className="flex items-center gap-2">
        <Icon size={20} weight="duotone" className="text-royal" />
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
      </div>
      <div className="mt-4 grid gap-2">{children}</div>
    </section>
  );
}

function Line({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex justify-between gap-4 border-b border-border-subtle py-2 text-sm">
      <span className="text-ink-60">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  );
}
