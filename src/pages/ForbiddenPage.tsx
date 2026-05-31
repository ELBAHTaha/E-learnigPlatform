import { Link } from "react-router-dom";
import { Button } from "@/components/ui";

export function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface">
      <div className="text-center max-w-md">
        <p className="text-6xl font-display font-bold text-danger">403</p>
        <h1 className="mt-4 text-2xl font-display font-semibold text-navy-900">
          Accès refusé
        </h1>
        <p className="mt-2 text-navy-500">
          Vous n'avez pas les autorisations nécessaires pour consulter cette page.
        </p>
        <Link to="/" className="inline-block mt-6">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  );
}
