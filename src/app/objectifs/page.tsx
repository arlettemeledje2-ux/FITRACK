"use client";

import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useEffect, useRef, useState } from "react";
import Toast from "@/components/Toast";
import { calculerStatutObjectif, lireObjectifs, enregistrerObjectifs, CATEGORIES_OBJECTIF, type Objectif } from "@/lib/objectifs";

const CLE_SUPPRESSION = "fitrack-suppression-objectif";
const DELAI_SUPPRESSION = 6000;

function CarteObjectif({ objectif, statut, onModifier, onNotes, onSupprimer }: { objectif: Objectif; statut: string; onModifier: () => void; onNotes: () => void; onSupprimer: () => void }) {
  const pourcentage = Math.round(objectif.actuelle / objectif.cible * 100);
  const barre = Math.min(100, Math.max(0, pourcentage));
  return <article className="goal-card"><button type="button" className="goal-card-main" onClick={onModifier} aria-label={`Modifier l’objectif ${objectif.titre}`}><span className="goal-card-top"><span className={`goal-status-badge ${statut === "À venir" ? "goal-status-upcoming" : statut === "Atteint" ? "goal-status-complete" : "goal-status-active"}`}>{statut}</span><span className="goal-category">{objectif.categorie}</span></span><span className="goal-card-title">{objectif.titre}</span><span className="goal-date-line">Début le {objectif.dateDebut.split("-").reverse().join("/")}</span><span className="goal-card-values"><span><strong>{objectif.actuelle}</strong> {objectif.unite}</span><span>Cible <strong>{objectif.cible}</strong> {objectif.unite}</span></span>{statut === "En cours" && <><span className="objective-progress-label"><span>Progression</span><span>{pourcentage}%</span></span><span className="objective-progress-track" role="progressbar" aria-label={`Progression de ${objectif.titre}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={barre}><span style={{ width: `${barre}%` }}/></span></>}{objectif.notes && <span className="goal-notes-preview">{objectif.notes}</span>}</button><div className="goal-card-actions"><button type="button" onClick={onNotes}>Notes</button><button type="button" className="goal-delete-button" onClick={onSupprimer}>Supprimer</button></div></article>;
}

export default function ObjectifsPage() {
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [selection, setSelection] = useState<Objectif | null>(null);
  const [notesCible, setNotesCible] = useState<Objectif | null>(null);
  const [message, setMessage] = useState("");
  const [suppression, setSuppression] = useState<{ objectif: Objectif; echeance: number } | null>(null);
  const timerSuppression = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      let list = lireObjectifs();
      try {
        const pending = sessionStorage.getItem(CLE_SUPPRESSION);
        if (pending) {
          const data = JSON.parse(pending) as { objectif: Objectif; echeance: number };
          if (data.echeance > Date.now()) { list = list.filter((item) => item.id !== data.objectif.id); setSuppression(data); }
          else { list = list.filter((item) => item.id !== data.objectif.id); enregistrerObjectifs(list); sessionStorage.removeItem(CLE_SUPPRESSION); }
        }
      } catch { sessionStorage.removeItem(CLE_SUPPRESSION); }
      setObjectifs(list);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!suppression) return;
    const timer = setTimeout(() => {
      const latest = lireObjectifs().filter((item) => item.id !== suppression.objectif.id);
      enregistrerObjectifs(latest);
      if (sessionStorage.getItem(CLE_SUPPRESSION) === JSON.stringify(suppression)) sessionStorage.removeItem(CLE_SUPPRESSION);
      setObjectifs(latest);
      setSuppression(null);
    }, Math.max(0, suppression.echeance - Date.now()));
    timerSuppression.current = timer;
    return () => clearTimeout(timer);
  }, [suppression]);
  const groupes = [{ key: "en-cours", titre: "Objectifs en cours", vide: "Aucun objectif en cours" }, { key: "a-venir", titre: "Objectifs à venir", vide: "Aucun objectif à venir" }, { key: "atteint", titre: "Objectifs atteints", vide: "Aucun objectif atteint" }] as const;
  function sauvegarder(champs: Objectif) { const liste = objectifs.map((item) => item.id === champs.id ? { ...champs, statut: calculerStatutObjectif(champs) } : item); enregistrerObjectifs(liste); setObjectifs(lireObjectifs()); setSelection(null); setNotesCible(null); setMessage("Modifications enregistrées."); window.setTimeout(() => setMessage(""), 2500); }
  function supprimer(objectif: Objectif) {
    if (timerSuppression.current) clearTimeout(timerSuppression.current);
    const entree = { objectif, echeance: Date.now() + DELAI_SUPPRESSION };
    sessionStorage.setItem(CLE_SUPPRESSION, JSON.stringify(entree));
    setObjectifs((items) => items.filter((item) => item.id !== objectif.id));
    setSuppression(entree);
  }
  function annulerSuppression() {
    if (!suppression || suppression.echeance <= Date.now()) return;
    if (timerSuppression.current) clearTimeout(timerSuppression.current);
    const latest = lireObjectifs();
    if (!latest.some((item) => item.id === suppression.objectif.id)) latest.push(suppression.objectif);
    enregistrerObjectifs(latest);
    setObjectifs(latest);
    sessionStorage.removeItem(CLE_SUPPRESSION);
    setSuppression(null);
  }
  return <main className="planner-shell dashboard-shell"><Navigation/><section className="planner-intro dashboard-intro"><p className="eyebrow"><span className="status-dot"/> TON PARCOURS</p><h1>Mes <span>objectifs.</span></h1><p>Fixe une cible, suis ta progression et célèbre chaque étape.</p></section><div className="dashboard-section-heading goals-page-heading"><p className="dashboard-kicker goals-page-kicker">SUIVI PERSONNEL</p><Link href="/objectifs/nouveau" className="primary-button">+ Nouvel objectif</Link></div>{message && <p className="goal-success" role="status">{message}</p>}{groupes.map((groupe) => { const liste = objectifs.filter((objectif) => calculerStatutObjectif(objectif) === groupe.key); return <section className="dashboard-section goals-section" key={groupe.key}><div className="dashboard-section-heading"><div><p className="dashboard-kicker">{groupe.key === "en-cours" ? "EN ACTION" : groupe.key === "a-venir" ? "BIENTÔT" : "BRAVO"}</p><h2>{groupe.titre}</h2></div><span className="goal-count">{liste.length} objectif{liste.length === 1 ? "" : "s"}</span></div>{!liste.length ? <p className="dashboard-empty">{groupe.vide}</p> : <div className="dashboard-objective-grid">{liste.map((objectif) => <CarteObjectif key={objectif.id} objectif={objectif} statut={groupe.key === "en-cours" ? "En cours" : groupe.key === "a-venir" ? "À venir" : "Atteint"} onModifier={() => setSelection(objectif)} onNotes={() => setNotesCible(objectif)} onSupprimer={() => supprimer(objectif)} />)}</div>}</section>; })}<footer className="page-footer"><span>FITRACK © 2026</span><span>FAIT POUR AVANCER.</span></footer><Toast message={suppression ? "Objectif supprimé" : ""} action="Annuler" onAction={annulerSuppression}/>
    {selection && <div className="goal-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelection(null); }}><section className="goal-modal" role="dialog" aria-modal="true" aria-labelledby="goal-modal-title"><div className="goal-modal-heading"><div><p className="dashboard-kicker">MODIFIER TON PARCOURS</p><h2 id="goal-modal-title">Modifier l’objectif</h2></div><button type="button" className="goal-modal-close" aria-label="Fermer" onClick={() => setSelection(null)}>×</button></div><form className="goal-form goal-edit-form" onSubmit={(event) => { event.preventDefault(); sauvegarder(selection); }}><label htmlFor="edit-title">Titre de l’objectif<input id="edit-title" required maxLength={100} value={selection.titre} onChange={(event) => setSelection({ ...selection, titre: event.target.value })}/></label><label htmlFor="edit-category">Catégorie<select id="edit-category" value={selection.categorie} onChange={(event) => setSelection({ ...selection, categorie: event.target.value as Objectif["categorie"] })}>{CATEGORIES_OBJECTIF.map((categorie) => <option key={categorie}>{categorie}</option>)}</select></label><label htmlFor="edit-start">Date de début<input id="edit-start" type="date" required value={selection.dateDebut} onChange={(event) => setSelection({ ...selection, dateDebut: event.target.value })}/></label><div className="goal-form-values"><label htmlFor="edit-target">Valeur cible<input id="edit-target" required type="number" min="0.01" step="any" value={selection.cible} onChange={(event) => setSelection({ ...selection, cible: Number(event.target.value) })}/></label><label htmlFor="edit-current">Valeur actuelle<input id="edit-current" required type="number" min="0" step="any" value={selection.actuelle} onChange={(event) => setSelection({ ...selection, actuelle: Number(event.target.value) })}/></label></div><p className="goal-modal-progress">Progression calculée : {Math.round(selection.actuelle / selection.cible * 100)}%</p><div className="goal-modal-actions"><button type="button" className="goal-secondary-button" onClick={() => setSelection(null)}>Annuler</button><button type="submit" className="primary-button">Enregistrer</button></div></form></section></div>}
    {notesCible && <div className="goal-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setNotesCible(null); }}><section className="goal-modal goal-notes-modal" role="dialog" aria-modal="true" aria-labelledby="notes-modal-title"><div className="goal-modal-heading"><div><p className="dashboard-kicker">{notesCible.titre}</p><h2 id="notes-modal-title">Notes</h2></div><button type="button" className="goal-modal-close" aria-label="Fermer" onClick={() => setNotesCible(null)}>×</button></div><label className="goal-notes-label" htmlFor="goal-notes">Tes notes<textarea id="goal-notes" rows={5} maxLength={500} value={notesCible.notes ?? ""} onChange={(event) => setNotesCible({ ...notesCible, notes: event.target.value })} placeholder="Écris une note…"/></label><div className="goal-modal-actions"><button type="button" className="goal-secondary-button" onClick={() => setNotesCible(null)}>Annuler</button><button type="button" className="primary-button" onClick={() => sauvegarder(notesCible)}>Enregistrer les notes</button></div></section></div>}
  </main>;
}
