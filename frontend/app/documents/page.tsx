import { FileText } from "@phosphor-icons/react/dist/ssr";

const documents = ["CV anglais", "Lettre de motivation base", "Passeport", "Relevés de notes", "Certificats", "GitHub", "LinkedIn"] as const;

export default function DocumentsPage() {
  return (
    <section className="mx-auto max-w-5xl">
      <div className="panel p-5">
        <h1 className="text-2xl font-semibold text-ink">Documents</h1>
        <p className="mt-1 text-sm text-ink-60">Templates et checklist pour postuler rapidement.</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => (
          <article key={document} className="panel p-4">
            <FileText size={22} weight="duotone" className="text-royal" />
            <h2 className="mt-3 font-semibold text-ink">{document}</h2>
            <p className="mt-1 text-sm text-ink-60">À maintenir prêt avant les deadlines courtes.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
