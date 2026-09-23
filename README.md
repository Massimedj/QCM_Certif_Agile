# Dossier `questions/`

Les questions sont réparties en **un fichier par certification et par langue**.

| Certification | Clé      | Fichier FR         | Fichier EN         |
| ------------- | -------- | ------------------ | ------------------ |
| PSM I         | `PSM1`   | `PSM1_fr.json`     | `PSM1_en.json`     |
| PSPO I        | `PSPO1`  | `PSPO1_fr.json`    | `PSPO1_en.json`    |
| PSPO II       | `PSPO2`  | `PSPO2_fr.json`    | `PSPO2_en.json`    |
| Kanban        | `Kanban` | `Kanban_fr.json`   | `Kanban_en.json`   |
| SAFe          | `SAFe`   | `SAFe_fr.json`     | `SAFe_en.json`     |

## Format d'un fichier

Un simple tableau de questions :

```json
[
    {
        "question": "Texte de la question ?",
        "answers": [
            { "text": "Réponse A", "correct": false },
            { "text": "Réponse B", "correct": true }
        ],
        "type": "radio",
        "explanation": "Expliquez ici pourquoi la réponse correcte est la bonne."
    }
]
```

- `type` : `"radio"` (choix unique) ou `"checkbox"` (choix multiple).
- Au moins une réponse doit avoir `"correct": true`.
- `explanation` : explication pédagogique affichée après une mauvaise réponse.

## `manifest.json`

Il décrit la liste **et l'ordre** des certifications affichées dans les onglets :

```json
{
    "version": "1.3",
    "languages": ["fr", "en"],
    "certifications": ["PSM1", "PSPO1", "PSPO2", "Kanban", "SAFe"]
}
```

## Ajouter une certification

1. Créer `<CLE>_fr.json` et `<CLE>_en.json` dans ce dossier.
2. Ajouter `<CLE>` dans le tableau `certifications` du manifeste (à la position voulue).
3. Incrémenter `QUESTIONS_VERSION` dans `script.js` pour forcer le rafraîchissement du cache navigateur.

## Modifier des questions

Après toute modification d'un fichier JSON, **incrémenter `QUESTIONS_VERSION`
dans `script.js`** (ligne « Versioning des données »), sinon les visiteurs
continueront à voir la version mise en cache dans leur navigateur.

## Explications intégrées après une mauvaise réponse

Le site fonctionne désormais **sans appel à une IA en ligne** : il n’y a ni clé
API, ni coût par réponse. Chaque question contient son explication pédagogique
dans le champ `explanation`.

### Ajouter ou modifier une explication depuis l’administration

1. Ouvrez `admin.html` sur votre site.
2. Choisissez la langue et la certification.
3. Cliquez sur **Modifier**, rédigez l’explication, puis **Sauvegarder la question**.
4. Cliquez sur **Télécharger le fichier de cette certification**.
5. Dans GitHub, remplacez le fichier téléchargé dans le dossier `questions/`,
   puis validez l’envoi. GitHub Pages publiera automatiquement la modification.

Les modifications dans l’administration sont d’abord conservées sur votre
ordinateur : le téléchargement puis le remplacement du fichier dans GitHub sont
nécessaires pour les rendre visibles à tous les visiteurs.

### Publication avec GitHub Pages

Le site est entièrement statique : il fonctionne directement avec GitHub Pages.
Le dossier `api`, les variables OpenAI et la configuration Vercel ne sont plus
nécessaires.
