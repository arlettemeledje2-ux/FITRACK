"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CLE_PROGRAMME, JOURS_SEMAINE, lireProgramme, type Programme, type JourProgramme, type Exercice } from "@/lib/programme";
import { lireObjectifs, type Objectif } from "@/lib/objectifs";

function Logo() {
  return <Link href="/" className="brand" aria-label="FITRACK, accueil"><Image src="/fitrack-logo.svg" alt="FITRACK" width={420} height={290} className="brand-logo" /></Link>;
}

function CarteSeance({ jour, index, label, initialementOuvert = false }: { jour: JourProgramme; index: number; label: string; initialementOuvert?: boolean }) {
  const [ouverte, setOuverte] = useState(initialementOuvert);
  const [note, setNote] = useState("");
  const [noteEditee, setNoteEditee] = useState("");
  const [notesOuvertes, setNotesOuvertes] = useState(false);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [exerciceEdite, setExerciceEdite] = useState<string | null>(null);
  const [nomExercice, setNomExercice] = useState("");
  const [series, setSeries] = useState("3");
  const [repetitions, setRepetitions] = useState("10");
  const [repos, setRepos] = useState("60");
  const [charge, setCharge] = useState("");
  const [exercices, setExercices] = useState<Exercice[]>(jour.exercices);
  const [dateSeance, setDateSeance] = useState(jour.date ?? "");
  const muscles = jour.muscles;
  const cleNotes = `fitrack-notes-seance-${index}`;
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setNote(window.localStorage.getItem(cleNotes) ?? ""));
    return () => window.cancelAnimationFrame(frame);
  }, [cleNotes]);
  function modifierDate(date: string) {
    const programme = lireProgramme();
    if (!programme) return;
    programme.jours[index].date = date || undefined;
    window.localStorage.setItem(CLE_PROGRAMME, JSON.stringify({ ...programme, modifieLe: new Date().toISOString() }));
    setDateSeance(date);
    window.dispatchEvent(new Event("fitrack-programme-modifie"));
  }
  function enregistrerNote() {
    const texte = noteEditee.trim();
    if (texte) window.localStorage.setItem(cleNotes, texte);
    else window.localStorage.removeItem(cleNotes);
    setNote(texte);
    setNotesOuvertes(false);
  }
  function ouvrirFormulaire(exercice?: Exercice) {
    setExerciceEdite(exercice?.id ?? null);
    setNomExercice(exercice?.nom ?? "");
    setSeries(String(exercice?.series ?? 3));
    setRepetitions(String(exercice?.repetitions ?? 10));
    setRepos(String(exercice?.repos ?? 60));
    setCharge(exercice?.charge === undefined ? "" : String(exercice.charge));
    setFormulaireOuvert(true);
  }
  function sauvegarderExercice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const exercice: Exercice = { id: exerciceEdite ?? crypto.randomUUID(), nom: nomExercice.trim(), series: Number(series), repetitions: Number(repetitions), repos: Number(repos), ...(charge.trim() ? { charge: Number(charge) } : {}) };
    try {
      const programme = lireProgramme();
      if (!programme) return;
      programme.jours[index].exercices = exerciceEdite ? programme.jours[index].exercices.map((item) => item.id === exerciceEdite ? exercice : item) : [...programme.jours[index].exercices, exercice];
      window.localStorage.setItem(CLE_PROGRAMME, JSON.stringify({ ...programme, modifieLe: new Date().toISOString() }));
      setExercices(programme.jours[index].exercices);
      setFormulaireOuvert(false);
      setExerciceEdite(null);
    } catch { window.alert("Impossible d’enregistrer l’exercice sur cet appareil."); }
  }
  function supprimerExercice(exercice: Exercice) {
    if (!window.confirm(`Supprimer l’exercice « ${exercice.nom} » ?`)) return;
    const programme = lireProgramme();
    if (!programme) return;
    programme.jours[index].exercices = programme.jours[index].exercices.filter((item) => item.id !== exercice.id);
    window.localStorage.setItem(CLE_PROGRAMME, JSON.stringify({ ...programme, modifieLe: new Date().toISOString() }));
    setExercices(programme.jours[index].exercices);
    setFormulaireOuvert(false);
    setExerciceEdite(null);
    setOuverte(false);
    requestAnimationFrame(() => setOuverte(true));
  }
  const id = `details-seance-${label}-${index}`;
  return <article className={`dashboard-session${ouverte ? " dashboard-session-open" : ""}`}>
    <button type="button" className="dashboard-session-toggle" aria-expanded={ouverte} aria-controls={id} onClick={() => setOuverte(!ouverte)}>
      <span className="session-index">{String(index + 1).padStart(2, "0")}</span><span className="session-main"><strong>{label}</strong><span>{jour.date ? new Date(`${jour.date}T12:00:00`).toLocaleDateString("fr-FR") : jour.jourSemaine ? jour.jourSemaine[0].toUpperCase() + jour.jourSemaine.slice(1) : jour.categories.join(" + ")}</span></span><span className="session-chevron" aria-hidden="true">{ouverte ? "−" : "+"}</span>
    </button>
    {ouverte && <div className="dashboard-session-details" id={id}><label className="session-date-edit">Date précise <span className="goal-optional">facultative — remplace le jour hebdomadaire pour cette occurrence</span><input type="date" value={dateSeance} onChange={(event) => modifierDate(event.target.value)}/></label><span>CATÉGORIES D’ENTRAÎNEMENT</span><p>{jour.categories.join(" · ")}</p><span>GROUPES MUSCULAIRES</span>{muscles.length ? <p>{muscles.join(" · ")}</p> : <p>Aucun groupe musculaire sélectionné</p>}<section className="session-exercises"><div className="session-exercises-heading"><strong>Exercices</strong><button type="button" className="session-add-exercise" onClick={() => ouvrirFormulaire()}>+ Ajouter un exercice</button></div>{exercices.length ? <ul className="session-exercise-list">{exercices.map((exercice) => <li key={exercice.id}><div><strong>{exercice.nom}</strong><span>{exercice.series} séries × {exercice.repetitions} répétitions — Repos : {exercice.repos} s{exercice.charge !== undefined ? ` — Charge : ${exercice.charge} kg` : ""}</span></div><div className="session-exercise-actions"><button type="button" onClick={() => ouvrirFormulaire(exercice)}>Modifier</button><button type="button" onClick={() => supprimerExercice(exercice)}>Supprimer</button></div></li>)}</ul> : <p className="session-exercise-empty">Aucun exercice ajouté.</p>}{formulaireOuvert && <form className="session-exercise-form" onSubmit={sauvegarderExercice}><label>Nom de l’exercice<input required maxLength={100} value={nomExercice} onChange={(event) => setNomExercice(event.target.value)} /></label><div className="session-exercise-fields"><label>Séries<input required type="number" min="1" step="1" value={series} onChange={(event) => setSeries(event.target.value)} /></label><label>Répétitions<input required type="number" min="1" step="1" value={repetitions} onChange={(event) => setRepetitions(event.target.value)} /></label></div><label>Repos entre les séries (secondes)<input required type="number" min="0" step="1" value={repos} onChange={(event) => setRepos(event.target.value)} /></label><label>Charge (kg) <span className="goal-optional">facultatif</span><input type="number" min="0" step="any" value={charge} onChange={(event) => setCharge(event.target.value)} /></label><div className="goal-modal-actions"><button type="button" className="goal-secondary-button" onClick={() => { setFormulaireOuvert(false); setExerciceEdite(null); }}>Annuler</button><button type="submit" className="primary-button">Enregistrer l’exercice</button></div></form>}</section>{note && !notesOuvertes && <p className="goal-notes-preview">{note}</p>}<button type="button" className="session-notes-button" onClick={() => { setNoteEditee(note); setNotesOuvertes(true); }}>{note ? "Modifier les notes" : "Ajouter une note"}</button>{notesOuvertes && <div className="session-notes-editor"><label htmlFor={`notes-seance-${index}`}>Tes notes<textarea id={`notes-seance-${index}`} rows={4} maxLength={500} value={noteEditee} onChange={(event) => setNoteEditee(event.target.value)} placeholder="Écris une note pour cette séance…" /></label><div className="goal-modal-actions"><button type="button" className="goal-secondary-button" onClick={() => setNotesOuvertes(false)}>Annuler</button>{note && <button type="button" className="goal-secondary-button" onClick={() => { window.localStorage.removeItem(cleNotes); setNote(""); setNotesOuvertes(false); }}>Effacer</button>}<button type="button" className="primary-button" onClick={enregistrerNote}>Enregistrer</button></div></div>}</div>}
  </article>;
}

export default function MonProgrammePage() {
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [pret, setPret] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [maintenant, setMaintenant] = useState<Date | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setProgramme(lireProgramme());
      setObjectifs(lireObjectifs());
      setMaintenant(new Date());
      const actualiser = () => setProgramme(lireProgramme());
      window.addEventListener("fitrack-programme-modifie", actualiser);
      window.addEventListener("storage", actualiser);
      setPret(true);
    });
    return () => { window.cancelAnimationFrame(frame); };
  }, []);

  const seances = programme?.jours.slice(0, programme.joursParSemaine).map((jour, index) => ({ jour, index })).filter(({ jour }) => jour.categories.length > 0) ?? [];
  const aujourdHui = maintenant;
  const cleAujourdhui = aujourdHui ? `${aujourdHui.getFullYear()}-${String(aujourdHui.getMonth() + 1).padStart(2, "0")}-${String(aujourdHui.getDate()).padStart(2, "0")}` : "";
  const jourActuel = aujourdHui ? JOURS_SEMAINE[(aujourdHui.getDay() + 6) % 7] : null;
  const seanceAujourdhui = seances.find(({ jour }) => jour.date === cleAujourdhui || (!jour.date && jour.jourSemaine === jourActuel));
  const prochainement = seances.map((item) => {
    if (item.jour.date) return { ...item, ordre: item.jour.date };
    if (item.jour.jourSemaine && aujourdHui) { const delta = (JOURS_SEMAINE.indexOf(item.jour.jourSemaine) - (aujourdHui.getDay() + 6) % 7 + 7) % 7; const date = new Date(aujourdHui); date.setDate(date.getDate() + (delta || 7)); return { ...item, ordre: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}` }; }
    return { ...item, ordre: `9999-${String(item.index).padStart(2,"0")}` };
  }).filter(({ ordre }) => ordre >= cleAujourdhui).sort((a,b) => a.ordre.localeCompare(b.ordre));
  const progression = (objectif: Objectif) => Math.max(0, Math.min(100, Math.round((objectif.actuelle / objectif.cible) * 100)));

  return (
    <main className="planner-shell dashboard-shell">
      <header className="topbar"><Logo /><div className="dashboard-nav-wrap"><button type="button" className="dashboard-menu-button" aria-expanded={menuOuvert} aria-controls="dashboard-nav" onClick={() => setMenuOuvert(!menuOuvert)}><span>Navigation</span><span aria-hidden="true">{menuOuvert ? "×" : "☰"}</span></button><nav id="dashboard-nav" className={`dashboard-nav${menuOuvert ? " dashboard-nav-open" : ""}`} aria-label="Navigation principale"><Link href="/" onClick={() => setMenuOuvert(false)}>Accueil</Link><Link href="/mon-programme" aria-current="page" onClick={() => setMenuOuvert(false)}>Mon programme</Link><Link href="/objectifs/nouveau" onClick={() => setMenuOuvert(false)}>Nouvel objectif</Link><Link href="/objectifs" onClick={() => setMenuOuvert(false)}>Mes objectifs</Link></nav></div></header>
      <section className="planner-intro dashboard-intro"><p className="eyebrow"><span className="status-dot"/> TON ESPACE PERSONNEL</p><h1>Mon <span>programme.</span></h1><p>Retrouve tes objectifs et organise tes prochaines séances.</p></section>

      {!pret ? <p className="saved-empty">Chargement de ton tableau de bord…</p> : <>
        <section className="dashboard-section dashboard-objectives" aria-labelledby="objectives-title"><div className="dashboard-section-heading"><div><p className="dashboard-kicker">TES PROGRÈS</p><h2 id="objectives-title">Objectifs du moment</h2></div><Link href="/objectifs" className="dashboard-text-link">Voir les objectifs <span aria-hidden="true">→</span></Link></div>
          {objectifs.filter((objectif) => objectif.statut === "en-cours").length === 0 ? <p className="dashboard-empty">Aucun objectif en ce moment</p> : <div className="dashboard-objective-grid">{objectifs.filter((objectif) => objectif.statut === "en-cours").map((objectif) => <article className="dashboard-objective-card" key={objectif.id}><h3>{objectif.titre}</h3><div className="objective-values"><span><strong>{objectif.actuelle}</strong> {objectif.unite}</span><span>Objectif <strong>{objectif.cible}</strong> {objectif.unite}</span></div><div className="objective-progress-label"><span>Progression</span><span>{progression(objectif)}%</span></div><div className="objective-progress-track" role="progressbar" aria-label={`Progression de ${objectif.titre}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progression(objectif)}><span style={{ width: `${progression(objectif)}%` }}/></div></article>)}</div>}
        </section>

        <section className="dashboard-section" aria-labelledby="programme-title"><div className="dashboard-section-heading dashboard-program-heading"><div><p className="dashboard-kicker">TON PLAN HEBDOMADAIRE</p><h2 id="programme-title">Programme</h2></div>{programme && <div className="dashboard-rhythm"><strong>{programme.joursParSemaine}</strong><span>séances / semaine</span></div>}</div>
          {!programme ? <div className="dashboard-empty"><p>Crée ton programme pour retrouver tes séances ici.</p><Link href="/programme" className="dashboard-action-link">Créer mon programme →</Link></div> : <>
            <div className="dashboard-subsection"><div className="dashboard-subheading"><h3>Séance du jour</h3><span>{aujourdHui?.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase() ?? "CALENDRIER"}</span></div>{seanceAujourdhui ? <div className="dashboard-session-list"><CarteSeance jour={seanceAujourdhui.jour} index={seanceAujourdhui.index} label={`Séance ${seanceAujourdhui.index + 1}`} /></div> : <p className="dashboard-empty">Aucune séance prévue aujourd’hui</p>}</div>
            <div className="dashboard-subsection next-sessions"><div className="dashboard-subheading"><h3>Prochaines séances</h3><span>{prochainement.length ? `${prochainement.length} À VENIR` : "À VENIR"}</span></div>{prochainement.length ? <div className="dashboard-session-list">{prochainement.map(({ jour, index }) => <CarteSeance key={index} jour={jour} index={index} label={`Séance ${index + 1} · ${jour.date ? new Date(`${jour.date}T12:00:00`).toLocaleDateString("fr-FR") : jour.jourSemaine ? jour.jourSemaine[0].toUpperCase() + jour.jourSemaine.slice(1) : `Jour ${index + 1}`}`} />)}</div> : <p className="dashboard-empty">Aucune séance suivante n’est disponible dans ton programme.</p>}</div>
            <Link href="/programme" className="primary-button saved-edit-button">Modifier mon programme <span aria-hidden="true" className="button-arrow">↗</span></Link>
          </>}
        </section>
      </>}
      <footer className="page-footer"><span>FITRACK © 2026</span><span>FAIT POUR AVANCER.</span></footer>
    </main>
  );
}
