export const CATEGORIES = ["Haut du corps", "Bas du corps", "Cardio", "Mobilité"] as const;
export const MUSCLES_HAUT = ["Bras", "Dos", "Pectoraux", "Abdominaux", "Épaules"] as const;
export const MUSCLES_BAS = ["Quadriceps", "Ischio-jambiers", "Fessiers", "Mollets"] as const;

export type Categorie = (typeof CATEGORIES)[number];
export type Muscle = (typeof MUSCLES_HAUT)[number] | (typeof MUSCLES_BAS)[number];
export type Exercice = { id: string; nom: string; series: number; repetitions: number; repos: number; charge?: number };
export const JOURS_SEMAINE = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] as const;
export type JourSemaine = (typeof JOURS_SEMAINE)[number];
export type JourProgramme = { categories: Categorie[]; muscles: Muscle[]; exercices: Exercice[]; jourSemaine?: JourSemaine; date?: string };
export type Programme = { joursParSemaine: number; jours: JourProgramme[]; modifieLe: string };

export const CLE_PROGRAMME = "fitrack-programme";

export function creerJours(nombre = 7): JourProgramme[] {
  return Array.from({ length: nombre }, () => ({ categories: [], muscles: [], exercices: [] }));
}

export function lireProgramme(): Programme | null {
  try {
    const raw = window.localStorage.getItem(CLE_PROGRAMME);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const programme = value as Partial<Programme>;
    if (!Number.isInteger(programme.joursParSemaine) || (programme.joursParSemaine ?? 0) < 1 || (programme.joursParSemaine ?? 0) > 7 || !Array.isArray(programme.jours)) return null;
    const jours = creerJours(7);
    programme.jours.slice(0, 7).forEach((jour, index) => {
      if (!jour || typeof jour !== "object") return;
      jours[index] = {
        categories: Array.isArray(jour.categories) ? jour.categories.filter((item): item is Categorie => CATEGORIES.includes(item)) : [],
        muscles: Array.isArray(jour.muscles) ? jour.muscles.filter((item): item is Muscle => [...MUSCLES_HAUT, ...MUSCLES_BAS].includes(item)) : [],
        exercices: Array.isArray(jour.exercices) ? jour.exercices.filter((item): item is Exercice => Boolean(item && typeof item === "object" && typeof item.id === "string" && typeof item.nom === "string" && item.nom.trim() && Number.isInteger(item.series) && item.series > 0 && Number.isInteger(item.repetitions) && item.repetitions > 0 && Number.isInteger(item.repos) && item.repos >= 0 && (item.charge === undefined || (Number.isFinite(item.charge) && item.charge >= 0)))) : [],
        ...(typeof jour.jourSemaine === "string" && JOURS_SEMAINE.includes(jour.jourSemaine as JourSemaine) ? { jourSemaine: jour.jourSemaine as JourSemaine } : {}),
        ...(typeof jour.date === "string" && /^\\d{4}-\\d{2}-\\d{2}$/.test(jour.date) ? { date: jour.date } : {}),
      };
    });
    return { joursParSemaine: programme.joursParSemaine!, jours, modifieLe: typeof programme.modifieLe === "string" ? programme.modifieLe : "" };
  } catch {
    return null;
  }
}

export function musclesPour(categories: Categorie[]): Muscle[] {
  return [
    ...(categories.includes("Haut du corps") ? MUSCLES_HAUT : []),
    ...(categories.includes("Bas du corps") ? MUSCLES_BAS : []),
  ];
}
