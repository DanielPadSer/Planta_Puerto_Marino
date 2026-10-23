import logo from "@/assets/puerto-marino-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return <img src={logo.url} alt="Logo de Puerto Marino" className={cn("puerto-logo", className)} />;
}