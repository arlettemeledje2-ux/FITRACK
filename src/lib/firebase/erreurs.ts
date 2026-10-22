export function messageFirebase(cause: unknown): string {
  const code = typeof cause === "object" && cause !== null && "code" in cause ? String(cause.code) : "";
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "Cette adresse e-mail possède déjà un compte.",
    "auth/invalid-email": "Cette adresse e-mail n’est pas valide.",
    "auth/weak-password": "Choisis un mot de passe d’au moins 6 caractères.",
    "auth/invalid-credential": "Adresse e-mail ou mot de passe incorrect.",
    "auth/too-many-requests": "Trop de tentatives. Réessaie plus tard.",
    "auth/unauthorized-domain": "Ce domaine n’est pas autorisé dans Firebase Authentication.",
    "permission-denied": "Accès refusé par les règles Firestore. Vérifie qu’elles sont publiées.",
    "unavailable": "Service temporairement indisponible. Vérifie ta connexion et réessaie.",
  };
  return messages[code] ?? (cause instanceof Error && !code ? cause.message : "Opération impossible. Vérifie la configuration Firebase et réessaie.");
}
