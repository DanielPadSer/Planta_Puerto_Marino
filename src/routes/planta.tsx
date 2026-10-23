import { createFileRoute } from "@tanstack/react-router";
import { PlantaLayout } from "@/features/planta/PlantaLayout";

export const Route = createFileRoute("/planta")({
  component: PlantaLayout,
});
