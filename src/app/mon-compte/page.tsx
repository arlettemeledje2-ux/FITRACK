import Navigation from "@/components/Navigation";
import ProfilActions from "./ProfilActions";

export default function MonComptePage() {
  return <main className="planner-shell dashboard-shell account-shell"><Navigation/><section className="planner-intro dashboard-intro"><p className="eyebrow"><span className="status-dot"/> TON ESPACE PERSONNEL</p><h1>Mon <span>compte.</span></h1><p>Ton parcours sportif, rassemblé au même endroit.</p></section><ProfilActions/><footer className="page-footer"><span>FITRACK © 2026</span><span>FAIT POUR AVANCER.</span></footer></main>;
}
