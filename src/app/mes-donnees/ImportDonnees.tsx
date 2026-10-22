"use client";

import { useEffect, useState } from "react";
import { importerDonnees, lireDonnees, utilisateurPret, type Donnees } from "@/lib/firebase/donnees";
import { lireProgramme } from "@/lib/programme";
import { lireObjectifs } from "@/lib/objectifs";
import { messageFirebase } from "@/lib/firebase/erreurs";

export default function ImportDonnees() {
  const [distantes, setDistantes] = useState<Donnees | null>(null);
  const [locales, setLocales] = useState<Donnees | null>(null);
  const [message, setMessage] = useState(""); const [erreur, setErreur] = useState(""); const [chargement, setChargement] = useState(false);
  useEffect(() => {
    let actif = true;
    const timer = window.setTimeout(async () => {
      try {
        const user = await utilisateurPret();
        if (!user) { window.location.replace("/auth?next=/mes-donnees"); return; }
        const notesSeances = Object.fromEntries(Array.from({ length: 7 }, (_, index) => [`jour-${index}`, window.localStorage.getItem(`fitrack-notes-seance-${index}`)]).filter((entry): entry is [string, string] => entry[1] !== null));
        if (actif) setLocales({ programme: lireProgramme() ?? undefined, objectifs: lireObjectifs(), notesSeances });
        const data = await lireDonnees();
        if (actif) setDistantes(data);
      } catch (cause) { if (actif) setErreur(messageFirebase(cause)); }
    }, 0);
    return () => { actif = false; window.clearTimeout(timer); };
  }, []);
  const aDesDonnees = Boolean(locales?.programme || locales?.objectifs?.length || Object.keys(locales?.notesSeances ?? {}).length);
  async function importer() {
    if (!locales) return;
    setErreur(""); setMessage(""); setChargement(true);
    try { setDistantes(await importerDonnees(locales)); setMessage("Import terminé. Les données d’origine restent sur cet appareil."); }
    catch (cause) { setErreur(messageFirebase(cause)); }
    finally { setChargement(false); }
  }
  return <section className="account-card account-data-card"><p className="dashboard-kicker">IMPORT EXPLICITE</p><h2>Données de cet appareil</h2><p className="account-intro">Aucune donnée locale n’est envoyée sans ton action. En cas de conflit, l’import s’arrête sans rien remplacer.</p><ul><li>Programme sportif : {locales?.programme ? "présent" : "aucun"}</li><li>Objectifs : {locales?.objectifs?.length ?? 0} trouvé(s)</li><li>Notes de séances : {Object.keys(locales?.notesSeances ?? {}).length} trouvé(s)</li></ul><h2>Données du compte</h2><p>{distantes && Object.keys(distantes).length ? "Des données personnelles sont déjà enregistrées dans ton compte." : "Aucune donnée enregistrée dans ton compte pour le moment."}</p>{erreur && <p className="form-error" role="alert">{erreur}</p>}{message && <p className="account-message" role="status">{message}</p>}<button type="button" className="primary-button account-submit" disabled={chargement || !aDesDonnees || !distantes} onClick={importer}>{chargement ? "Import en cours…" : "Importer sans remplacer"}</button></section>;
}
