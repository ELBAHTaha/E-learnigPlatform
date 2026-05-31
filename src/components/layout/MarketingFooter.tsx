import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { ACADEMY, POLES } from "@/lib/constants";
import { Logo } from "./Logo";

export function MarketingFooter() {
  return (
    <footer className="mt-20 bg-navy-900 text-navy-100">
      <div className="container-page py-12 grid gap-10 lg:grid-cols-4">
        <div>
          <Logo variant="light" size="md" asLink={false} />
          <p className="mt-4 text-sm text-navy-300 max-w-xs">
            Académie multidisciplinaire au Maroc — soutien scolaire, formation
            continue, immigration et langues étrangères.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <a
              href="#"
              className="rounded-lg p-2 bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="rounded-lg p-2 bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="rounded-lg p-2 bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Nos pôles</h4>
          <ul className="space-y-2">
            {POLES.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/formations?pole=${p.id}`}
                  className="text-sm text-navy-300 hover:text-accent transition-colors"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Académie</h4>
          <ul className="space-y-2">
            <li><Link to="/a-propos" className="text-sm text-navy-300 hover:text-accent">À propos</Link></li>
            <li><Link to="/formations" className="text-sm text-navy-300 hover:text-accent">Catalogue</Link></li>
            <li><Link to="/inscription" className="text-sm text-navy-300 hover:text-accent">S'inscrire</Link></li>
            <li><Link to="/contact" className="text-sm text-navy-300 hover:text-accent">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-navy-300">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-accent" />
              <span>{ACADEMY.address}</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 text-accent" />
              <a href={`tel:${ACADEMY.phone}`}>{ACADEMY.phone}</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 text-accent" />
              <a href={`mailto:${ACADEMY.email}`}>{ACADEMY.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-4 text-xs text-navy-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} {ACADEMY.shortName}. Tous droits réservés.</span>
          <span>{ACADEMY.domain}</span>
        </div>
      </div>
    </footer>
  );
}
