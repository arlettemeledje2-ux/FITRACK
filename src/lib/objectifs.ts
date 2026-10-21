export const CATEGORIES_OBJECTIF = ["Haut du corps", "Bas du corps", "Corps complet", "Cardio", "Mobilité"] as const;
export const UNITES_OBJECTIF = ["Répétitions", "Kilogrammes", "Minutes", "Kilomètres"] as const;
export type CategorieObjectif = (typeof CATEGORIES_OBJECTIF)[number];
export type UniteObjectif = (typeof UNITES_OBJECTIF)[number];
export type StatutObjectif = "a-venir" | "en-cours" | "atteint";
export type Objectif = { id: string; titre: string; categorie: CategorieObjectif; dateDebut: string; actuelle: number; cible: number; unite: UniteObjectif; statut?: StatutObjectif };
export const CLE_OBJECTIFS = "fitrack-objectifs";

export function calculerStatutObjectif(objectif: Pick<Objectif, "dateDebut" | "actuelle" | "cible">, aujourdHui = new Date()): StatutObjectif {
  if (objectif.actuelle >= objectif.cible) return "atteint";
  const date = new Date(`${objectif.dateDebut}T00:00:00`);
  const maintenant = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());
  if (!Number.isNaN(date.getTime()) && date > maintenant) return "a-venir";
  return "en-cours";
}

export function lireObjectifs(): Objectif[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(CLE_OBJECTIFS) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is Objectif => Boolean(item && typeof item === "object" && typeof item.titre === "string" && Number.isFinite(item.actuelle) && Number.isFinite(item.cible) && item.cible > 0 && typeof item.unite === "string"))
      .map((item, index) => {
        const categorie = CATEGORIES_OBJECTIF.includes(item.categorie) ? item.categorie : "Corps complet";
        const unite = UNITES_OBJECTIF.includes(item.unite) ? item.unite : "Répétitions";
        const dateDebut = typeof item.dateDebut === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.dateDebut) ? item.dateDebut : new Date().toISOString().slice(0, 10);
        const objectif = { ...item, id: typeof item.id === "string" ? item.id : String(index), categorie, unite, dateDebut };
        return { ...objectif, statut: calculerStatutObjectif(objectif) };
      });
  } catch { return []; }
}
export function enregistrerObjectifs(objectifs: Objectif[]) {
  window.localStorage.setItem(CLE_OBJECTIFS, JSON.stringify(objectifs.map((objectif) => ({ ...objectif, statut: calculerStatutObjectif(objectif) }))));
}
