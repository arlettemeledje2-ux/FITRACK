import { type User } from "firebase/auth";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./client";
import { CLE_PROGRAMME, lireProgramme, type Programme } from "@/lib/programme";
import { CLE_OBJECTIFS, lireObjectifs, type Objectif } from "@/lib/objectifs";

export type Donnees = { programme?: Programme; objectifs?: Objectif[]; notesSeances?: Record<string, string> };

export function utilisateurPret(): Promise<User | null> {
  return getFirebaseAuth().authStateReady().then(() => getFirebaseAuth().currentUser);
}

const reference = (uid: string) => doc(getFirebaseDb(), "users", uid, "private", "data");

export async function lireDonnees(): Promise<Donnees> {
  const user = await utilisateurPret();
  if (!user) return { programme: lireProgramme() ?? undefined, objectifs: lireObjectifs(), notesSeances: Object.fromEntries(Array.from({ length: 7 }, (_, i) => [`jour-${i}`, window.localStorage.getItem(`fitrack-notes-seance-${i}`)]).filter((item): item is [string, string] => item[1] !== null)) };
  const snapshot = await getDoc(reference(user.uid));
  return snapshot.exists() ? snapshot.data() as Donnees : {};
}

// Mise à jour transactionnelle : les sections non modifiées ne sont jamais remplacées.
export async function modifierDonnees(modifier: (data: Donnees) => Donnees): Promise<Donnees> {
  const user = await utilisateurPret();
  if (!user) {
    const result = modifier(await lireDonnees());
    if (result.programme) window.localStorage.setItem(CLE_PROGRAMME, JSON.stringify(result.programme));
    if (result.objectifs) window.localStorage.setItem(CLE_OBJECTIFS, JSON.stringify(result.objectifs));
    if (result.notesSeances) for (const [cle, valeur] of Object.entries(result.notesSeances)) {
      if (valeur) window.localStorage.setItem(`fitrack-notes-seance-${cle.replace("jour-", "")}`, valeur);
      else window.localStorage.removeItem(`fitrack-notes-seance-${cle.replace("jour-", "")}`);
    }
    return result;
  }
  return runTransaction(getFirebaseDb(), async (transaction) => {
    const ref = reference(user.uid);
    const snapshot = await transaction.get(ref);
    const result = modifier(snapshot.exists() ? snapshot.data() as Donnees : {});
    transaction.set(ref, JSON.parse(JSON.stringify(result)) as Donnees);
    return result;
  });
}

export async function importerDonnees(locales: Donnees): Promise<Donnees> {
  const user = await utilisateurPret();
  if (!user) throw new Error("Connecte-toi avant d’importer tes données.");
  const ref = reference(user.uid);
  return runTransaction(getFirebaseDb(), async (transaction) => {
    const snapshot = await transaction.get(ref);
    const distant = snapshot.exists() ? snapshot.data() as Donnees : {};
    const ajout: Donnees = {};
    if (locales.programme) {
      if (distant.programme && JSON.stringify(distant.programme) !== JSON.stringify(locales.programme)) throw new Error("Import interrompu : un programme différent existe déjà dans ton compte. Rien n’a été remplacé.");
      if (!distant.programme) ajout.programme = locales.programme;
    }
    if (locales.objectifs?.length) {
      const existants = distant.objectifs ?? [];
      for (const objectif of locales.objectifs) {
        const courant = existants.find((item) => item.id === objectif.id);
        if (courant && JSON.stringify(courant) !== JSON.stringify(objectif)) throw new Error(`Import interrompu : l’objectif « ${objectif.titre} » existe avec des valeurs différentes. Rien n’a été remplacé.`);
      }
      ajout.objectifs = [...existants, ...locales.objectifs.filter((item) => !existants.some((courant) => courant.id === item.id))];
    }
    const notes = { ...distant.notesSeances };
    for (const [cle, valeur] of Object.entries(locales.notesSeances ?? {})) {
      if (notes[cle] !== undefined && notes[cle] !== valeur) throw new Error("Import interrompu : une note de séance différente existe déjà. Rien n’a été remplacé.");
      notes[cle] = valeur;
    }
    if (Object.keys(notes).length) ajout.notesSeances = notes;
    const result = { ...distant, ...ajout };
    if (Object.keys(ajout).length) transaction.set(ref, JSON.parse(JSON.stringify(result)) as Donnees);
    return result;
  });
}
