export const CATEGORIES = ["Haut du corps", "Bas du corps", "Cardio", "Mobilité"] as const;
export const MUSCLES_HAUT = ["Bras", "Dos", "Pectoraux", "Abdominaux", "Épaules"] as const;
export const MUSCLES_BAS = ["Quadriceps", "Ischio-jambiers", "Fessiers", "Mollets"] as const;

export type Categorie = (typeof CATEGORIES)[number];
export type Muscle = (typeof MUSCLES_HAUT)[number] | (typeof MUSCLES_BAS)[number];
export type JourProgramme = { categories: Categorie[]; muscles: Muscle[] };
export type Programme = { joursParSemaine: number; jours: JourProgramme[]; modifieLe: string };

export const CLE_PROGRAMME = "fitrack-programme";

export function creerJours(nombre = 7): JourProgramme[] {
  return Array.from({ length: nombre }, () => ({ categories: [], muscles: [] }));
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
