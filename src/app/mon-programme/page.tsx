"use client";

import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useEffect, useState } from "react";
import { JOURS_SEMAINE, type Programme, type JourProgramme, type Exercice } from "@/lib/programme";
import { calculerStatutObjectif, type Objectif } from "@/lib/objectifs";
import { lireDonnees, modifierDonnees } from "@/lib/firebase/donnees";
import { messageFirebase } from "@/lib/firebase/erreurs";

function CarteSeance({ jour, index, label, dateOccurrence, noteInitiale = "", onErreur, initialementOuvert = false }: { jour: JourProgramme; index: number; label: string; dateOccurrence?: string; noteInitiale?: string; onErreur: (message: string) => void; initialementOuvert?: boolean }) {
  const [ouverte, setOuverte] = useState(initialementOuvert);
  const [note, setNote] = useState(noteInitiale);
  const [noteEditee, setNoteEditee] = useState("");
  const [notesOuvertes, setNotesOuvertes] = useState(false);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [exerciceEdite, setExerciceEdite] = useState<string | null>(null);
  const [nomExercice, setNomExercice] = useState("");
  const [series, setSeries] = useState("3");
  const [repetitions, setRepetitions] = useState("10");
  const [repos, setRepos] = useState("60");
  const [uniteRepos, setUniteRepos] = useState<"s" | "min">("s");
  const [charge, setCharge] = useState("");
  const [exercices, setExercices] = useState<Exercice[]>(jour.exercices);
  const [dateSeance, setDateSeance] = useState(jour.date ?? "");
  const [dateModificationOuverte, setDateModificationOuverte] = useState(false);
  const muscles = jour.muscles;
  async function modifierDate(date: string) {
    try {
      await modifierDonnees((data) => {
        if (!data.programme) return data;
        const jours = data.programme.jours.map((item, position) => position === index ? { ...item, date: date || undefined } : item);
        return { ...data, programme: { ...data.programme, jours, modifieLe: new Date().toISOString() } };
      });
      setDateSeance(date);
    } catch (cause) { onErreur(messageFirebase(cause)); }
  }
  async function enregistrerNote() {
    const texte = noteEditee.trim();
    try {
      await modifierDonnees((data) => ({ ...data, notesSeances: { ...data.notesSeances, [`jour-${index}`]: texte } }));
      setNote(texte); setNotesOuvertes(false);
    } catch (cause) { onErreur(messageFirebase(cause)); }
  }
  function ouvrirFormulaire(exercice?: Exercice) {
    setExerciceEdite(exercice?.id ?? null);
    setNomExercice(exercice?.nom ?? "");
    setSeries(String(exercice?.series ?? 3));
    setRepetitions(String(exercice?.repetitions ?? 10));
    const reposSeconde = exercice?.repos ?? 60;
    const minutes = reposSeconde > 0 && reposSeconde % 60 === 0;
    setUniteRepos(minutes ? "min" : "s");
    setRepos(String(minutes ? reposSeconde / 60 : reposSeconde));
    setCharge(exercice?.charge === undefined ? "" : String(exercice.charge));
    setFormulaireOuvert(true);
  }
  async function sauvegarderExercice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const exercice: Exercice = { id: exerciceEdite ?? crypto.randomUUID(), nom: nomExercice.trim(), series: Number(series), repetitions: Number(repetitions), repos: Number(repos) * (uniteRepos === "min" ? 60 : 1), ...(charge.trim() ? { charge: Number(charge) } : {}) };
    try {
      const data = await modifierDonnees((data) => {
        if (!data.programme) return data;
        const jours = data.programme.jours.map((item, position) => position !== index ? item : ({ ...item, exercices: exerciceEdite ? item.exercices.map((ex) => ex.id === exerciceEdite ? exercice : ex) : [...item.exercices, exercice] }));
        return { ...data, programme: { ...data.programme, jours, modifieLe: new Date().toISOString() } };
      });
      setExercices(data.programme?.jours[index].exercices ?? []);
      setFormulaireOuvert(false); setExerciceEdite(null);
    } catch (cause) { onErreur(messageFirebase(cause)); }
  }
  async function supprimerExercice(exercice: Exercice) {
    if (!window.confirm(`Supprimer l’exercice « ${exercice.nom} » ?`)) return;
    try {
      const data = await modifierDonnees((data) => {
        if (!data.programme) return data;
        const jours = data.programme.jours.map((item, position) => position !== index ? item : ({ ...item, exercices: item.exercices.filter((ex) => ex.id !== exercice.id) }));
        return { ...data, programme: { ...data.programme, jours, modifieLe: new Date().toISOString() } };
      });
      setExercices(data.programme?.jours[index].exercices ?? []);
      setFormulaireOuvert(false); setExerciceEdite(null);
      setOuverte(false); requestAnimationFrame(() => setOuverte(true));
    } catch (cause) { onErreur(messageFirebase(cause)); }
  }
  async function effacerNote() {
    try {
      await modifierDonnees((data) => ({ ...data, notesSeances: { ...data.notesSeances, [`jour-${index}`]: "" } }));
      setNote(""); setNotesOuvertes(false);
    } catch (cause) { onErreur(messageFirebase(cause)); }
  }
  const id = `details-seance-${label}-${index}`;
  return <article className={`dashboard-session${ouverte ? " dashboard-session-open" : ""}`}>
    <button type="button" className="dashboard-session-toggle" aria-expanded={ouverte} aria-controls={id} onClick={() => setOuverte(!ouverte)}>
      <span className="session-index">{String(index + 1).padStart(2, "0")}</span><span className="session-main"><strong>{label}</strong><span>{dateOccurrence ? (() => { const date = new Date(`${dateOccurrence}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }); return date.charAt(0).toUpperCase() + date.slice(1); })() : jour.jourSemaine ? jour.jourSemaine[0].toUpperCase() + jour.jourSemaine.slice(1) : `Jour ${index + 1}`}</span></span><span className="session-chevron" aria-hidden="true">{ouverte ? "−" : "+"}</span>
    </button>
    {ouverte && <div className="dashboard-session-details" id={id}><div className="session-detail-group"><span className="session-detail-title">CATÉGORIES D’ENTRAÎNEMENT</span><p>{jour.categories.join(" · ") || "Aucune catégorie sélectionnée"}</p></div><div className="session-detail-group"><span className="session-detail-title">GROUPES MUSCULAIRES</span>{muscles.length ? <p>{muscles.join(" · ")}</p> : <p>Aucun groupe musculaire sélectionné</p>}</div><div className="session-date-action"><button type="button" onClick={() => setDateModificationOuverte(!dateModificationOuverte)}>{dateSeance ? "Modifier la date" : "Ajouter une date précise"}</button>{dateModificationOuverte && <input aria-label="Date précise de la séance" type="date" value={dateSeance} onChange={(event) => modifierDate(event.target.value)}/>}</div><section className="session-exercises"><div className="session-exercises-heading"><strong>Exercices</strong><button type="button" className="session-add-exercise" onClick={() => ouvrirFormulaire()}>+ Ajouter un exercice</button></div>{exercices.length ? <ul className="session-exercise-list">{exercices.map((exercice) => <li key={exercice.id}><div><strong>{exercice.nom}</strong><span>{exercice.series} séries × {exercice.repetitions} répétitions — Repos : {exercice.repos >= 60 && exercice.repos % 60 === 0 ? `${exercice.repos / 60} min` : `${exercice.repos} s`}{exercice.charge !== undefined ? ` — Charge : ${exercice.charge} kg` : ""}</span></div><div className="session-exercise-actions"><button type="button" onClick={() => ouvrirFormulaire(exercice)}>Modifier</button><button type="button" onClick={() => supprimerExercice(exercice)}>Supprimer</button></div></li>)}</ul> : <p className="session-exercise-empty">Aucun exercice ajouté.</p>}{formulaireOuvert && <form className="session-exercise-form" onSubmit={sauvegarderExercice}><label>Nom de l’exercice<input required maxLength={100} value={nomExercice} onChange={(event) => setNomExercice(event.target.value)} /></label><div className="session-exercise-fields"><label>Séries<input required type="number" min="1" step="1" value={series} onChange={(event) => setSeries(event.target.value)} /></label><label>Répétitions<input required type="number" min="1" step="1" value={repetitions} onChange={(event) => setRepetitions(event.target.value)} /></label></div><div className="session-rest-control"><label htmlFor={`repos-${index}`}>Repos entre les séries</label><div className="session-rest-inputs"><input id={`repos-${index}`} required type="number" min="0" step="any" value={repos} onChange={(event) => setRepos(event.target.value)} /><select aria-label="Unité du repos" value={uniteRepos} onChange={(event) => setUniteRepos(event.target.value as "s" | "min")}><option value="s">Secondes (s)</option><option value="min">Minutes (min)</option></select></div></div><label>Charge (kg) <span className="goal-optional">facultatif</span><input type="number" min="0" step="any" value={charge} onChange={(event) => setCharge(event.target.value)} /></label><div className="goal-modal-actions"><button type="button" className="goal-secondary-button" onClick={() => { setFormulaireOuvert(false); setExerciceEdite(null); }}>Annuler</button><button type="submit" className="primary-button">Enregistrer l’exercice</button></div></form>}</section>{note && !notesOuvertes && <p className="goal-notes-preview">{note}</p>}<button type="button" className="session-notes-button" onClick={() => { setNoteEditee(note); setNotesOuvertes(true); }}>{note ? "Modifier les notes" : "Ajouter une note"}</button>{notesOuvertes && <div className="session-notes-editor"><label htmlFor={`notes-seance-${index}`}>Tes notes<textarea id={`notes-seance-${index}`} rows={4} maxLength={500} value={noteEditee} onChange={(event) => setNoteEditee(event.target.value)} placeholder="Écris une note pour cette séance…" /></label><div className="goal-modal-actions"><button type="button" className="goal-secondary-button" onClick={() => setNotesOuvertes(false)}>Annuler</button>{note && <button type="button" className="goal-secondary-button" onClick={effacerNote}>Effacer</button>}<button type="button" className="primary-button" onClick={enregistrerNote}>Enregistrer</button></div></div>}</div>}
  </article>;
}

export default function MonProgrammePage() {
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [pret, setPret] = useState(false);
  const [erreur, setErreur] = useState("");
  const [notesSeances, setNotesSeances] = useState<Record<string, string>>({});
  const [maintenant, setMaintenant] = useState<Date | null>(null);

  useEffect(() => {
    let actif = true;
    lireDonnees().then((data) => {
      if (!actif) return;
      setProgramme(data.programme ?? null);
      setObjectifs(data.objectifs ?? []);
      setNotesSeances(data.notesSeances ?? {});
      setMaintenant(new Date()); setPret(true);
    }).catch((cause) => { if (actif) { setErreur(messageFirebase(cause)); setPret(true); } });
    return () => { actif = false; };
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
      <Navigation />
      <section className="planner-intro dashboard-intro"><p className="eyebrow"><span className="status-dot"/> TON ESPACE PERSONNEL</p><h1>Mon <span>programme.</span></h1><p>Retrouve tes objectifs et organise tes prochaines séances.</p></section>

      {erreur && <p className="form-error" role="alert">{erreur}</p>}
      {!pret ? <p className="saved-empty">Chargement de ton tableau de bord…</p> : <>
        <section className="dashboard-section dashboard-objectives" aria-labelledby="objectives-title"><div className="dashboard-section-heading"><div><p className="dashboard-kicker">TES PROGRÈS</p><h2 id="objectives-title">Objectifs du moment</h2></div><Link href="/objectifs" className="dashboard-text-link">Voir les objectifs <span aria-hidden="true">→</span></Link></div>
          {objectifs.filter((objectif) => calculerStatutObjectif(objectif) === "en-cours").length === 0 ? <p className="dashboard-empty">Aucun objectif en ce moment</p> : <div className="dashboard-objective-grid">{objectifs.filter((objectif) => calculerStatutObjectif(objectif) === "en-cours").map((objectif) => <article className="dashboard-objective-card" key={objectif.id}><h3>{objectif.titre}</h3><div className="objective-values"><span><strong>{objectif.actuelle}</strong> {objectif.unite}</span><span>Objectif <strong>{objectif.cible}</strong> {objectif.unite}</span></div><div className="objective-progress-label"><span>Progression</span><span>{progression(objectif)}%</span></div><div className="objective-progress-track" role="progressbar" aria-label={`Progression de ${objectif.titre}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progression(objectif)}><span style={{ width: `${progression(objectif)}%` }}/></div></article>)}</div>}
        </section>

        <section className="dashboard-section" aria-labelledby="programme-title"><div className="dashboard-section-heading dashboard-program-heading"><div><p className="dashboard-kicker">TON PLAN HEBDOMADAIRE</p><h2 id="programme-title">Programme</h2></div>{programme && <div className="dashboard-rhythm"><strong>{programme.joursParSemaine}</strong><span>séances / semaine</span></div>}</div>
          {!programme ? <div className="dashboard-empty"><p>Crée ton programme pour retrouver tes séances ici.</p><Link href="/programme" className="dashboard-action-link">Créer mon programme →</Link></div> : <>
            <div className="dashboard-subsection"><div className="dashboard-subheading"><h3>Séance du jour</h3><span>{aujourdHui?.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase() ?? "CALENDRIER"}</span></div>{seanceAujourdhui ? <div className="dashboard-session-list"><CarteSeance key={`aujourdhui-${seanceAujourdhui.index}`} jour={seanceAujourdhui.jour} index={seanceAujourdhui.index} dateOccurrence={cleAujourdhui} label={`Séance ${seanceAujourdhui.index + 1}`} noteInitiale={notesSeances[`jour-${seanceAujourdhui.index}`]} onErreur={setErreur} /></div> : <p className="dashboard-empty">Aucune séance prévue aujourd’hui</p>}</div>
            <div className="dashboard-subsection next-sessions"><div className="dashboard-subheading"><h3>Prochaines séances</h3><span>{prochainement.length ? `${prochainement.length} À VENIR` : "À VENIR"}</span></div>{prochainement.length ? <div className="dashboard-session-list">{prochainement.map(({ jour, index, ordre }) => <CarteSeance key={index} jour={jour} index={index} dateOccurrence={ordre.startsWith("9999-") ? undefined : ordre} label={`Séance ${index + 1}`} noteInitiale={notesSeances[`jour-${index}`]} onErreur={setErreur} />)}</div> : <p className="dashboard-empty">Aucune séance suivante n’est disponible dans ton programme.</p>}</div>
            <Link href="/programme" className="primary-button saved-edit-button">Modifier mon programme <span aria-hidden="true" className="button-arrow">↗</span></Link>
          </>}
        </section>
      </>}
      <footer className="page-footer"><span>FITRACK © 2026</span><span>FAIT POUR AVANCER.</span></footer>
    </main>
  );
}
