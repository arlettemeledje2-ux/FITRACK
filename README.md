# FITRACK

Application web de planification et de suivi des entraînements sportifs.

## Comptes et données personnelles (Firebase)

L’application utilise Firebase Authentication et Cloud Firestore. Le profil est dans `users/{uid}/private/profile` et le programme, les séances, exercices, notes et objectifs dans `users/{uid}/private/data`. L’UID provient de Firebase Authentication, jamais d’un champ libre saisi par l’utilisateur. Aucun mot de passe n’est enregistré dans Firestore.

### Mise en service dans Firebase Console

1. Dans **Paramètres du projet → Général → Vos applications → FITRACK Web**, copier `firebaseConfig`. Reporter ses six valeurs dans `.env.local` à la racine du projet, avec les noms indiqués dans `.env.example`. Ne jamais ajouter de clé de compte de service. Redémarrer `npm run dev` après modification.
2. Dans **Authentication → Méthode de connexion**, activer **Adresse e-mail/Mot de passe**. Dans **Paramètres → Domaines autorisés**, ajouter `localhost` pour les tests locaux s’il n’y figure pas et le domaine de production avant déploiement.
3. Dans **Firestore Database**, créer la base **(default)** en mode production. Dans **Règles**, copier le contenu de `firestore.rules` et cliquer sur **Publier**. Ne pas utiliser les règles « mode test » en production.
4. Dans **Authentication → Modèles**, vérifier les modèles **Vérification de l’adresse e-mail** et **Réinitialisation du mot de passe**. Les liens de réinitialisation envoyés par Firebase utilisent la page Firebase par défaut ; la page `/compte/reinitialiser` est disponible si l’URL d’action personnalisée est configurée pour transmettre `oobCode`.

### Données locales et import

Sans connexion, les données continuent d’être sauvegardées sur cet appareil. Avec connexion, l’application lit et écrit uniquement les documents Firestore du compte, **sans recopier automatiquement les anciennes données locales**. Dans le navigateur qui contient les anciennes données : **Mon compte → Mes données et import → Importer sans remplacer**. L’import est transactionnel : il évite les doublons par identifiant d’objectif et refuse les conflits avant toute écriture. Il ne supprime jamais les données locales.

Les règles de `firestore.rules` interdisent l’accès aux chemins privés d’un autre UID et à tous les autres documents. Attention : une compilation ne suffit pas à valider les règles publiées. Tester la création du compte, la connexion, la déconnexion, la vérification e-mail, la réinitialisation, les sauvegardes, l’import, la reconnexion, un deuxième appareil et deux comptes distincts sur le projet Firebase réel.

## Développement

```bash
npm install
npm run dev
```

Vérifications : `npx tsc --noEmit`, `npm run lint` et `npm run build`.
