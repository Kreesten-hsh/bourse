import { notFound } from "next/navigation";

import { MaterialIcon } from "@/components/ui/material-icon";
import { buildBenefits, buildConditions } from "@/features/opportunities/opportunity-view-model";
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

  return (
    <main className="mx-auto grid w-full max-w-container-max gap-8 px-margin-mobile py-12 md:px-margin-desktop md:py-20">
      <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <p className="text-label-sm uppercase tracking-[0.16em] text-secondary">{opportunity.organization}</p>
          <h1 className="mt-3 max-w-4xl font-display text-headline-lg-mobile text-primary md:text-display-lg">{opportunity.title}</h1>
        </div>

        <a
          href={opportunity.official_url}
          target="_blank"
          rel="noreferrer"
          className="editorial-button-primary w-fit px-5 py-3 text-label-md"
        >
          <MaterialIcon name="open_in_new" size={18} />
          Postuler directement
        </a>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <DetailPanel icon="payments" title="Avantages">
          {benefits.map((benefit) => (
            <Line key={benefit.label} label={benefit.label} value={benefit.value} />
          ))}
        </DetailPanel>

        <DetailPanel icon="rule" title="Conditions">
          {conditions.map((condition) => (
            <Line key={condition.label} label={condition.label} value={condition.value} />
          ))}
        </DetailPanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1fr]">
        <DetailPanel icon="description" title="Documents requis">
          {opportunity.required_documents.map((document) => (
            <div key={document} className="flex items-center gap-3 border-t border-outline-variant pt-3 first:border-t-0 first:pt-0">
              <MaterialIcon name="check_circle" className="text-success" size={18} />
              <span className="text-body-md text-on-surface-variant">{document}</span>
            </div>
          ))}
        </DetailPanel>
      </section>
    </main>
  );
}

function DetailPanel({ icon, title, children }: Readonly<{ icon: string; title: string; children: React.ReactNode }>) {
  return (
    <section className="editorial-card p-5 md:p-6">
      <div className="flex items-center gap-2">
        <MaterialIcon name={icon} className="text-primary" size={22} />
        <h2 className="font-display text-headline-md text-primary">{title}</h2>
      </div>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

function Line({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex justify-between gap-4 border-t border-outline-variant pt-3 text-body-md first:border-t-0 first:pt-0">
      <span className="text-on-surface-variant">{label}</span>
      <span className="text-right font-semibold text-primary">{value}</span>
    </div>
  );
}
