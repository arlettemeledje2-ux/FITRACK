import Link from "next/link";
import { Suspense } from "react";
import Navigation from "@/components/Navigation";
import CompteForm from "@/app/compte/CompteForm";

export default function ConnexionPage() {
  return <main className="planner-shell account-shell"><Navigation/><Suspense fallback={<p className="account-loading">Chargement…</p>}><CompteForm mode="connexion"/></Suspense><footer className="page-footer"><span>FITRACK © 2026</span><Link href="/">RETOUR À L’ACCUEIL</Link></footer></main>;
}
