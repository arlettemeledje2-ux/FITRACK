"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

const liens = [
  { href: "/", label: "Accueil" },
  { href: "/mon-programme", label: "Programme" },
  { href: "/objectifs/nouveau", label: "Nouvel objectif" },
  { href: "/objectifs", label: "Mes objectifs" },
  { href: "/mon-compte", label: "Mon compte" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [connecte, setConnecte] = useState(false);
  useEffect(() => {
    try { return onAuthStateChanged(getFirebaseAuth(), (user) => setConnecte(Boolean(user))); }
    catch { return; } // La navigation reste accessible même sans configuration Firebase.
  }, []);
  return <header className="topbar fitrack-topbar">
    <Link href="/" className="brand" aria-label="FITRACK, accueil"><Image src="/fitrack-logo.svg?v=2" alt="FITRACK" width={576} height={384} className="brand-logo" /></Link>
    <div className="fitrack-nav-wrap">
      <button type="button" className="fitrack-menu-button" aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOuvert} aria-controls="fitrack-navigation" onClick={() => setMenuOuvert(!menuOuvert)}><span aria-hidden="true">{menuOuvert ? "×" : "☰"}</span></button>
      <nav id="fitrack-navigation" className={`fitrack-nav${menuOuvert ? " fitrack-nav-open" : ""}`} aria-label="Navigation principale">
        {liens.map(({ href, label }) => <Link key={href} href={href === "/mon-compte" && !connecte ? "/auth?next=/mon-compte" : href} aria-current={pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)) ? "page" : undefined} onClick={() => setMenuOuvert(false)}>{label}</Link>)}
      </nav>
    </div>
  </header>;
}
