import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/panel/bandeja")({
  head: () => ({
    meta: [
      { title: "Bandeja de decisiones · Puerto Marino" },
      { name: "description", content: "Bandeja de decisiones de calidad del panel web." },
      { property: "og:title", content: "Bandeja de decisiones · Puerto Marino" },
      { property: "og:description", content: "Bandeja de decisiones de calidad del panel web." },
    ],
  }),
  component: () => (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass max-w-lg rounded-[var(--radius-panel)] p-8 text-center">
        <h1 className="text-2xl font-bold">Bandeja de decisiones</h1>
        <p className="mt-2 text-sm text-muted-foreground">Llegará en la siguiente fase.</p>
        <Link to="/" className="tap mt-6 inline-flex items-center rounded-2xl bg-primary px-5 font-semibold text-primary-foreground">Volver al acceso</Link>
      </div>
    </div>
  ),
});
