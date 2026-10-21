"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { lireProgramme, type Programme, type JourProgramme } from "@/lib/programme";
import { lireObjectifs, type Objectif } from "@/lib/objectifs";

function Logo() {
  return <Link href="/" className="brand" aria-label="FITRACK, accueil"><Image src="/fitrack-logo.svg" alt="FITRACK" width={420} height={290} className="brand-logo" /></Link>;
}

function CarteSeance({ jour, index, label, initialementOuvert = false }: { jour: JourProgramme; index: number; label: string; initialementOuvert?: boolean }) {
  const [ouverte, setOuverte] = useState(initialementOuvert);
  const muscles = jour.muscles;
  const id = `details-seance-${label}-${index}`;
  return <article className={`dashboard-session${ouverte ? " dashboard-session-open" : ""}`}>
    <button type="button" className="dashboard-session-toggle" aria-expanded={ouverte} aria-controls={id} onClick={() => setOuverte(!ouverte)}>
      <span className="session-index">{String(index + 1).padStart(2, "0")}</span><span className="session-main"><strong>{label}</strong><span>{jour.categories.join(" + ")}</span></span><span className="session-chevron" aria-hidden="true">{ouverte ? "−" : "+"}</span>
    </button>
    {ouverte && <div className="dashboard-session-details" id={id}><span>GROUPES MUSCULAIRES</span>{muscles.length ? <p>{muscles.join(" · ")}</p> : <p>Aucun groupe musculaire sélectionné</p>}</div>}
  </article>;
}

export default function MonProgrammePage() {
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [pret, setPret] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setProgramme(lireProgramme());
      setObjectifs(lireObjectifs());
      setPret(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const seances = programme?.jours.slice(0, programme.joursParSemaine).map((jour, index) => ({ jour, index })).filter(({ jour }) => jour.categories.length > 0) ?? [];
  const progression = (objectif: Objectif) => Math.max(0, Math.min(100, Math.round((objectif.actuelle / objectif.cible) * 100)));

  return (
    <main className="planner-shell dashboard-shell">
      <header className="topbar"><Logo /><div className="dashboard-nav-wrap"><button type="button" className="dashboard-menu-button" aria-expanded={menuOuvert} aria-controls="dashboard-nav" onClick={() => setMenuOuvert(!menuOuvert)}><span>Navigation</span><span aria-hidden="true">{menuOuvert ? "×" : "☰"}</span></button><nav id="dashboard-nav" className={`dashboard-nav${menuOuvert ? " dashboard-nav-open" : ""}`} aria-label="Navigation principale"><Link href="/" onClick={() => setMenuOuvert(false)}>Accueil</Link><Link href="/mon-programme" aria-current="page" onClick={() => setMenuOuvert(false)}>Mon programme</Link><Link href="/objectifs/nouveau" onClick={() => setMenuOuvert(false)}>Nouvel objectif</Link><Link href="/objectifs" onClick={() => setMenuOuvert(false)}>Mes objectifs</Link></nav></div></header>
      <section className="planner-intro dashboard-intro"><p className="eyebrow"><span className="status-dot"/> TON ESPACE PERSONNEL</p><h1>Mon <span>programme.</span></h1><p>Retrouve tes objectifs et organise tes prochaines séances.</p></section>

      {!pret ? <p className="saved-empty">Chargement de ton tableau de bord…</p> : <>
        <section className="dashboard-section dashboard-objectives" aria-labelledby="objectives-title"><div className="dashboard-section-heading"><div><p className="dashboard-kicker">TES PROGRÈS</p><h2 id="objectives-title">Objectifs du moment</h2></div><Link href="/objectifs" className="dashboard-text-link">Voir les objectifs <span aria-hidden="true">→</span></Link></div>
          {objectifs.length === 0 ? <p className="dashboard-empty">Aucun objectif en ce moment</p> : <div className="dashboard-objective-grid">{objectifs.map((objectif) => <article className="dashboard-objective-card" key={objectif.id}><h3>{objectif.titre}</h3><div className="objective-values"><span><strong>{objectif.actuelle}</strong> {objectif.unite}</span><span>Objectif <strong>{objectif.cible}</strong> {objectif.unite}</span></div><div className="objective-progress-label"><span>Progression</span><span>{progression(objectif)}%</span></div><div className="objective-progress-track" role="progressbar" aria-label={`Progression de ${objectif.titre}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progression(objectif)}><span style={{ width: `${progression(objectif)}%` }}/></div></article>)}</div>}
        </section>

        <section className="dashboard-section" aria-labelledby="programme-title"><div className="dashboard-section-heading dashboard-program-heading"><div><p className="dashboard-kicker">TON PLAN HEBDOMADAIRE</p><h2 id="programme-title">Programme</h2></div>{programme && <div className="dashboard-rhythm"><strong>{programme.joursParSemaine}</strong><span>séances / semaine</span></div>}</div>
          {!programme ? <div className="dashboard-empty"><p>Crée ton programme pour retrouver tes séances ici.</p><Link href="/programme" className="dashboard-action-link">Créer mon programme →</Link></div> : <>
            <div className="dashboard-subsection"><div className="dashboard-subheading"><h3>Séance du jour</h3><span>CALENDRIER NON CONFIGURÉ</span></div><p className="dashboard-empty">Aucune séance prévue aujourd’hui</p><p className="dashboard-note">Ton programme n’associe pas encore les séances à des jours du calendrier. Elles restent affichées dans leur ordre ci-dessous.</p></div>
            <div className="dashboard-subsection next-sessions"><div className="dashboard-subheading"><h3>Prochaines séances</h3><span>{seances.length ? `${seances.length} AU PROGRAMME` : "À VENIR"}</span></div>{seances.length ? <div className="dashboard-session-list">{seances.map(({ jour, index }) => <CarteSeance key={index} jour={jour} index={index} label={`Séance ${index + 1}`} />)}</div> : <p className="dashboard-empty">Aucune séance suivante n’est disponible dans ton programme.</p>}</div>
            <Link href="/programme" className="primary-button saved-edit-button">Modifier mon programme <span aria-hidden="true" className="button-arrow">↗</span></Link>
          </>}
        </section>
      </>}
      <footer className="page-footer"><span>FITRACK © 2026</span><span>FAIT POUR AVANCER.</span></footer>
    </main>
  );
}
