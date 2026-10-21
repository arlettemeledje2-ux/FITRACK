# FITRACK
Carnet d'organisation et suivi sportif 
## 1. Titre du projet

FITRACK — Application web de planification et de suivi des entraînements sportifs.

### 2. Description en une phrase

FITRACK est une application web permettant aux sportifs de planifier leurs séances d’entraînement, de définir leurs objectifs et de suivre leur progression sur une plateforme unique et intuitive.

#### 3. Utilisateurs cibles

L’application s’adresse aux sportifs débutants, intermédiaires ou confirmés qui souhaitent mieux organiser leurs entraînements et mesurer leurs progrès.

Elle répond notamment aux besoins des personnes qui rencontrent des difficultés à :

Organiser leurs séances sportives dans la semaine.
Définir et suivre des objectifs sportifs précis.
Retrouver facilement les informations de leurs entraînements.
Visualiser leur progression au fil du temps.

##### 4. Fonctionnalités avec priorité MoSCoW

Must Have — Fonctionnalités indispensables (MVP)

1. Créer et organiser des objectifs sportifs
Ajouter un objectif personnalisé (exemple : réussir 20 tractions).
Définir une valeur cible pour chaque objectif.
Consulter, modifier ou supprimer ses objectifs.

2. Planifier et consulter ses séances d’entraînement
Créer des séances sportives.
Attribuer une catégorie à chaque séance : haut du corps, bas du corps, cardio ou mobilité.
Visualiser les séances prévues dans un planning hebdomadaire.
Modifier ou supprimer une séance programmée.

3. Suivre la progression de ses objectifs

Enregistrer ses performances après un entraînement.
Actualiser la progression de chaque objectif.
Visualiser la progression à l’aide d’un indicateur (exemple : 12 tractions réalisées sur un objectif de 20).

Should Have — Fonctionnalités souhaitables

1. Personnaliser les exercices d’une séance
Ajouter plusieurs exercices à une séance.
Définir le nombre de séries et de répétitions pour chaque exercice.
Indiquer le temps de repos entre les séries.

2. Ajouter des notes aux entraînements
Rédiger des commentaires dans chaque séance.
Noter ses sensations, ses difficultés ou ses observations personnelles.

Could Have — Fonctionnalités possibles

1. Personnaliser le calendrier d’entraînement
Choisir librement les jours et les dates d’entraînement.
Déplacer une séance d’un jour à un autre.
Définir le nombre de séances souhaitées par semaine.

###### 5. Modèle de données

L’application stocke les informations suivantes :

Utilisateurs

Identifiant de l’utilisateur.
Nom ou pseudonyme.
Objectifs sportifs

Identifiant de l’objectif.
Nom et description de l’objectif.
Valeur cible (exemple : 20 tractions).
Valeur actuelle (exemple : 12 tractions).
Unité de mesure (répétitions, kilogrammes, minutes, etc.).
Statut de l’objectif (en cours ou atteint).
Séances d’entraînement

Identifiant de la séance.
Nom de la séance.
Date et jour d’entraînement.
Catégorie d’entraînement (haut du corps, bas du corps, cardio, mobilité).
Groupes musculaires travaillés.
Liste des exercices prévus.
Notes personnelles.
Exercices

Identifiant de l’exercice.
Nom de l’exercice.
Nombre de séries.
Nombre de répétitions.
Temps de repos entre les séries.
Charge utilisée, si applicable.
Suivi des performances

Identifiant de l’enregistrement.
Objectif associé.
Date de l’enregistrement.
Performance réalisée.
Historique des performances permettant de mesurer la progression.

###### URL VERCEL 
https://fitrack-peach.vercel.app)

### Design 
url figma : 
