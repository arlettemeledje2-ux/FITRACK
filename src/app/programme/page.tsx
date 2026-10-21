import Link from "next/link";

export default function ProgrammePage() {
  return (
    <main className="destination-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="FITRACK, accueil">
          <svg aria-hidden="true" viewBox="0 0 40 40" className="brand-mark">
            <rect width="40" height="40" rx="14" fill="currentColor" />
            <path d="M11 23.5 17.5 17l5 5L29 15.5M22.5 15.5H29V22" fill="none" stroke="#F8FAF9" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>FITRACK</span>
        </Link>
      </header>
      <section className="destination-card">
        <p className="eyebrow"><span className="status-dot" /> TON PROCHAIN DÉPART</p>
        <h1>Ton programme commence ici.</h1>
        <p>La création de ton programme arrive bientôt. En attendant, tu peux retourner à l’accueil.</p>
        <Link href="/" className="primary-button">Retour à l’accueil <span aria-hidden="true" className="button-arrow">↗</span></Link>
      </section>
    </main>
  );
}
