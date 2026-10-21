"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { enregistrerObjectifs, lireObjectifs, type Objectif } from "@/lib/objectifs";

export default function NouvelObjectifPage() {
  const router = useRouter();
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [id, setId] = useState<string | null>(null);
  const [titre, setTitre] = useState("");
  const [actuelle, setActuelle] = useState("0");
  const [cible, setCible] = useState("");
  const [unite, setUnite] = useState("répétitions");
  const [erreur, setErreur] = useState("");
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const liste = lireObjectifs();
      setObjectifs(liste);
      const editId = new URLSearchParams(window.location.search).get("id");
      setId(editId);
      const objectif = liste.find((item) => item.id === editId);
      if (objectif) { setTitre(objectif.titre); setActuelle(String(objectif.actuelle)); setCible(String(objectif.cible)); setUnite(objectif.unite); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  function sauvegarder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valeurActuelle = Number(actuelle); const valeurCible = Number(cible);
    if (!titre.trim() || !Number.isFinite(valeurActuelle) || !Number.isFinite(valeurCible) || valeurActuelle < 0 || valeurCible <= 0) { setErreur("Saisis un titre, une valeur actuelle positive ou nulle et une cible supérieure à zéro."); return; }
    const atteint = valeurActuelle >= valeurCible;
    const objectif: Objectif = { id: id ?? (globalThis.crypto?.randomUUID?.() ?? String(Date.now())), titre: titre.trim(), actuelle: valeurActuelle, cible: valeurCible, unite: unite.trim() || "unités", statut: atteint ? "termine" : "en-cours" };
    const autres = objectifs.filter((item) => item.id !== objectif.id);
    try { enregistrerObjectifs([...autres, objectif]); router.push("/objectifs"); } catch { setErreur("Impossible d’enregistrer cet objectif sur cet appareil."); }
  }
  return <main className="planner-shell dashboard-shell"><header className="topbar"><Link href="/" aria-label="FITRACK, accueil"><Image src="/fitrack-logo.svg" alt="FITRACK" width={420} height={290} className="brand-logo" /></Link><Link href="/objectifs" className="planner-header-link">MES OBJECTIFS <span aria-hidden="true">↗</span></Link></header>
    <section className="planner-intro dashboard-intro"><p className="eyebrow"><span className="status-dot"/> UN PAS APRÈS L’AUTRE</p><h1>{id ? "Mets à jour" : "Nouvel"} <span>objectif.</span></h1><p>Définis une cible mesurable et garde le cap.</p></section>
    <form className="goal-form" onSubmit={sauvegarder}><label>Nom de l’objectif<input required maxLength={80} value={titre} onChange={(event) => setTitre(event.target.value)} placeholder="Ex. Courir 5 km" /></label><div className="goal-form-values"><label>Valeur actuelle<input required type="number" min="0" step="any" value={actuelle} onChange={(event) => setActuelle(event.target.value)} /></label><label>Valeur cible<input required type="number" min="0.01" step="any" value={cible} onChange={(event) => setCible(event.target.value)} /></label></div><label>Unité<input required maxLength={24} value={unite} onChange={(event) => setUnite(event.target.value)} placeholder="km, kg, répétitions…" /></label>{erreur && <p className="form-error" role="alert">{erreur}</p>}<button type="submit" className="primary-button">Enregistrer l’objectif <span aria-hidden="true" className="button-arrow">↗</span></button></form>
    <footer className="page-footer"><span>FITRACK © 2026</span><span>FAIT POUR AVANCER.</span></footer></main>;
}
