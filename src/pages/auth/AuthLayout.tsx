import { Link } from "react-router-dom";
import { type ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";
import { ACADEMY } from "@/lib/constants";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
      <div className="hidden lg:flex relative bg-gradient-to-br from-primary via-primary to-navy-800 text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent" />
        <div className="relative">
          <Logo variant="light" />
        </div>
        <div className="relative">
          <h2 className="text-3xl font-display font-bold leading-tight max-w-md">
            {ACADEMY.tagline}
          </h2>
          <p className="mt-4 text-white/70 max-w-md">
            Connectez-vous pour accéder à vos formations, votre emploi du temps
            et votre suivi pédagogique.
          </p>
        </div>
        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} {ACADEMY.shortName}
        </p>
      </div>
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6">
            <Logo />
          </div>
          <h1 className="text-2xl font-display font-semibold text-navy-900">{title}</h1>
          <p className="mt-1 text-sm text-navy-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm text-navy-500 text-center">{footer}</div>}
          <p className="mt-8 text-center text-xs text-navy-400">
            <Link to="/" className="hover:text-navy-700">
              ← Retour au site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
