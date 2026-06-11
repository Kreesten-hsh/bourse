import { MaterialIcon } from "@/components/ui/material-icon";

type DocumentItem = Readonly<{
  title: string;
  detail: string;
  state: "prêt" | "à améliorer" | "à créer";
  icon: string;
}>;

const essentialDocuments: ReadonlyArray<DocumentItem> = [
  { title: "CV anglais", detail: "Version courte orientée logiciel et cybersécurité.", state: "à améliorer", icon: "article" },
  { title: "Lettre de motivation", detail: "Base adaptable par bourse, stage ou fellowship.", state: "à créer", icon: "edit_note" },
  { title: "Passeport", detail: "Validité à confirmer avant toute candidature internationale.", state: "à améliorer", icon: "id_card" },
  { title: "Relevés de notes", detail: "Prévoir traduction et copie claire si demandées.", state: "à améliorer", icon: "history_edu" }
];

const evidenceDocuments: ReadonlyArray<DocumentItem> = [
  { title: "Portfolio GitHub", detail: "Mettre Benin Cyber Shield en avant avec un README solide.", state: "à améliorer", icon: "code" },
  { title: "Profil LinkedIn", detail: "Aligner titre, résumé, expériences et certifications.", state: "à améliorer", icon: "person_search" },
  { title: "Certifications", detail: "CS50W, cybersécurité, freeCodeCamp, Microsoft/LinkedIn.", state: "prêt", icon: "workspace_premium" }
];

export default function DocumentsPage() {
  return (
    <main className="mx-auto flex w-full max-w-container-max flex-col gap-10 px-margin-mobile py-12 md:px-margin-desktop md:py-20">
      <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <p className="text-label-sm uppercase tracking-[0.16em] text-secondary">Préparation</p>
          <h1 className="mt-3 font-display text-headline-lg-mobile text-primary md:text-display-lg">Dossiers</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
            Une base documentaire prête à adapter quand une opportunité prioritaire apparaît.
          </p>
        </div>

        <aside className="editorial-card p-5">
          <p className="text-label-sm uppercase tracking-[0.14em] text-secondary">Action critique</p>
          <p className="mt-3 font-display text-headline-md text-primary">Solidifier le CV anglais</p>
          <p className="mt-2 text-body-md text-on-surface-variant">
            C'est la pièce qui sert partout : stages, formations, fellowships et emplois.
          </p>
        </aside>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <DocumentCollection title="Documents essentiels" items={essentialDocuments} />
        <DocumentCollection title="Preuves et crédibilité" items={evidenceDocuments} />
      </section>

      <section className="border-t border-outline-variant pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <SignalCard icon="translate" title="Langue" text="Préparer les versions anglaises avant les échéances courtes." />
          <SignalCard icon="verified" title="Cohérence" text="Même nom, mêmes dates et mêmes expériences sur chaque document." />
          <SignalCard icon="lock_clock" title="Temps" text="Un dossier complet doit pouvoir partir en moins de quarante-huit heures." />
        </div>
      </section>
    </main>
  );
}

function DocumentCollection({ title, items }: Readonly<{ title: string; items: ReadonlyArray<DocumentItem> }>) {
  return (
    <section className="editorial-card p-5 md:p-6">
      <h2 className="font-display text-headline-md text-primary">{title}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <article key={item.title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-4 border-t border-outline-variant pt-4 first:border-t-0 first:pt-0">
            <span className="grid h-10 w-10 place-items-center rounded bg-surface-container text-primary">
              <MaterialIcon name={item.icon} size={22} />
            </span>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-title-md font-semibold text-primary">{item.title}</h3>
                <StatePill state={item.state} />
              </div>
              <p className="mt-1 text-body-sm text-on-surface-variant">{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SignalCard({ icon, title, text }: Readonly<{ icon: string; title: string; text: string }>) {
  return (
    <article className="rounded border border-outline-variant bg-surface-container-lowest p-5">
      <MaterialIcon name={icon} className="text-primary" size={24} />
      <h3 className="mt-4 text-title-md font-semibold text-primary">{title}</h3>
      <p className="mt-2 text-body-sm text-on-surface-variant">{text}</p>
    </article>
  );
}

function StatePill({ state }: Readonly<{ state: DocumentItem["state"] }>) {
  const classNameByState: Record<DocumentItem["state"], string> = {
    prêt: "bg-success-container text-success",
    "à améliorer": "bg-warning-container text-warning",
    "à créer": "bg-chip-bg text-on-surface-variant"
  };

  return <span className={`rounded-full px-3 py-1 text-label-sm ${classNameByState[state]}`}>{state}</span>;
}
