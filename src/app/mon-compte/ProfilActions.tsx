"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, sendEmailVerification, signOut, updateProfile, type User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { messageFirebase } from "@/lib/firebase/erreurs";

export default function ProfilActions() {
  const [user, setUser] = useState<User | null>(null);
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [chargement, setChargement] = useState(true);
  const router = useRouter();
  useEffect(() => {
    let actif = true;
    try {
      const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (compte) => {
        if (!compte) { router.replace("/auth?next=/mon-compte"); return; }
        setUser(compte);
        try {
          const profil = await getDoc(doc(getFirebaseDb(), "users", compte.uid, "private", "profile"));
          if (actif) setNom(typeof profil.data()?.displayName === "string" ? profil.data()!.displayName : compte.displayName ?? "");
        } catch (cause) { if (actif) { setNom(compte.displayName ?? ""); setErreur(messageFirebase(cause)); } }
        if (actif) setChargement(false);
      }, (cause) => { if (actif) { setErreur(messageFirebase(cause)); setChargement(false); } });
      return () => { actif = false; unsubscribe(); };
    } catch (cause) { const timer = window.setTimeout(() => { setErreur(messageFirebase(cause)); setChargement(false); }, 0); return () => { actif = false; window.clearTimeout(timer); }; }
  }, [router]);
  async function enregistrer() {
    if (!user) return;
    setErreur(""); setMessage(""); setChargement(true);
    try {
      await setDoc(doc(getFirebaseDb(), "users", user.uid, "private", "profile"), { displayName: nom.trim(), email: user.email ?? "" });
      await updateProfile(user, { displayName: nom.trim() });
      setMessage("Profil enregistré.");
    } catch (cause) { setErreur(messageFirebase(cause)); }
    finally { setChargement(false); }
  }
  async function deconnecter() {
    setErreur(""); setChargement(true);
    try { await signOut(getFirebaseAuth()); router.replace("/auth"); }
    catch (cause) { setErreur(messageFirebase(cause)); setChargement(false); }
  }
  async function verifier() {
    if (!user) return;
    setErreur(""); setMessage("");
    try { await user.reload(); if (getFirebaseAuth().currentUser?.emailVerified) { setUser(getFirebaseAuth().currentUser); setMessage("Adresse e-mail vérifiée."); return; } await sendEmailVerification(user); setMessage("E-mail de vérification envoyé."); }
    catch (cause) { setErreur(messageFirebase(cause)); }
  }
  if (!user) return <section className="account-profile"><p>{chargement ? "Chargement du compte…" : erreur || "Redirection vers la connexion…"}</p></section>;
  return <section className="account-profile"><p className="dashboard-kicker">PROFIL</p><h2>{nom || "Sportif ou sportive"}</h2><p>{user.email}</p><div className="account-form"><label>Nom ou pseudonyme<input maxLength={80} value={nom} onChange={(event) => setNom(event.target.value)}/></label>{erreur && <p className="form-error" role="alert">{erreur}</p>}{message && <p className="account-message" role="status">{message}</p>}<button type="button" className="primary-button" disabled={chargement} onClick={enregistrer}>Enregistrer les modifications</button>{!user.emailVerified && <button type="button" className="goal-secondary-button" onClick={verifier}>Renvoyer l’e-mail de vérification</button>}</div><div className="account-profile-actions"><Link href="/mes-donnees" className="goal-secondary-button">Mes données et import</Link><button type="button" className="account-logout" onClick={deconnecter} disabled={chargement}>Se déconnecter</button></div></section>;
}
