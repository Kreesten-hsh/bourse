export default function SettingsPage() {
  return (
    <section className="mx-auto max-w-4xl">
      <div className="panel p-5">
        <h1 className="text-2xl font-semibold text-ink">Paramètres</h1>
        <p className="mt-1 text-sm text-ink-60">Profil, préférences de score et notifications.</p>
      </div>

      <div className="mt-4 grid gap-4">
        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-ink">Profil cible</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Localisation" value="Cotonou, Bénin" />
            <Field label="Niveau" value="L3 SIL" />
            <Field label="Domaines" value="Software, cybersécurité, data" />
            <Field label="Budget" value="0 FCFA" />
          </div>
        </section>
      </div>
    </section>
  );
}

function Field({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-md border border-border bg-surface-3 px-3 py-2">
      <p className="text-xs font-semibold uppercase text-ink-60">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
