"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { MaterialIcon } from "@/components/ui/material-icon";
import { api, type SourceCreatePayload, type SourceFrequency, type SourceRead, type SourceType } from "@/lib/api";
import { cn } from "@/lib/cn";

const sourceTypes: ReadonlyArray<Readonly<{ value: SourceType; label: string }>> = [
  { value: "scraper", label: "Page HTML" },
  { value: "rss", label: "Flux RSS" },
  { value: "api", label: "API JSON" }
];

const frequencies: ReadonlyArray<Readonly<{ value: SourceFrequency; label: string }>> = [
  { value: "daily", label: "Chaque jour" },
  { value: "weekly", label: "Chaque semaine" },
  { value: "monthly", label: "Chaque mois" },
  { value: "manual", label: "Manuel" }
];

const initialForm: SourceCreatePayload = {
  name: "",
  url: "",
  type: "scraper",
  frequency: "weekly",
  adapter_key: "generic_html",
  is_active: true
};

export default function SourcesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SourceCreatePayload>(initialForm);

  const sourcesQuery = useQuery({
    queryKey: ["sources"],
    queryFn: () => api.sources.list()
  });

  const createMutation = useMutation({
    mutationFn: (payload: SourceCreatePayload) => api.sources.create(payload),
    onSuccess: () => {
      setForm(initialForm);
      void queryClient.invalidateQueries({ queryKey: ["sources"] });
    }
  });

  const collectMutation = useMutation({
    mutationFn: (sourceId: string) => api.sources.collect(sourceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sources"] });
      void queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    }
  });

  function updateForm<K extends keyof SourceCreatePayload>(key: K, value: SourceCreatePayload[K]): void {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    createMutation.mutate(form);
  }

  return (
    <main className="mx-auto flex w-full max-w-container-max flex-col gap-10 px-margin-mobile py-12 md:px-margin-desktop md:py-20">
      <header className="max-w-3xl">
        <p className="text-label-sm uppercase tracking-[0.16em] text-secondary">Outil OSINT</p>
        <h1 className="mt-3 font-display text-headline-lg-mobile text-primary md:text-display-lg">Sources à surveiller</h1>
        <p className="mt-4 text-body-lg text-on-surface-variant">
          Enregistre des pages publiques de bourses, stages ou formations. L'agent les visitera selon la fréquence choisie, extraira les annonces et publiera les fiches utiles.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={submitForm} className="editorial-layer h-fit p-5 md:p-6">
          <h2 className="font-display text-headline-md text-primary">Nouvelle source</h2>
          <div className="mt-6 grid gap-4">
            <Field label="Nom">
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                required
                className="h-11 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface focus:border-primary focus:outline-none"
                placeholder="Opportunities For Youth"
              />
            </Field>

            <Field label="URL publique">
              <input
                value={form.url}
                onChange={(event) => updateForm("url", event.target.value)}
                required
                type="url"
                className="h-11 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface focus:border-primary focus:outline-none"
                placeholder="https://exemple.org/opportunities"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <select
                  value={form.type}
                  onChange={(event) => updateForm("type", event.target.value as SourceType)}
                  className="h-11 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface focus:border-primary focus:outline-none"
                >
                  {sourceTypes.map((sourceType) => (
                    <option key={sourceType.value} value={sourceType.value}>
                      {sourceType.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Fréquence">
                <select
                  value={form.frequency}
                  onChange={(event) => updateForm("frequency", event.target.value as SourceFrequency)}
                  className="h-11 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface focus:border-primary focus:outline-none"
                >
                  {frequencies.map((frequency) => (
                    <option key={frequency.value} value={frequency.value}>
                      {frequency.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {createMutation.isError ? (
            <p className="mt-4 text-label-md text-error">
              Source refusée. Vérifie que l'URL est publique et accessible en HTTP(S).
            </p>
          ) : null}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="editorial-button-primary mt-6 flex h-12 w-full items-center justify-center gap-2 px-5 text-label-md disabled:opacity-60"
          >
            <MaterialIcon name="add_link" size={18} />
            {createMutation.isPending ? "Ajout en cours..." : "Ajouter la source"}
          </button>
        </form>

        <section className="grid gap-4">
          {sourcesQuery.isError ? <SourceApiError /> : null}
          {sourcesQuery.isLoading ? <SourceSkeleton /> : null}
          {sourcesQuery.data?.length === 0 ? <EmptySources /> : null}
          {sourcesQuery.data?.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              isCollecting={collectMutation.isPending && collectMutation.variables === source.id}
              onCollect={(sourceId) => collectMutation.mutate(sourceId)}
            />
          ))}
        </section>
      </section>
    </main>
  );
}

function Field({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <label className="block">
      <span className="text-label-sm uppercase tracking-[0.12em] text-secondary">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function SourceCard({
  source,
  isCollecting,
  onCollect
}: Readonly<{
  source: SourceRead;
  isCollecting: boolean;
  onCollect: (sourceId: string) => void;
}>) {
  return (
    <article className="editorial-card grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
      <div className="flex gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded bg-surface-container text-primary">
          <MaterialIcon name={iconForSource(source.type)} size={24} />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-headline-sm text-primary">{source.name}</h2>
            <SourceState source={source} />
          </div>
          <p className="mt-1 break-all text-label-md text-secondary">{source.url}</p>
          <p className="mt-3 text-body-md text-on-surface-variant">
            {labelForType(source.type)} · {labelForFrequency(source.frequency)} · {source.last_result_count} fiche(s) créées au dernier passage
          </p>
          {source.last_error !== null ? <p className="mt-2 text-label-md text-error">{source.last_error}</p> : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onCollect(source.id)}
        disabled={isCollecting}
        className="rounded border border-primary-container px-4 py-2 text-label-md text-primary-container transition-colors hover:bg-surface-container focus:outline-none focus-visible:shadow-focus disabled:opacity-60"
      >
        {isCollecting ? "Collecte..." : "Collecter"}
      </button>
    </article>
  );
}

function SourceState({ source }: Readonly<{ source: SourceRead }>) {
  const isError = source.status === "error";
  const label = isError ? "Erreur" : source.is_active ? "Active" : "En pause";

  return (
    <span className={cn("rounded-full px-3 py-1 text-label-sm", isError ? "bg-error-container text-error" : "bg-success-container text-success")}>
      {label}
    </span>
  );
}

function EmptySources() {
  return (
    <section className="editorial-layer flex min-h-[280px] flex-col items-center justify-center p-10 text-center">
      <MaterialIcon name="travel_explore" className="text-secondary" size={56} />
      <h2 className="mt-4 font-display text-headline-md text-primary">Aucune source enregistrée</h2>
      <p className="mt-2 max-w-md text-body-md text-on-surface-variant">
        Ajoute une page publique d'annonces pour commencer la veille OSINT.
      </p>
    </section>
  );
}

function SourceApiError() {
  return (
    <section className="editorial-layer p-5 text-body-md text-error">
      API backend indisponible. Lance FastAPI sur `http://127.0.0.1:8000` pour gérer les sources.
    </section>
  );
}

function SourceSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="skeleton h-36 rounded" />
      <div className="skeleton h-36 rounded" />
    </div>
  );
}

function iconForSource(type: SourceType): string {
  if (type === "rss") {
    return "rss_feed";
  }

  if (type === "api") {
    return "api";
  }

  return "public";
}

function labelForType(type: SourceType): string {
  const labels: Record<SourceType, string> = {
    api: "API JSON",
    rss: "Flux RSS",
    scraper: "Page HTML",
    manual: "Manuel"
  };

  return labels[type];
}

function labelForFrequency(frequency: SourceFrequency): string {
  const labels: Record<SourceFrequency, string> = {
    daily: "chaque jour",
    weekly: "chaque semaine",
    monthly: "chaque mois",
    manual: "manuel"
  };

  return labels[frequency];
}
