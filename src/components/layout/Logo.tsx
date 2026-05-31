import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

interface LogoProps {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
  asLink?: boolean;
}

export function Logo({ variant = "dark", size = "md", className, asLink = true }: LogoProps) {
  const sizes = { sm: "h-8", md: "h-10", lg: "h-12" };
  const inner = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-display font-bold",
          sizes[size],
          "aspect-square",
          variant === "dark"
            ? "bg-primary text-accent"
            : "bg-white text-primary"
        )}
      >
        AFG
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            "font-display font-semibold",
            variant === "dark" ? "text-navy-900" : "text-white",
            size === "lg" ? "text-base" : "text-sm"
          )}
        >
          Académie de Formation Globale
        </span>
        <span
          className={cn(
            "text-[10px] uppercase tracking-wider",
            variant === "dark" ? "text-navy-500" : "text-white/70"
          )}
        >
          Apprenez ici. Brillez partout.
        </span>
      </span>
    </span>
  );
  if (!asLink) return inner;
  return <Link to="/">{inner}</Link>;
}
