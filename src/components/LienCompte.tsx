"use client";

import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";

export default function LienCompte() {
  const [connecte, setConnecte] = useState(false);
  useEffect(() => {
    try { return onAuthStateChanged(getFirebaseAuth(), (user) => setConnecte(Boolean(user))); }
    catch { return; }
  }, []);
  return <Link href={connecte ? "/mon-compte" : "/auth?next=/mon-compte"} className="hero-account-link">TON ESPACE SPORTIF</Link>;
}
