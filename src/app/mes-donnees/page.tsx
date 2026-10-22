import Link from "next/link";
import Navigation from "@/components/Navigation";
import ImportDonnees from "./ImportDonnees";

export default function MesDonneesPage() {
  return <main className="planner-shell dashboard-shell account-shell"><Navigation/><section className="planner-intro dashboard-intro"><p className="eyebrow"><span className="status-dot"/> DONNÉES PRIVÉES</p><h1>Mes <span>données.</span></h1><p>Importe tes données locales vers ton espace privé sans effacer ni remplacer les données déjà présentes.</p></section><ImportDonnees/><footer className="page-footer"><Link href="/mon-compte">RETOUR AU PROFIL</Link><span>FAIT POUR AVANCER.</span></footer></main>;
}
