import { Link } from "react-router-dom";
import { Button } from "@/components/ui";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface">
      <div className="text-center max-w-md">
        <p className="text-6xl font-display font-bold text-accent">404</p>
        <h1 className="mt-4 text-2xl font-display font-semibold text-navy-900">
          Page introuvable
        </h1>
        <p className="mt-2 text-navy-500">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <Link to="/" className="inline-block mt-6">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  );
}
