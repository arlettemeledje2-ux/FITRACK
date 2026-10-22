import Link from "next/link";
import Navigation from "@/components/Navigation";
import LienCompte from "@/components/LienCompte";

const benefits = [
  { number: "01", title: "Planifier", detail: "Un programme qui te ressemble." },
  { number: "02", title: "S'entraîner", detail: "À ton rythme, chaque semaine." },
  { number: "03", title: "Progresser", detail: "Chaque effort compte." },
];

export default function Home() {
  return (
    <main className="home-shell">
      <Navigation />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <LienCompte/>
          <p className="eyebrow"><span className="status-dot" /> TON PROCHAIN DÉPART</p>
          <h1 id="hero-title">Chaque progrès commence <span>par un plan.</span></h1>
          <p className="hero-description">Organise tes entraînements, fixe tes objectifs et suis tes progrès, à ton rythme.</p>
          <Link href="/programme" className="primary-button">
            Créer mon programme <span aria-hidden="true" className="button-arrow">↗</span>
          </Link>
          <p className="hero-footnote"><span aria-hidden="true">✳</span> Un premier pas, puis un autre.</p>
        </div>

        <div className="visual-card" aria-label="Illustration de progression sportive">
          <div className="visual-topline"><span>TON RYTHME. TES OBJECTIFS.</span><span className="visual-sparkle">✳</span></div>
          <div className="orbit orbit-outer" /><div className="orbit orbit-inner" />
          <div className="figure-ground" />
          <svg className="runner" viewBox="0 0 300 300" role="img" aria-label="Silhouette stylisée d'une personne en mouvement">
            <circle cx="192" cy="58" r="23" fill="#172B3A" />
            <path d="M180 93c-17-5-31 4-39 19l-25 44 28 14 24-39 22 13 28 43 26-17-31-51c-6-10-18-20-33-26Z" fill="#50C9A7" />
            <path d="m143 121-43-18-36 15 8 17 33-8 28 23 10-29Z" fill="#172B3A" />
            <path d="m214 166 20 12 22 44-16 10-31-38-19-8 24-20Z" fill="#172B3A" />
            <path d="m162 173 22 12-14 48-38 39-18-15 31-42 17-42Z" fill="#172B3A" />
            <path d="m187 184 20 5 3 47 24 35-18 13-36-38-4-40 11-22Z" fill="#50C9A7" />
            <path d="m115 260 18 13-5 9h-37c-4 0-5-5-2-8l26-14Zm99 13 18-13 23 19c4 3 2 8-3 8h-34l-4-14Z" fill="#172B3A" />
          </svg>
          <div className="floating-note"><span className="note-icon">↗</span><span><strong>Un pas à la fois</strong><small>Le progrès t&apos;appartient.</small></span></div>
          <div className="visual-caption"><span>01 — EN MOUVEMENT</span><span>ALLER À TON RYTHME</span></div>
        </div>
      </section>

      <section className="benefits" aria-label="Les étapes de ta progression">
        <div className="benefits-heading"><span>LA MÉTHODE FITRACK</span><span>TOUT COMMENCE PAR TOI</span></div>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <article className="benefit" key={benefit.number}>
              <span className="benefit-number">{benefit.number}</span>
              <div><h2>{benefit.title}</h2><p>{benefit.detail}</p></div>
              <span className="benefit-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>
      <footer className="page-footer"><span>FITRACK © 2026</span><span>FAIT POUR AVANCER.</span></footer>
    </main>
  );
}
