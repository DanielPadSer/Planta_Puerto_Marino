import { createFileRoute } from "@tanstack/react-router";
import { Usuarios } from "@/features/panel-calidad/Usuarios";
export const Route = createFileRoute("/panel/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuarios y roles · Puerto Marino" },
      { name: "description", content: "Gestión de usuarios, roles y restablecimiento de PIN en Puerto Marino." },
      { property: "og:title", content: "Usuarios y roles · Puerto Marino" },
      { property: "og:description", content: "Administración de cuentas del panel de calidad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Usuarios,
});
