"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { lireProgramme, musclesPour, type Programme } from "@/lib/programme";

function Logo() {
  return <Link href="/" className="brand" aria-label="FITRACK, accueil"><Image src="/fitrack-mark.svg" alt="" width={270} height={250} className="brand-mark" /><span>FITRACK</span></Link>;
}

export default function MonProgrammePage() {
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setProgramme(lireProgramme());
      setPret(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="planner-shell saved-plan-shell">
      <header className="topbar"><Logo /><Link href="/programme" className="planner-header-link">MODIFIER <span aria-hidden="true">↗</span></Link></header>
      <section className="planner-intro"><p className="eyebrow"><span className="status-dot"/> TON PLAN PERSONNEL</p><h1>Mon <span>programme.</span></h1><p>Ton rythme, tes séances, ta progression. Tout commence ici.</p></section>
      {!pret ? <p className="saved-empty">Chargement de ton programme…</p> : !programme ? <section className="saved-empty"><h2>Ton premier programme t’attend.</h2><p>Choisis tes jours et tes entraînements pour construire un plan à ton image.</p><Link href="/programme" className="primary-button">Créer mon programme <span aria-hidden="true" className="button-arrow">↗</span></Link></section> : <>
        <section className="saved-summary"><span>TON RYTHME</span><strong>{programme.joursParSemaine} <small>jour{programme.joursParSemaine > 1 ? "s" : ""} / semaine</small></strong></section>
        <section className="saved-days" aria-label="Détail des entraînements de la semaine">{programme.jours.slice(0, programme.joursParSemaine).map((jour, index) => {
          const groupes = musclesPour(jour.categories).filter((muscle) => jour.muscles.includes(muscle));
          return <article className="saved-day-card" key={index}><div className="saved-day-heading"><span>JOUR {String(index + 1).padStart(2, "0")}</span><h2>Jour {index + 1}</h2></div><div className="saved-categories">{jour.categories.map((categorie) => <span className="saved-chip" key={categorie}>{categorie}</span>)}</div>{groupes.length > 0 && <div className="saved-muscles"><span>MUSCLES CHOISIS</span><p>{groupes.join(" · ")}</p></div>}</article>;
        })}</section>
        <p className="saved-date">{programme.modifieLe ? `Mis à jour le ${new Date(programme.modifieLe).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}` : "Programme enregistré sur cet appareil"}</p>
        <Link href="/programme" className="primary-button saved-edit-button">Modifier mon programme <span aria-hidden="true" className="button-arrow">↗</span></Link>
      </>}
      <footer className="page-footer"><span>FITRACK © 2026</span><span>FAIT POUR AVANCER.</span></footer>
    </main>
  );
}
