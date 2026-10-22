import Link from "next/link";
import { Suspense } from "react";
import Navigation from "@/components/Navigation";
import AuthMode from "./AuthMode";

export default function AuthPage() {
  return <main className="planner-shell account-shell"><Navigation/><Suspense fallback={<p className="account-loading">Chargement…</p>}><AuthMode/></Suspense><footer className="page-footer"><span>FITRACK © 2026</span><Link href="/">RETOUR À L’ACCUEIL</Link></footer></main>;
}
