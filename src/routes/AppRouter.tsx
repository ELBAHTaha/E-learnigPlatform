import { Routes, Route, Navigate } from "react-router-dom";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RequireAuth } from "./guards";
import {
  eleveNav,
  formateurNav,
  adminNav,
  conseillerNav,
} from "./dashboardNav";
import { HomePage } from "@/pages/public/HomePage";
import { AboutPage } from "@/pages/public/AboutPage";
import { FormationsPage } from "@/pages/public/FormationsPage";
import { FormationDetailPage } from "@/pages/public/FormationDetailPage";
import { ContactPage } from "@/pages/public/ContactPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { EleveDashboard } from "@/pages/eleve/EleveDashboard";
import { MesFormationsPage } from "@/pages/eleve/MesFormationsPage";
import { EmploiDuTempsPage as EleveEmploi } from "@/pages/eleve/EmploiDuTempsPage";
import { MesNotesPage } from "@/pages/eleve/MesNotesPage";
import { VisioconferencePage } from "@/pages/eleve/VisioconferencePage";
import { AnnoncesPage as EleveAnnonces } from "@/pages/eleve/AnnoncesPage";
import { DossierPage } from "@/pages/eleve/DossierPage";
import { FormateurDashboard } from "@/pages/formateur/FormateurDashboard";
import { MesCoursPage } from "@/pages/formateur/MesCoursPage";
import { SaisieNotesPage } from "@/pages/formateur/SaisieNotesPage";
import { FormateurEmploiPage } from "@/pages/formateur/FormateurEmploiPage";
import { MesElevesPage } from "@/pages/formateur/MesElevesPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { UsersPage } from "@/pages/admin/UsersPage";
import { FormationsAdminPage } from "@/pages/admin/FormationsAdminPage";
import { RoomsPage } from "@/pages/admin/RoomsPage";
import { SchedulePage } from "@/pages/admin/SchedulePage";
import { AnnouncementsAdminPage } from "@/pages/admin/AnnouncementsAdminPage";
import { InscriptionsPage } from "@/pages/admin/InscriptionsPage";
import { ConseillerDashboard } from "@/pages/conseiller/ConseillerDashboard";
import { DossiersListPage } from "@/pages/conseiller/DossiersListPage";
import { DossierDetailPage } from "@/pages/conseiller/DossierDetailPage";
import { ElevesSuivisPage } from "@/pages/conseiller/ElevesSuivisPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ForbiddenPage } from "@/pages/ForbiddenPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route index element={<HomePage />} />
        <Route path="a-propos" element={<AboutPage />} />
        <Route path="formations" element={<FormationsPage />} />
        <Route path="formations/:id" element={<FormationDetailPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route
          path="profil"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="profil/parametres"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="connexion" element={<LoginPage />} />
      <Route path="inscription" element={<RegisterPage />} />

      <Route
        path="eleve"
        element={
          <RequireAuth roles={["eleve"]}>
            <DashboardLayout navItems={eleveNav} title="Espace élève" />
          </RequireAuth>
        }
      >
        <Route index element={<EleveDashboard />} />
        <Route path="formations" element={<MesFormationsPage />} />
        <Route path="emploi-du-temps" element={<EleveEmploi />} />
        <Route path="notes" element={<MesNotesPage />} />
        <Route path="visioconference" element={<VisioconferencePage />} />
        <Route path="annonces" element={<EleveAnnonces />} />
        <Route path="dossier" element={<DossierPage />} />
      </Route>

      <Route
        path="formateur"
        element={
          <RequireAuth roles={["formateur"]}>
            <DashboardLayout navItems={formateurNav} title="Espace formateur" />
          </RequireAuth>
        }
      >
        <Route index element={<FormateurDashboard />} />
        <Route path="cours" element={<MesCoursPage />} />
        <Route path="notes" element={<SaisieNotesPage />} />
        <Route path="emploi-du-temps" element={<FormateurEmploiPage />} />
        <Route path="eleves" element={<MesElevesPage />} />
      </Route>

      <Route
        path="admin"
        element={
          <RequireAuth roles={["admin"]}>
            <DashboardLayout navItems={adminNav} title="Administration" />
          </RequireAuth>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="utilisateurs" element={<UsersPage />} />
        <Route path="formations" element={<FormationsAdminPage />} />
        <Route path="salles" element={<RoomsPage />} />
        <Route path="emploi-du-temps" element={<SchedulePage />} />
        <Route path="annonces" element={<AnnouncementsAdminPage />} />
        <Route path="inscriptions" element={<InscriptionsPage />} />
      </Route>

      <Route
        path="conseiller"
        element={
          <RequireAuth roles={["conseiller"]}>
            <DashboardLayout navItems={conseillerNav} title="Conseil immigration" />
          </RequireAuth>
        }
      >
        <Route index element={<ConseillerDashboard />} />
        <Route path="dossiers" element={<DossiersListPage />} />
        <Route path="dossiers/:id" element={<DossierDetailPage />} />
        <Route path="eleves" element={<ElevesSuivisPage />} />
      </Route>

      <Route path="403" element={<ForbiddenPage />} />
      <Route path="404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
