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
        "type": "radio"
    }
]
```

- `type` : `"radio"` (choix unique) ou `"checkbox"` (choix multiple).
- Au moins une réponse doit avoir `"correct": true`.

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
