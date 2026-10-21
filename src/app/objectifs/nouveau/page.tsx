"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORIES_OBJECTIF, UNITES_OBJECTIF, enregistrerObjectifs, lireObjectifs, type Objectif } from "@/lib/objectifs";

function dateLocale(dateISO: string) {
  if (!dateISO) return "";
  const [annee, mois, jour] = dateISO.split("-");
  return `${jour}/${mois}/${annee}`;
}

export default function NouvelObjectifPage() {
  const router = useRouter();
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [id, setId] = useState<string | null>(null);
  const [titre, setTitre] = useState("");
  const [categorie, setCategorie] = useState<(typeof CATEGORIES_OBJECTIF)[number]>("Haut du corps");
  const [dateDebut, setDateDebut] = useState("");
  const [actuelle, setActuelle] = useState("");
  const [cible, setCible] = useState("");
  const [unite, setUnite] = useState<(typeof UNITES_OBJECTIF)[number]>("Répétitions");
  const [erreur, setErreur] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const liste = lireObjectifs();
      setObjectifs(liste);
      const editId = new URLSearchParams(window.location.search).get("id");
      setId(editId);
      const objectif = liste.find((item) => item.id === editId);
      if (objectif) {
        setTitre(objectif.titre);
        setCategorie(objectif.categorie);
        setDateDebut(objectif.dateDebut);
        setActuelle(String(objectif.actuelle));
        setCible(String(objectif.cible));
        setUnite(objectif.unite);
      } else {
        setDateDebut(new Date().toLocaleDateString("sv-SE"));
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function sauvegarder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur("");
    const valeurActuelle = actuelle.trim() === "" ? 0 : Number(actuelle);
    const valeurCible = Number(cible);
    if (!titre.trim()) { setErreur("Saisis un titre pour ton objectif."); return; }
    if (!dateDebut) { setErreur("Choisis une date de début."); return; }
    if (!Number.isFinite(valeurCible) || valeurCible <= 0) { setErreur("La valeur cible doit être un nombre supérieur à zéro."); return; }
    if (!Number.isFinite(valeurActuelle) || valeurActuelle < 0) { setErreur("Le niveau actuel doit être un nombre positif ou égal à zéro."); return; }
    const objectif: Objectif = { id: id ?? (globalThis.crypto?.randomUUID?.() ?? String(Date.now())), titre: titre.trim(), categorie, dateDebut, actuelle: valeurActuelle, cible: valeurCible, unite };
    try {
      enregistrerObjectifs([...objectifs.filter((item) => item.id !== objectif.id), objectif]);
      setConfirmation(true);
      window.setTimeout(() => router.push("/objectifs"), 900);
    } catch { setErreur("Impossible d’enregistrer cet objectif sur cet appareil. Réessaie."); }
  }

  return <main className="planner-shell dashboard-shell"><header className="topbar"><Link href="/" aria-label="FITRACK, accueil"><Image src="/fitrack-logo.svg" alt="FITRACK" width={420} height={290} className="brand-logo" /></Link><Link href="/objectifs" className="planner-header-link">MES OBJECTIFS <span aria-hidden="true">↗</span></Link></header>
    <section className="planner-intro dashboard-intro"><p className="eyebrow"><span className="status-dot"/> UN PAS APRÈS L’AUTRE</p><h1>{id ? "Mets à jour" : "Nouvel"} <span>objectif.</span></h1><p>Définis une cible mesurable et garde le cap.</p></section>
    <form className="goal-form" onSubmit={sauvegarder} noValidate>
      <label htmlFor="goal-title">Titre de l’objectif<input id="goal-title" required maxLength={100} value={titre} onChange={(event) => setTitre(event.target.value)} placeholder="Ex. Réussir 20 tractions" /></label>
      <label htmlFor="goal-category">Catégorie<select id="goal-category" value={categorie} onChange={(event) => setCategorie(event.target.value as (typeof CATEGORIES_OBJECTIF)[number])}>{CATEGORIES_OBJECTIF.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label htmlFor="goal-start">Date de début<span className="goal-date-control"><input id="goal-start" type="date" required value={dateDebut} onChange={(event) => setDateDebut(event.target.value)} /><span aria-hidden="true">▣</span></span><small className="goal-date-preview">{dateLocale(dateDebut) || "Choisir une date"} · JJ/MM/AAAA</small></label>
      <div className="goal-form-values"><label htmlFor="goal-target">Valeur cible<input id="goal-target" required type="number" min="0.01" step="any" value={cible} onChange={(event) => setCible(event.target.value)} placeholder="Ex. 20" /></label><label htmlFor="goal-unit">Unité de mesure<select id="goal-unit" value={unite} onChange={(event) => setUnite(event.target.value as (typeof UNITES_OBJECTIF)[number])}>{UNITES_OBJECTIF.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div>
      <label htmlFor="goal-current">Niveau actuel <span className="goal-optional">(facultatif, 0 par défaut)</span><input id="goal-current" type="number" min="0" step="any" value={actuelle} onChange={(event) => setActuelle(event.target.value)} placeholder="0" /></label>
      {erreur && <p className="form-error" role="alert">{erreur}</p>}{confirmation && <p className="goal-success" role="status">Objectif enregistré. Redirection vers Mes objectifs…</p>}
      <button type="submit" className="primary-button" disabled={confirmation}>{id ? "Enregistrer les modifications" : "Créer mon objectif"} <span aria-hidden="true" className="button-arrow">↗</span></button>
    </form>
    <footer className="page-footer"><span>FITRACK © 2026</span><span>FAIT POUR AVANCER.</span></footer></main>;
}
