"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { calculerStatutObjectif, lireObjectifs, type Objectif } from "@/lib/objectifs";

export default function ObjectifsPage() {
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setObjectifs(lireObjectifs()));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const actifs = objectifs.filter((objectif) => calculerStatutObjectif(objectif) === "en-cours");
  const aVenir = objectifs.filter((objectif) => calculerStatutObjectif(objectif) === "a-venir");
  const termines = objectifs.filter((objectif) => calculerStatutObjectif(objectif) === "atteint");
  const progression = (objectif: Objectif) => Math.max(0, Math.min(100, Math.round(objectif.actuelle / objectif.cible * 100)));
  return <main className="planner-shell dashboard-shell"><header className="topbar"><Link href="/" aria-label="FITRACK, accueil"><Image src="/fitrack-logo.svg" alt="FITRACK" width={420} height={290} className="brand-logo" /></Link><Link href="/mon-programme" className="planner-header-link">MON PROGRAMME <span aria-hidden="true">↗</span></Link></header>
    <section className="planner-intro dashboard-intro"><p className="eyebrow"><span className="status-dot"/> TON PARCOURS</p><h1>Mes <span>objectifs.</span></h1><p>Fixe une cible, suis ta progression et célèbre chaque étape.</p></section>
    <section className="dashboard-section"><div className="dashboard-section-heading"><div><p className="dashboard-kicker">EN COURS</p><h2>Mes objectifs</h2></div><Link href="/objectifs/nouveau" className="primary-button">Nouvel objectif <span aria-hidden="true" className="button-arrow">+</span></Link></div>
      {!actifs.length ? <p className="dashboard-empty">Aucun objectif en ce moment. Crée un objectif pour commencer à suivre tes progrès.</p> : <div className="dashboard-objective-grid">{actifs.map((objectif) => <article className="dashboard-objective-card" key={objectif.id}><h3>{objectif.titre}</h3><p className="dashboard-note">{objectif.categorie} · Début le {objectif.dateDebut.split("-").reverse().join("/")}</p><span className="goal-status-badge">En cours</span><div className="objective-values"><span><strong>{objectif.actuelle}</strong> {objectif.unite}</span><span>Cible <strong>{objectif.cible}</strong> {objectif.unite}</span></div><div className="objective-progress-label"><span>Progression</span><span>{progression(objectif)}%</span></div><div className="objective-progress-track" role="progressbar" aria-label={`Progression de ${objectif.titre}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progression(objectif)}><span style={{ width: `${progression(objectif)}%` }}/></div><Link className="dashboard-action-link objective-update-link" href={`/objectifs/nouveau?id=${encodeURIComponent(objectif.id)}`}>Mettre à jour →</Link></article>)}</div>}
    </section>
    {aVenir.length > 0 && <section className="dashboard-section"><div className="dashboard-section-heading"><div><p className="dashboard-kicker">BIENTÔT</p><h2>Objectifs à venir</h2></div></div><div className="dashboard-objective-grid">{aVenir.map((objectif) => <article className="dashboard-objective-card" key={objectif.id}><span className="goal-status-badge goal-status-upcoming">À venir</span><h3>{objectif.titre}</h3><p className="dashboard-note">{objectif.categorie} · Début le {objectif.dateDebut.split("-").reverse().join("/")}</p><p className="dashboard-note">{objectif.actuelle} / {objectif.cible} {objectif.unite}</p></article>)}</div></section>}
    {termines.length > 0 && <section className="dashboard-section"><div className="dashboard-section-heading"><div><p className="dashboard-kicker">BRAVO</p><h2>Objectifs atteints</h2></div></div><div className="dashboard-objective-grid">{termines.map((objectif) => <article className="dashboard-objective-card" key={objectif.id}><span className="goal-status-badge goal-status-complete">Atteint</span><h3>{objectif.titre}</h3><p className="dashboard-note">{objectif.categorie} · Cible atteinte : {objectif.actuelle} / {objectif.cible} {objectif.unite}</p></article>)}</div></section>}
    <footer className="page-footer"><span>FITRACK © 2026</span><span>FAIT POUR AVANCER.</span></footer></main>;
}
