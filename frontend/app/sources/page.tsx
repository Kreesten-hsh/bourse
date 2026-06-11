import { MaterialIcon } from "@/components/ui/material-icon";

type SourceItem = Readonly<{
  name: string;
  kind: string;
  state: "active" | "watch";
  lastSync: string;
  count: number;
  note: string;
}>;

const sources: ReadonlyArray<SourceItem> = [
  {
    name: "ReliefWeb ICT Jobs",
    kind: "API publique",
    state: "active",
    lastSync: "06:00 UTC",
    count: 50,
    note: "Très utile pour les postes et missions liées aux technologies."
  },
  {
    name: "UN Talent RSS",
    kind: "Flux RSS",
    state: "active",
    lastSync: "06:00 UTC",
    count: 24,
    note: "Bon signal pour volontariat, missions hybrides et premières expériences."
  },
  {
    name: "Opportunities For Youth",
    kind: "Collecte web",
    state: "watch",
    lastSync: "manuel",
    count: 20,
    note: "À surveiller, car les conditions de financement doivent souvent être confirmées."
  }
];

export default function SourcesPage() {
  return (
    <main className="mx-auto flex w-full max-w-container-max flex-col gap-10 px-margin-mobile py-12 md:px-margin-desktop md:py-20">
      <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <p className="text-label-sm uppercase tracking-[0.16em] text-secondary">Veille automatique</p>
          <h1 className="mt-3 font-display text-headline-lg-mobile text-primary md:text-display-lg">Sources</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
            Les points d'entrée qui alimentent la veille internationale en bourses, stages, missions et formations.
          </p>
        </div>

        <button type="button" className="editorial-button-primary w-fit px-5 py-3 text-label-md">
          <MaterialIcon name="sync" size={18} />
          Synchroniser maintenant
        </button>
      </header>

      <section className="grid gap-4">
        {sources.map((source) => (
          <article key={source.name} className="editorial-card grid gap-5 p-5 md:grid-cols-[1fr_220px] md:items-center md:p-6">
            <div className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded bg-surface-container text-primary">
                <MaterialIcon name={source.state === "active" ? "rss_feed" : "travel_explore"} size={24} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-headline-sm text-primary">{source.name}</h2>
                  <SourceState state={source.state} />
                </div>
                <p className="mt-1 text-label-md text-secondary">
                  {source.kind} · dernière synchronisation : {source.lastSync}
                </p>
                <p className="mt-3 max-w-2xl text-body-md text-on-surface-variant">{source.note}</p>
              </div>
            </div>

            <div className="rounded border border-outline-variant bg-surface-container-lowest p-4 md:text-right">
              <p className="mono text-headline-md text-primary">{source.count}</p>
              <p className="text-label-sm text-secondary">offres récentes</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function SourceState({ state }: Readonly<{ state: SourceItem["state"] }>) {
  const label = state === "active" ? "Active" : "À vérifier";
  const className = state === "active" ? "bg-success-container text-success" : "bg-warning-container text-warning";

  return <span className={`rounded-full px-3 py-1 text-label-sm ${className}`}>{label}</span>;
}
