export type Objectif = { id: string; titre: string; actuelle: number; cible: number; unite: string; statut: "en-cours" | "termine" };
export const CLE_OBJECTIFS = "fitrack-objectifs";
export function lireObjectifs(): Objectif[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(CLE_OBJECTIFS) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is Objectif => Boolean(item && typeof item === "object" && typeof item.titre === "string" && Number.isFinite(item.actuelle) && Number.isFinite(item.cible) && item.cible > 0 && typeof item.unite === "string" && (item.statut === "en-cours" || item.statut === "termine")))
      .map((item, index) => ({ ...item, id: typeof item.id === "string" ? item.id : String(index) }));
  } catch { return []; }
}
export function enregistrerObjectifs(objectifs: Objectif[]) {
  window.localStorage.setItem(CLE_OBJECTIFS, JSON.stringify(objectifs));
}
