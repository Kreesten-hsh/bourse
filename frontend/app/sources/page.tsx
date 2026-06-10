import { ArrowsClockwise, Broadcast, CloudWarning } from "@phosphor-icons/react/dist/ssr";

const sources = [
  { name: "ReliefWeb ICT Jobs", type: "API", status: "Actif", lastSync: "06:00 UTC", count: 50 },
  { name: "UN Talent RSS", type: "RSS", status: "Actif", lastSync: "06:00 UTC", count: 24 },
  { name: "Opportunities For Youth", type: "Scraper", status: "À surveiller", lastSync: "manuel", count: 20 }
] as const;

export default function SourcesPage() {
  return (
    <section className="mx-auto max-w-5xl">
      <div className="panel p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Sources</h1>
            <p className="mt-1 text-sm text-ink-60">Connectez vos premières sources pour commencer.</p>
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-royal px-4 text-sm font-semibold text-surface-2">
            <ArrowsClockwise size={17} />
            Configurer les sources
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {sources.map((source) => (
          <article key={source.name} className="panel flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-royal-light text-royal">
                <Broadcast size={20} weight="duotone" />
              </span>
              <div>
                <h2 className="font-semibold text-ink">{source.name}</h2>
                <p className="text-sm text-ink-60">{source.type} · Dernière sync {source.lastSync}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-ink-60">
              {source.status === "À surveiller" ? <CloudWarning size={14} className="text-warning" /> : null}
              {source.count} offres
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
