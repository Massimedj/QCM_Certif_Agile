// questions-loader.js
// -----------------------------------------------------------------------------
// Module partagé (utilisé par script.js et admin.js) chargé de récupérer les
// questions désormais réparties dans un fichier par certification ET par langue :
//
//   questions/PSM1_fr.json    questions/PSM1_en.json
//   questions/PSPO1_fr.json   questions/PSPO1_en.json
//   questions/PSPO2_fr.json   questions/PSPO2_en.json
//   questions/Kanban_fr.json  questions/Kanban_en.json
//   questions/SAFe_fr.json    questions/SAFe_en.json
//
// La liste (et l'ordre) des certifications est décrite dans questions/manifest.json.
// Pour ajouter une certification : créer les 2 fichiers <CLE>_fr.json / <CLE>_en.json
// puis ajouter <CLE> dans le tableau "certifications" du manifeste.
//
// Le module reconstitue l'objet historique { "PSM1": [...], "PSPO1": [...], ... }
// afin que le reste de l'application reste inchangé.
// -----------------------------------------------------------------------------

(function (global) {
    'use strict';

    const QUESTIONS_DIR = 'questions';
    const MANIFEST_PATH = `${QUESTIONS_DIR}/manifest.json`;

    // Filet de sécurité si le manifeste est introuvable ou illisible.
    const DEFAULT_CERTIFICATIONS = ['PSM1', 'PSPO1', 'PSPO2', 'Kanban', 'SAFe'];

    /**
     * Construit le chemin du fichier de questions d'une certification/langue.
     * @param {string} certKey - Clé de la certification (ex: "PSPO1").
     * @param {string} lang - Code langue ("fr" ou "en").
     * @returns {string}
     */
    function getQuestionsFilePath(certKey, lang) {
        return `${QUESTIONS_DIR}/${certKey}_${lang}.json`;
    }

    /**
     * Récupère la liste ordonnée des certifications depuis le manifeste.
     * En cas d'échec, retourne la liste par défaut (aucun blocage de l'appli).
     * @returns {Promise<string[]>}
     */
    async function fetchCertificationList() {
        try {
            const response = await fetch(MANIFEST_PATH);
            if (!response.ok) {
                console.warn(`Manifeste '${MANIFEST_PATH}' introuvable, utilisation de la liste par défaut.`);
                return DEFAULT_CERTIFICATIONS.slice();
            }
            const manifest = await response.json();
            const certs = manifest && Array.isArray(manifest.certifications)
                ? manifest.certifications.filter(c => typeof c === 'string' && c.trim() !== '')
                : [];
            if (certs.length === 0) {
                console.warn(`Manifeste '${MANIFEST_PATH}' invalide ou vide, utilisation de la liste par défaut.`);
                return DEFAULT_CERTIFICATIONS.slice();
            }
            return certs;
        } catch (error) {
            console.warn(`Erreur de lecture du manifeste '${MANIFEST_PATH}':`, error);
            return DEFAULT_CERTIFICATIONS.slice();
        }
    }

    /**
     * Normalise le contenu d'un fichier de questions.
     * Accepte soit un tableau brut [...], soit l'ancien format { "PSM1": [...] }.
     * @param {*} raw - Contenu JSON parsé.
     * @param {string} certKey - Clé de la certification attendue.
     * @returns {Array|null} Le tableau de questions, ou null si le format est invalide.
     */
    function normalizeQuestions(raw, certKey) {
        if (Array.isArray(raw)) {
            return raw;
        }
        if (raw && typeof raw === 'object' && Array.isArray(raw[certKey])) {
            return raw[certKey];
        }
        return null;
    }

    /**
     * Charge les questions d'une seule certification pour une langue donnée.
     * @param {string} certKey
     * @param {string} lang
     * @returns {Promise<Array>} Le tableau de questions.
     * @throws {Error} Si le fichier est absent ou mal formé.
     */
    async function fetchCertificationQuestions(certKey, lang) {
        const filePath = getQuestionsFilePath(certKey, lang);
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Fichier introuvable : '${filePath}' (HTTP ${response.status})`);
        }
        const raw = await response.json();
        const questions = normalizeQuestions(raw, certKey);
        if (questions === null) {
            throw new Error(`Format JSON invalide dans '${filePath}'.`);
        }
        return questions;
    }

    /**
     * Charge toutes les certifications d'une langue et reconstitue l'objet global.
     * Les fichiers sont chargés en parallèle ; l'ordre du manifeste est conservé.
     *
     * @param {string} lang - Code langue ("fr" ou "en").
     * @returns {Promise<{data: Object, errors: string[]}>}
     *          data   : { "PSM1": [...], "PSPO1": [...], ... }
     *          errors : liste des messages d'erreur (vide si tout s'est bien passé)
     */
    async function fetchAllQuestions(lang) {
        const certifications = await fetchCertificationList();
        const errors = [];

        const results = await Promise.all(
            certifications.map(async (certKey) => {
                try {
                    const questions = await fetchCertificationQuestions(certKey, lang);
                    return { certKey, questions };
                } catch (error) {
                    errors.push(error.message);
                    console.warn(`Chargement de '${certKey}' (${lang}) impossible :`, error.message);
                    return { certKey, questions: null };
                }
            })
        );

        // Reconstruction dans l'ordre du manifeste (Promise.all préserve l'ordre).
        const data = {};
        results.forEach(({ certKey, questions }) => {
            if (questions !== null) {
                data[certKey] = questions;
            }
        });

        return { data, errors };
    }

    global.QuestionsLoader = {
        QUESTIONS_DIR,
        MANIFEST_PATH,
        DEFAULT_CERTIFICATIONS,
        getQuestionsFilePath,
        fetchCertificationList,
        fetchCertificationQuestions,
        fetchAllQuestions
    };
})(typeof window !== 'undefined' ? window : globalThis);
