import Link from "next/link";

export default function MonComptePage() {
  return <main className="planner-shell dashboard-shell"><section className="planner-intro dashboard-intro"><p className="eyebrow"><span className="status-dot"/> TON ESPACE PERSONNEL</p><h1>Mon <span>compte.</span></h1><p>La connexion et la gestion du profil ne sont pas encore disponibles.</p><Link href="/mon-programme" className="dashboard-action-link">Retour à mon programme →</Link></section><footer className="page-footer"><span>FITRACK © 2026</span><span>FAIT POUR AVANCER.</span></footer></main>;
}
