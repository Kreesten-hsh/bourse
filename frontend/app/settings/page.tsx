import { MaterialIcon } from "@/components/ui/material-icon";

type ProfileFact = Readonly<{
  label: string;
  value: string;
  icon: string;
}>;

const profileFacts: ReadonlyArray<ProfileFact> = [
  { label: "Localisation", value: "Cotonou, Bénin", icon: "location_on" },
  { label: "Niveau actuel", value: "L3 Systèmes Informatiques et Logiciels", icon: "school" },
  { label: "Domaines forts", value: "Logiciel, cybersécurité, data", icon: "terminal" },
  { label: "Budget", value: "0 FCFA disponible", icon: "savings" }
];

const scoringPreferences = [
  "Prioriser les opportunités entièrement financées",
  "Favoriser les offres ouvertes au Bénin, à l'Afrique ou au monde",
  "Pénaliser les frais de candidature",
  "Surveiller les échéances inconnues avant d'agir"
] as const;

export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-container-max flex-col gap-10 px-margin-mobile py-12 md:px-margin-desktop md:py-20">
      <header className="max-w-3xl">
        <p className="text-label-sm uppercase tracking-[0.16em] text-secondary">Profil de veille</p>
        <h1 className="mt-3 font-display text-headline-lg-mobile text-primary md:text-display-lg">Paramètres</h1>
        <p className="mt-4 text-body-lg text-on-surface-variant">
          Les règles qui aident le système à reconnaître les opportunités réellement utiles pour ton parcours international.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="editorial-card p-5 md:p-6">
          <h2 className="font-display text-headline-md text-primary">Profil cible</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {profileFacts.map((fact) => (
              <ProfileFactCard key={fact.label} fact={fact} />
            ))}
          </div>
        </div>

        <aside className="editorial-card bg-primary-container p-5 text-on-primary md:p-6">
          <MaterialIcon name="explore" size={28} />
          <h2 className="mt-5 font-display text-headline-md">Cap principal</h2>
          <p className="mt-3 text-body-md text-on-primary">
            Chercher des chemins financés vers la mobilité internationale en informatique, sans dépendre de ressources payantes.
          </p>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="editorial-card p-5 md:p-6">
          <h2 className="font-display text-headline-md text-primary">Préférences de score</h2>
          <ul className="mt-5 grid gap-3">
            {scoringPreferences.map((preference) => (
              <li key={preference} className="flex gap-3 border-t border-outline-variant pt-3 first:border-t-0 first:pt-0">
                <MaterialIcon name="check_circle" className="mt-0.5 text-success" size={18} />
                <span className="text-body-md text-on-surface-variant">{preference}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="editorial-card p-5 md:p-6">
          <h2 className="font-display text-headline-md text-primary">Notifications</h2>
          <div className="mt-5 grid gap-4">
            <PreferenceToggle title="Résumé quotidien" text="Recevoir les opportunités prioritaires une fois par jour." checked />
            <PreferenceToggle title="Échéances proches" text="Mettre en avant les dossiers à moins de quatorze jours." checked />
            <PreferenceToggle title="Offres ambiguës" text="Signaler les financements ou dates qui doivent être vérifiés." checked />
          </div>
        </section>
      </section>
    </main>
  );
}

function ProfileFactCard({ fact }: Readonly<{ fact: ProfileFact }>) {
  return (
    <article className="rounded border border-outline-variant bg-surface-container-lowest p-4">
      <MaterialIcon name={fact.icon} className="text-primary" size={22} />
      <p className="mt-4 text-label-sm uppercase tracking-[0.12em] text-secondary">{fact.label}</p>
      <p className="mt-1 text-title-md font-semibold text-primary">{fact.value}</p>
    </article>
  );
}

function PreferenceToggle({ title, text, checked }: Readonly<{ title: string; text: string; checked: boolean }>) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-outline-variant pt-4 first:border-t-0 first:pt-0">
      <div>
        <h3 className="text-title-md font-semibold text-primary">{title}</h3>
        <p className="mt-1 text-body-sm text-on-surface-variant">{text}</p>
      </div>
      <span className={`relative mt-1 h-6 w-10 shrink-0 rounded-full ${checked ? "bg-primary-container" : "bg-surface-container-highest"}`}>
        <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : ""}`} />
      </span>
    </div>
  );
}
