import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs text-navy-500">
      {items.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-navy-300" />}
          {c.to ? (
            <Link to={c.to} className="hover:text-navy-900">
              {c.label}
            </Link>
          ) : (
            <span className="text-navy-700 font-medium">{c.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
