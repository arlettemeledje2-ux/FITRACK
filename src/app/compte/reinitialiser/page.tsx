"use client";

import Link from "next/link";
import { useState } from "react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { messageFirebase } from "@/lib/firebase/erreurs";

export default function ReinitialiserPage() {
  const [motDePasse, setMotDePasse] = useState(""); const [confirmation, setConfirmation] = useState(""); const [message, setMessage] = useState(""); const [erreur, setErreur] = useState("");
  async function soumettre(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setErreur(""); setMessage("");
    if (motDePasse !== confirmation) { setErreur("Les mots de passe ne correspondent pas."); return; }
    try {
      const code = new URLSearchParams(window.location.search).get("oobCode");
      if (!code) throw new Error("Lien invalide. Demande un nouvel e-mail de réinitialisation.");
      await verifyPasswordResetCode(getFirebaseAuth(), code);
      await confirmPasswordReset(getFirebaseAuth(), code, motDePasse);
      setMessage("Mot de passe mis à jour. Tu peux te connecter.");
    } catch (cause) { setErreur(messageFirebase(cause)); }
  }
  return <main className="planner-shell account-shell"><header className="topbar"><Link href="/" className="planner-header-link">FITRACK</Link></header><section className="account-card"><p className="dashboard-kicker">SÉCURITÉ DU COMPTE</p><h1>Nouveau <span>mot de passe.</span></h1><form className="account-form" onSubmit={soumettre}><label>Nouveau mot de passe<input type="password" required minLength={6} autoComplete="new-password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}/></label><label>Confirmer le mot de passe<input type="password" required minLength={6} autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)}/></label>{erreur && <p className="form-error" role="alert">{erreur}</p>}{message && <p className="account-message" role="status">{message}</p>}<button className="primary-button account-submit">Mettre à jour</button></form><div className="account-links"><Link href="/auth">Retour à la connexion</Link></div></section></main>;
}
