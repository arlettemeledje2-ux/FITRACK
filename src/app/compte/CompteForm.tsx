"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { messageFirebase } from "@/lib/firebase/erreurs";

type Mode = "connexion" | "inscription" | "oubli";

export default function CompteForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [chargement, setChargement] = useState(false);
  const destinationBrute = params.get("next") ?? "/mon-programme";
  const destination = destinationBrute.startsWith("/") && !destinationBrute.startsWith("//") ? destinationBrute : "/mon-programme";

  async function soumettre(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setErreur(""); setMessage("");
    if (mode === "inscription" && motDePasse !== confirmation) { setErreur("Les mots de passe ne correspondent pas."); return; }
    setChargement(true);
    try {
      const auth = getFirebaseAuth();
      if (mode === "inscription") {
        const { user } = await createUserWithEmailAndPassword(auth, email.trim(), motDePasse);
        if (nom.trim()) await updateProfile(user, { displayName: nom.trim() });
        try { await sendEmailVerification(user); setMessage("Compte créé. Un e-mail de vérification t’a été envoyé. Pense à vérifier tes indésirables."); }
        catch { setMessage("Compte créé, mais l’e-mail de vérification n’a pas pu être envoyé. Tu pourras le renvoyer depuis Mon compte."); }
        router.replace("/mon-compte");
      } else if (mode === "connexion") {
        await signInWithEmailAndPassword(auth, email.trim(), motDePasse);
        router.replace(destination);
      } else {
        await sendPasswordResetEmail(auth, email.trim());
        setMessage("Si cette adresse correspond à un compte, un lien de réinitialisation a été envoyé.");
      }
    } catch (cause) { setErreur(messageFirebase(cause)); }
    finally { setChargement(false); }
  }

  return <section className="account-card"><p className="dashboard-kicker">TON ESPACE PERSONNEL</p><h1>{mode === "inscription" ? <>Créer un <span>compte.</span></> : mode === "oubli" ? <>Réinitialiser le <span>mot de passe.</span></> : <>Bon retour <span>chez toi.</span></>}</h1><p className="account-intro">{mode === "inscription" ? "Crée ton espace pour garder ton parcours sportif à portée de main." : mode === "oubli" ? "Nous t’enverrons un lien sécurisé pour choisir un nouveau mot de passe." : "Connecte-toi pour retrouver tes programmes et tes objectifs."}</p>
    <form className="account-form" onSubmit={soumettre}>
      {mode === "inscription" && <label>Nom ou pseudonyme<input autoComplete="nickname" maxLength={80} value={nom} onChange={(event) => setNom(event.target.value)} /></label>}
      <label>Adresse e-mail<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      {mode !== "oubli" && <label>Mot de passe<input type="password" autoComplete={mode === "inscription" ? "new-password" : "current-password"} minLength={mode === "inscription" ? 6 : undefined} required value={motDePasse} onChange={(event) => setMotDePasse(event.target.value)} /></label>}
      {mode === "inscription" && <label>Confirmer le mot de passe<input type="password" autoComplete="new-password" minLength={6} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>}
      {erreur && <p className="form-error" role="alert">{erreur}</p>}{message && <p className="account-message" role="status">{message}</p>}
      <button type="submit" className="primary-button account-submit" disabled={chargement}>{chargement ? "Patiente…" : mode === "inscription" ? "Créer mon compte" : mode === "oubli" ? "Envoyer le lien" : "Se connecter"}</button>
    </form>
    <div className="account-links">{mode === "inscription" ? <Link href="/auth">Déjà un compte ? Se connecter</Link> : mode === "oubli" ? <Link href="/auth">Retour à la connexion</Link> : <><Link href="/compte/mot-de-passe-oublie">Mot de passe oublié ?</Link><Link href="/auth?mode=inscription">Pas encore de compte ? S&apos;inscrire</Link></>}</div>
  </section>;
}
