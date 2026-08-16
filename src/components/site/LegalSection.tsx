export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-[var(--color-text)]">{title}</h2>
      <div className="mt-3 space-y-3 text-[var(--color-text-muted)]">{children}</div>
    </section>
  );
}
