"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { CATEGORIES, JOURS_SEMAINE, creerJours, lireProgramme, musclesPour, type Categorie, type Muscle, type Programme } from "@/lib/programme";

export default function ProgrammePage() {
  const router = useRouter();
  const [joursParSemaine, setJoursParSemaine] = useState(3);
  const [jours, setJours] = useState(() => creerJours());
  const [pret, setPret] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = lireProgramme();
      if (saved) {
        setJoursParSemaine(saved.joursParSemaine);
        setJours(saved.jours);
      }
      setPret(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function changerNombre(nouveauNombre: number) {
    if (nouveauNombre < 1 || nouveauNombre > 7 || nouveauNombre === joursParSemaine) return;
    if (nouveauNombre < joursParSemaine) {
      const joursSupprimes = jours.slice(nouveauNombre, joursParSemaine);
      const contientDesChoix = joursSupprimes.some((jour) => jour.categories.length > 0 || jour.muscles.length > 0 || jour.exercices.length > 0);
      if (contientDesChoix && !window.confirm(`Réduire à ${nouveauNombre} jour${nouveauNombre > 1 ? "s" : ""} supprimera les choix des jours ${nouveauNombre + 1} à ${joursParSemaine}. Continuer ?`)) return;
      setJours((actuels) => actuels.map((jour, index) => index < nouveauNombre ? jour : { categories: [], muscles: [], exercices: [] }));
    }
    setJoursParSemaine(nouveauNombre);
    setErreur("");
  }

  function modifierJourSemaine(indexJour: number, valeur: string) {
    if (valeur && jours.some((jour, index) => index !== indexJour && jour.jourSemaine === valeur)) {
      setErreur("Chaque séance doit avoir un jour différent.");
      return;
    }
    setJours((actuels) => actuels.map((jour, index) => index === indexJour ? { ...jour, jourSemaine: valeur ? valorJour(valeur) : undefined } : jour));
    setErreur("");
  }

  function valorJour(valeur: string) { return valeur as (typeof JOURS_SEMAINE)[number]; }

  function modifierCategorie(indexJour: number, categorie: Categorie) {
    setJours((actuels) => actuels.map((jour, index) => {
      if (index !== indexJour) return jour;
      const categories = jour.categories.includes(categorie) ? jour.categories.filter((item) => item !== categorie) : [...jour.categories, categorie];
      const autorises = musclesPour(categories);
      return { ...jour, categories, muscles: jour.muscles.filter((muscle) => autorises.includes(muscle)) };
    }));
    setErreur("");
  }

  function modifierMuscle(indexJour: number, muscle: Muscle) {
    setJours((actuels) => actuels.map((jour, index) => index !== indexJour ? jour : ({
      ...jour,
      muscles: jour.muscles.includes(muscle) ? jour.muscles.filter((item) => item !== muscle) : [...jour.muscles, muscle],
    })));
  }

  function enregistrer() {
    const jourIncomplet = jours.slice(0, joursParSemaine).findIndex((jour) => jour.categories.length === 0);
    if (jourIncomplet !== -1) {
      setErreur(`Choisis au moins un type d’entraînement pour le Jour ${jourIncomplet + 1}.`);
      document.getElementById(`jour-${jourIncomplet + 1}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const jourDuplique = jours.slice(0, joursParSemaine).findIndex((jour, index, liste) => Boolean(jour.jourSemaine && liste.some((autre, autreIndex) => autreIndex !== index && autre.jourSemaine === jour.jourSemaine)));
    if (jourDuplique !== -1) { setErreur("Chaque séance doit avoir un jour différent."); return; }
    const programme: Programme = { joursParSemaine, jours, modifieLe: new Date().toISOString() };
    try {
      window.localStorage.setItem("fitrack-programme", JSON.stringify(programme));
      router.push("/mon-programme");
    } catch {
      setErreur("Impossible d’enregistrer sur cet appareil. Vérifie l’espace disponible dans ton navigateur.");
    }
  }

  return (
    <main className="planner-shell">
      <Navigation />
      <section className="planner-intro"><p className="eyebrow"><span className="status-dot"/> TON PLAN, À TA FAÇON</p><h1>Construis un programme <span>qui te ressemble.</span></h1><p>Choisis ton rythme, tes entraînements et les muscles que tu veux travailler.</p></section>

      <section className="planner-section days-section" aria-labelledby="days-title">
        <div className="section-kicker"><span>01</span><span>TON RYTHME</span></div>
        <h2 id="days-title">Combien de jours souhaites-tu t’entraîner par semaine ?</h2>
        <div className="day-stepper" aria-label="Nombre de jours d'entraînement par semaine">
          <button type="button" className="stepper-button" aria-label="Diminuer le nombre de jours" disabled={joursParSemaine <= 1} onClick={() => changerNombre(joursParSemaine - 1)}>‹</button>
          <div className="stepper-value"><strong>{joursParSemaine}</strong><span>JOUR{joursParSemaine > 1 ? "S" : ""} / SEMAINE</span></div>
          <button type="button" className="stepper-button" aria-label="Augmenter le nombre de jours" disabled={joursParSemaine >= 7} onClick={() => changerNombre(joursParSemaine + 1)}>›</button>
        </div>
        <div className="week-dots" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <span key={index} className={index < joursParSemaine ? "week-dot week-dot-active" : "week-dot"}/>)}</div>
      </section>

      <section className="planner-section training-section" aria-labelledby="training-title">
        <div className="section-kicker"><span>02</span><span>TES SÉANCES</span></div>
        <h2 id="training-title">Quels types d’entraînement te tentent ?</h2>
        <p className="section-description">Tu peux choisir plusieurs catégories par jour.</p>
        <div className="training-grid">{jours.map((jour, index) => {
          const actif = index < joursParSemaine;
          const musclesDisponibles = musclesPour(jour.categories);
          return <article id={`jour-${index + 1}`} className={`training-card${actif ? "" : " training-card-disabled"}`} key={index}>
            <div className="training-card-heading"><h3>Jour {index + 1}</h3><span>{actif ? String(index + 1).padStart(2, "0") : "REPOS"}</span></div>
            {actif && <div className="session-schedule-fields"><label>Jour de la semaine<select value={jour.jourSemaine ?? ""} onChange={(event) => modifierJourSemaine(index, event.target.value)}><option value="">Non défini</option>{JOURS_SEMAINE.map((nom) => <option key={nom} value={nom} disabled={jours.some((autre, autreIndex) => autreIndex !== index && autre.jourSemaine === nom)}>{nom[0].toUpperCase() + nom.slice(1)}</option>)}</select></label><label>Date précise <span className="goal-optional">facultative</span><input type="date" value={jour.date ?? ""} onChange={(event) => setJours((actuels) => actuels.map((item, position) => position === index ? { ...item, date: event.target.value || undefined } : item))}/></label></div>}
            <fieldset disabled={!actif} className="check-list"><legend className="sr-only">Types d’entraînement du jour {index + 1}</legend>{CATEGORIES.map((categorie) => <label className="check-row" key={categorie}><input type="checkbox" checked={actif && jour.categories.includes(categorie)} onChange={() => modifierCategorie(index, categorie)}/><span className="custom-check" aria-hidden="true"/><span>{categorie}</span></label>)}</fieldset>
            {actif && musclesDisponibles.length > 0 && <div className="muscle-area"><p className="muscle-title">MUSCLES TRAVAILLÉS</p><fieldset className="muscle-list"><legend className="sr-only">Muscles travaillés le jour {index + 1}</legend>{musclesDisponibles.map((muscle) => <label className="muscle-chip" key={muscle}><input type="checkbox" checked={jour.muscles.includes(muscle)} onChange={() => modifierMuscle(index, muscle)}/><span>{muscle}</span></label>)}</fieldset></div>}
          </article>;
        })}</div>
      </section>

      <section className="planner-section save-section" aria-labelledby="save-title">
        <div className="section-kicker"><span>03</span><span>TON PROGRAMME</span></div>
        <h2 id="save-title">Prêt à passer à l’action ?</h2>
        <p className="section-description">Tes choix restent enregistrés sur cet appareil. Tu pourras les modifier à tout moment.</p>
        {erreur && <p className="form-error" role="alert">{erreur}</p>}
        <button type="button" className="primary-button save-button" onClick={enregistrer} disabled={!pret}>Enregistrer mon programme <span aria-hidden="true" className="button-arrow">↗</span></button>
      </section>
      <footer className="page-footer"><span>FITRACK © 2026</span><span>FAIT POUR AVANCER.</span></footer>
    </main>
  );
}
