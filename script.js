// script.js
// La source des questions sera chargée depuis un fichier JSON externe
let allCertificationsQuestions = {}; // Initialisation vide, les questions seront chargées ici

// Traductions pour les éléments dynamiques
const translations = {
    fr: {
        page_title: "Préparation Certifications Agile - QCM",
        main_title: "Préparation Certifications Agile - QCM",
        question_label: "Question",
        current_score_label: "Score actuel",
        see_all_answers_button: "Voir toutes mes réponses",
        reset_scores_button: "Réinitialiser les scores",
        validate_button: "Valider",
        next_question_button: "Question Suivante",
        quiz_finished_title: "Quiz terminé pour cette certification !",
        retake_quiz_button: "Recommencer le quiz",
        review_answers_button: "Voir mes réponses",
        review_answers_title: "Révision de vos réponses",
        back_to_quiz_button: "Retour au quiz",
        no_question_selected: "Veuillez sélectionner au moins une réponse.",
        correct_answer_feedback: "Bonne réponse !",
        incorrect_answer_feedback_prefix: "Mauvaise réponse. La/les bonne(s) réponse(s) était/étaient : ",
        quiz_finished_summary_prefix: "Votre score final est de ",
        quiz_finished_summary_correct_suffix: " bonne(s) réponse(s) sur ",
        quiz_finished_summary_attempted_suffix: " question(s) tentée(s).",
        quiz_finished_summary_remaining_prefix: " (Il restait ",
        quiz_finished_summary_remaining_suffix: " questions non-répondue(s).)",
        reset_confirm: "Êtes-vous sûr de vouloir réinitialiser tous les scores et la progression pour toutes les certifications ? Cette action est irréversible.",
        reset_success: "Tous les scores ont été réinitialisés avec succès !",
        reset_error: "Une erreur est survenue lors de la réinitialisation des scores.",
        file_not_found_warn: "Fichier de questions non trouvé pour cette langue.",
        invalid_json_error: "Format de fichier JSON invalide. Le fichier doit être un objet JSON.",
        loading_error: "Erreur lors du chargement des questions : ",
        no_questions_available: "Aucune question disponible pour la certification ",
        yes_button: "Oui", // Nouvelle traduction
        no_button: "Non", // Nouvelle traduction
        ok_button: "OK", // Nouvelle traduction
    },
    en: {
        page_title: "Agile Certifications Prep - MCQ",
        main_title: "Agile Certifications Prep - MCQ",
        question_label: "Question",
        current_score_label: "Current score",
        see_all_answers_button: "See all my answers",
        reset_scores_button: "Reset scores",
        validate_button: "Validate",
        next_question_button: "Next Question",
        quiz_finished_title: "Quiz finished for this certification!",
        retake_quiz_button: "Retake quiz",
        review_answers_button: "Review my answers",
        review_answers_title: "Review your answers",
        back_to_quiz_button: "Back to quiz",
        no_question_selected: "Please select at least one answer.",
        correct_answer_feedback: "Correct answer!",
        incorrect_answer_feedback_prefix: "Wrong answer. The correct answer(s) was/were: ",
        quiz_finished_summary_prefix: "Your final score is ",
        quiz_finished_summary_correct_suffix: " correct answer(s) out of ",
        quiz_finished_summary_attempted_suffix: " attempted question(s).",
        quiz_finished_summary_remaining_prefix: " (There were ",
        quiz_finished_summary_remaining_suffix: " unanswered question(s).)",
        reset_confirm: "Are you sure you want to reset all scores and progress for all certifications? This action is irreversible.",
        reset_success: "All scores have been reset successfully!",
        reset_error: "An error occurred while resetting scores.",
        file_not_found_warn: "Question file not found for this language.",
        invalid_json_error: "Invalid JSON file format. The file must be a JSON object.",
        loading_error: "Error loading questions: ",
        no_questions_available: "No questions available for certification ",
        yes_button: "Yes", // Nouvelle traduction
        no_button: "No", // Nouvelle traduction
        ok_button: "OK", // Nouvelle traduction
    }
};

// Éléments du DOM
const languageSelectorContainer = document.querySelector('.language-selector'); 
const certificationTabsContainer = document.querySelector('.certification-tabs');
const quizSection = document.getElementById('quiz-section');
const endQuizMessage = document.getElementById('end-quiz-message');
const reviewSection = document.getElementById('review-section');
const finalScoreSummaryElement = document.getElementById('final-score-summary');
const reviewAnswersButton = document.getElementById('review-answers-btn'); 
const answeredQuestionsList = document.getElementById('answered-questions-list');

const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const validateButton = document.getElementById('validate-btn');
const feedbackElement = document.getElementById('feedback');
const currentQuestionNumberElement = document.getElementById('current-question-number');
const totalQuestionsElement = document.getElementById('total-questions');
const currentScoreElement = document.getElementById('current-score');
const questionsAttemptedElement = document.getElementById('questions-attempted');
const scorePercentageElement = document.getElementById('score-percentage');

const viewAllAnswersDuringQuizButton = document.getElementById('view-all-answers-during-quiz-btn');
const resetScoresButton = document.getElementById('reset-scores-btn'); 
const nextQuestionButton = document.getElementById('next-question-btn'); 


let currentLanguage = localStorage.getItem('quizLanguage') || 'fr'; // Langue actuelle, par défaut 'fr'
let currentCertification = ""; 
let questions = []; 
let currentQuestionIndex = 0;
let score = 0;
let questionsAttempted = 0;
let answeredQuestionsHistory = []; 

// --- Fonctions de gestion de la langue ---

/**
 * Met à jour le texte de tous les éléments avec l'attribut data-i18n.
 * Cette fonction est appelée après chaque changement de langue ou chargement initial.
 */
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.innerText = translations[currentLanguage][key];
        }
    });
    // S'assurer que le titre de la page est aussi traduit
    document.title = translations[currentLanguage].page_title;
    // Mettre à jour les textes spécifiques qui ne sont pas dans data-i18n ou qui sont des compteurs
    updateQuizInfo(); // Pour "Question X / Y", "Score actuel"
    updateCurrentQuestionDisplay(); // Pour le texte de la question si vide ou aucune question
}

/**
 * Change la langue du quiz.
 * @param {string} lang - La nouvelle langue ('fr' ou 'en').
 */
function setLanguage(lang) {
    if (currentLanguage === lang) return; // Ne rien faire si la langue est déjà la même

    currentLanguage = lang;
    localStorage.setItem('quizLanguage', lang); // Sauvegarde le choix de langue
    
    // Mettre à jour l'état actif des boutons de langue
    document.querySelectorAll('.lang-button').forEach(button => {
        if (button.dataset.lang === lang) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    applyTranslations(); // Applique les nouvelles traductions aux éléments déjà présents
    loadInitialQuestions(); // Recharge les questions dans la nouvelle langue
}

/**
 * Met à jour le texte de la question si elle est vide (ex: après un chargement sans questions).
 */
function updateCurrentQuestionDisplay() {
    if (!questions || questions.length === 0) {
        questionElement.innerText = translations[currentLanguage].no_questions_available + currentCertification + ".";
    }
}


// --- Fonctions de gestion du quiz ---

/**
 * Charge les questions pour la certification sélectionnée et initialise le quiz.
 * @param {string} certificationName - Le nom de la certification à charger.
 */
function loadCertificationQuestions(certificationName) {
    questions = allCertificationsQuestions[certificationName];
    if (!questions || questions.length === 0) {
        console.warn(`${translations[currentLanguage].file_not_found_warn} ${certificationName}.`);
        questions = []; 
        questionElement.innerText = `${translations[currentLanguage].no_questions_available} ${certificationName}.`;
        answersElement.innerHTML = '';
        validateButton.style.display = 'none';
        nextQuestionButton.style.display = 'none'; 
        return;
    } else {
        validateButton.style.display = 'block'; 
    }
    resetQuizState(); 
    loadQuizState(certificationName); 
    showQuestion(); 
}

/**
 * Réinitialise l'état interne du quiz (sans toucher au localStorage).
 */
function resetQuizState() {
    currentQuestionIndex = 0;
    score = 0;
    questionsAttempted = 0;
    answeredQuestionsHistory = [];
    updateQuizInfo(); 
    showQuizSection(); 
}

/**
 * Affiche la question actuelle et ses réponses.
 */
function showQuestion() {
    feedbackElement.classList.remove('visible', 'correct', 'incorrect');
    feedbackElement.innerText = '';
    validateButton.disabled = false;
    validateButton.style.display = 'block'; 
    nextQuestionButton.style.display = 'none'; 

    if (currentQuestionIndex >= questions.length) {
        showQuizEnd();
        return;
    }

    const questionData = questions[currentQuestionIndex];
    questionElement.innerText = questionData.question;
    answersElement.innerHTML = ''; 

    const inputType = questionData.type || 'radio';

    const hasBeenAnswered = answeredQuestionsHistory[currentQuestionIndex] !== undefined;
    let answeredState = null;

    if (hasBeenAnswered) {
        answeredState = answeredQuestionsHistory[currentQuestionIndex];
    }

    questionData.answers.forEach((answer, index) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = inputType;
        input.name = 'answer';
        input.value = answer.text;
        input.id = `answer-${currentQuestionIndex}-${index}`;

        label.htmlFor = `answer-${currentQuestionIndex}-${index}`;
        label.appendChild(input);
        label.appendChild(document.createTextNode(answer.text));
        answersElement.appendChild(label);

        if (hasBeenAnswered) {
            input.disabled = true; // Disable input if already answered
            if (answeredState.userAnswers.includes(answer.text)) {
                input.checked = true; // Mark user's previous selection
                label.classList.add('user-selected');
            }
            if (answer.correct) {
                label.classList.add('correct-option'); // Highlight correct answers
            } else if (answeredState.userAnswers.includes(answer.text) && !answer.correct) {
                label.classList.add('incorrect-option'); // Highlight wrong selected answers
            }
        }
    });

    // Restore feedback and button state if the question has been answered
    if (hasBeenAnswered) {
        validateButton.style.display = 'none';
        nextQuestionButton.style.display = 'block';
        if (answeredState.isCorrect) {
            feedbackElement.className = 'feedback-container correct visible';
            feedbackElement.innerText = translations[currentLanguage].correct_answer_feedback;
        } else {
            feedbackElement.className = 'feedback-container incorrect visible';
            const correctAnswersInQuestion = questionData.answers.filter(a => a.correct).map(a => a.text);
            const correctAnswersDisplay = correctAnswersInQuestion.map(a => `'${a}'`).join(', ');
            feedbackElement.innerText = translations[currentLanguage].incorrect_answer_feedback_prefix + correctAnswersDisplay + ".";
        }
    } else {
        // If not answered, ensure validate button is visible and next button is hidden
        validateButton.style.display = 'block';
        nextQuestionButton.style.display = 'none';
    }

    updateQuizInfo(); 
}

/**
 * Vérifie la réponse de l'utilisateur, met à jour le score et l'historique, puis sauvegarde l'état.
 */
function checkAnswer() {
    const questionData = questions[currentQuestionIndex];
    const selectedInputs = Array.from(answersElement.querySelectorAll(`input[name="answer"]:checked`));
    const userAnswerTexts = selectedInputs.map(input => input.value);

    if (userAnswerTexts.length === 0) {
        feedbackElement.innerText = translations[currentLanguage].no_question_selected;
        feedbackElement.className = 'feedback-container incorrect visible';
        return;
    }

    let isCorrectAttempt = true;
    const correctAnswersInQuestion = questionData.answers.filter(a => a.correct).map(a => a.text);

    for (const correctAnswer of correctAnswersInQuestion) {
        if (!userAnswerTexts.includes(correctAnswer)) {
            isCorrectAttempt = false;
            break;
        }
    }

    for (const userAnswer of userAnswerTexts) {
        if (!correctAnswersInQuestion.includes(userAnswer)) {
            isCorrectAttempt = false;
            break;
        }
    }

    if (correctAnswersInQuestion.length !== userAnswerTexts.length) {
        isCorrectAttempt = false;
    }

    // Only increment if this question hasn't been attempted before
    if (answeredQuestionsHistory[currentQuestionIndex] === undefined) {
        questionsAttempted++;
        if (isCorrectAttempt) {
            score++;
        }
    }


    if (isCorrectAttempt) {
        feedbackElement.className = 'feedback-container correct visible';
        feedbackElement.innerText = translations[currentLanguage].correct_answer_feedback;
    } else {
        feedbackElement.className = 'feedback-container incorrect visible';
        const correctAnswersDisplay = correctAnswersInQuestion.map(a => `'${a}'`).join(', ');
        feedbackElement.innerText = translations[currentLanguage].incorrect_answer_feedback_prefix + correctAnswersDisplay + ".";
    }

    // Store the state for this specific question index in history
    answeredQuestionsHistory[currentQuestionIndex] = {
        question: questionData,
        userAnswers: userAnswerTexts,
        isCorrect: isCorrectAttempt
    };

    updateQuizInfo();
    validateButton.disabled = true;
    validateButton.style.display = 'none'; 
    nextQuestionButton.style.display = 'block'; 

    saveQuizState(currentCertification); 
}

/**
 * Met à jour les informations du quiz affichées à l'écran (progression, score).
 */
function updateQuizInfo() {
    // Mise à jour des textes dynamiques via data-i18n, car cette fonction est appelée à plusieurs endroits
    document.querySelector('[data-i18n="question_label"]').innerText = translations[currentLanguage].question_label;
    document.querySelector('[data-i18n="current_score_label"]').innerText = translations[currentLanguage].current_score_label;
    document.querySelector('[data-i18n="see_all_answers_button"]').innerText = translations[currentLanguage].see_all_answers_button;
    document.querySelector('[data-i18n="reset_scores_button"]').innerText = translations[currentLanguage].reset_scores_button;
    document.querySelector('[data-i18n="validate_button"]').innerText = translations[currentLanguage].validate_button;
    document.querySelector('[data-i18n="next_question_button"]').innerText = translations[currentLanguage].next_question_button;
    document.querySelector('[data-i18n="quiz_finished_title"]').innerText = translations[currentLanguage].quiz_finished_title;
    document.querySelector('[data-i18n="retake_quiz_button"]').innerText = translations[currentLanguage].retake_quiz_button;
    document.querySelector('[data-i18n="review_answers_button"]').innerText = translations[currentLanguage].review_answers_button;
    document.querySelector('[data-i18n="review_answers_title"]').innerText = translations[currentLanguage].review_answers_title;
    document.querySelector('[data-i18n="back_to_quiz_button"]').innerText = translations[currentLanguage].back_to_quiz_button;
    document.querySelector('[data-i18n="page_title"]').innerText = translations[currentLanguage].page_title;
    document.querySelector('[data-i18n="main_title"]').innerText = translations[currentLanguage].main_title;


    currentQuestionNumberElement.innerText = Math.min(currentQuestionIndex + 1, questions.length);
    totalQuestionsElement.innerText = questions.length;
    currentScoreElement.innerText = score;
    questionsAttemptedElement.innerText = questionsAttempted;

    let percentage = 0;
    if (questionsAttempted > 0) {
        percentage = ((score / questionsAttempted) * 100).toFixed(0);
    }
    scorePercentageElement.innerText = `${percentage}%`;
}

/**
 * Affiche la section de fin de quiz.
 */
function showQuizEnd() {
    quizSection.style.display = 'none';
    endQuizMessage.style.display = 'block';
    reviewSection.style.display = 'none';
    viewAllAnswersDuringQuizButton.style.display = 'none';
    nextQuestionButton.style.display = 'none'; 

    let summaryText = translations[currentLanguage].quiz_finished_summary_prefix + score + 
                            translations[currentLanguage].quiz_finished_summary_correct_suffix + questionsAttempted + 
                            translations[currentLanguage].quiz_finished_summary_attempted_suffix;
    
    if (questions.length > questionsAttempted) {
        summaryText += translations[currentLanguage].quiz_finished_summary_remaining_prefix + 
                        (questions.length - questionsAttempted) + 
                        translations[currentLanguage].quiz_finished_summary_remaining_suffix;
    }
    finalScoreSummaryElement.innerText = summaryText;
}

/**
 * Affiche la section du quiz (cache les autres).
 */
function showQuizSection() {
    quizSection.style.display = 'block';
    endQuizMessage.style.display = 'none';
    reviewSection.style.display = 'none';
    viewAllAnswersDuringQuizButton.style.display = 'inline-block'; 
    resetScoresButton.style.display = 'inline-block'; 
}

/**
 * Affiche la section de révision des réponses.
 */
function showReviewSection() {
    quizSection.style.display = 'none';
    endQuizMessage.style.display = 'none';
    reviewSection.style.display = 'block';
    viewAllAnswersDuringQuizButton.style.display = 'none'; 
    resetScoresButton.style.display = 'none'; 
    nextQuestionButton.style.display = 'none'; 
    
    answeredQuestionsList.innerHTML = ''; 
    // Filter out undefined entries from history if any
    const validAnsweredQuestions = answeredQuestionsHistory.filter(item => item !== undefined);

    validAnsweredQuestions.forEach((item, index) => {
        const questionItem = document.createElement('div');
        questionItem.classList.add('answered-question-item');
        if (item.isCorrect) {
            questionItem.classList.add('correct-answer-review');
        } else {
            questionItem.classList.add('incorrect-answer-review');
        }

        const questionTitle = document.createElement('h3');
        questionTitle.innerText = `${translations[currentLanguage].question_label} ${answeredQuestionsHistory.indexOf(item) + 1}: ${item.question.question}`;
        questionItem.appendChild(questionTitle);

        const answersList = document.createElement('div');
        answersList.classList.add('review-answers-list');

        item.question.answers.forEach(answerOption => {
            const answerP = document.createElement('p');
            answerP.innerText = answerOption.text;
            
            if (answerOption.correct) {
                answerP.classList.add('correct-option');
            } 
            if (item.userAnswers.includes(answerOption.text)) {
                answerP.classList.add('user-selected');
                if (!answerOption.correct) {
                    answerP.classList.add('incorrect-option');
                }
            } else if (!answerOption.correct && !item.userAnswers.includes(answerOption.text)) {
                // Pas de style particulier pour les mauvaises options non sélectionnées
            }

            answersList.appendChild(answerP);
        });
        questionItem.appendChild(answersList);
        answeredQuestionsList.appendChild(questionItem);
    });
}

/**
 * Ferme la section de révision et retourne au quiz.
 */
function closeReview() {
    showQuizSection();
    showQuestion();
}

/**
 * Recommence le quiz pour la certification actuelle.
 * Cela réinitialise l'état interne et le localStorage pour cette certification.
 */
function resetQuiz() {
    resetQuizState(); 
    clearQuizState(currentCertification); 
    showQuestion(); 
}

/**
 * Met à jour les onglets de certification en fonction des questions chargées.
 * @param {string[]} certifications - Tableau des noms de certifications.
 */
function updateCertificationTabs(certifications) {
    certificationTabsContainer.innerHTML = ''; 
    certifications.forEach(cert => {
        const button = document.createElement('button');
        button.classList.add('tab-button');
        button.dataset.certification = cert;
        button.innerText = cert.replace(/([A-Z])(\d)/g, '$1 $2').trim(); 
        certificationTabsContainer.appendChild(button);
    });
    addTabEventListeners(); 
}

/**
 * Ajoute les écouteurs d'événements aux onglets de certification.
 */
function addTabEventListeners() {
    certificationTabsContainer.querySelectorAll('.tab-button').forEach(button => {
        button.removeEventListener('click', handleTabClick); 
        button.addEventListener('click', handleTabClick);
    });
}

/**
 * Gère le clic sur un onglet de certification.
 * @param {Event} event - L'événement de clic.
 */
function handleTabClick(event) {
    if (event.target.classList.contains('tab-button')) {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        event.target.classList.add('active');

        currentCertification = event.target.dataset.certification;
        loadCertificationQuestions(currentCertification);
    }
}

// --- Gestion du localStorage ---

/**
 * Sauvegarde l'état actuel du quiz pour une certification donnée dans localStorage.
 * La clé inclut la langue pour des sauvegardes séparées par langue.
 * @param {string} certKey - La clé de la certification (ex: "PSM1").
 */
function saveQuizState(certKey) {
    try {
        const stateToSave = {
            currentQuestionIndex: currentQuestionIndex,
            score: score,
            questionsAttempted: questionsAttempted,
            answeredQuestionsHistory: answeredQuestionsHistory
        };
        // Clé de sauvegarde par langue et certification
        localStorage.setItem(`quizState_${certKey}_${currentLanguage}`, JSON.stringify(stateToSave)); 
        console.log(`État du quiz sauvegardé pour ${certKey} (${currentLanguage}).`);
    } catch (e) {
        console.error("Erreur lors de la sauvegarde dans localStorage:", e);
    }
}

/**
 * Charge l'état du quiz pour une certification donnée depuis localStorage.
 * La clé inclut la langue.
 * @param {string} certKey - La clé de la certification.
 */
function loadQuizState(certKey) {
    try {
        const savedState = localStorage.getItem(`quizState_${certKey}_${currentLanguage}`); // Clé de chargement par langue
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            currentQuestionIndex = parsedState.currentQuestionIndex || 0;
            score = parsedState.score || 0;
            questionsAttempted = parsedState.questionsAttempted || 0;
            answeredQuestionsHistory = parsedState.answeredQuestionsHistory || [];
            console.log(`État du quiz chargé pour ${certKey} (${currentLanguage}).`);
        } else {
            console.log(`Aucun état sauvegardé trouvé pour ${certKey} (${currentLanguage}).`);
        }
    } catch (e) {
        console.error("Erreur lors du chargement depuis localStorage:", e);
        // En cas d'erreur de parsing, réinitialiser à un état vide
        currentQuestionIndex = 0;
        score = 0;
        questionsAttempted = 0;
        answeredQuestionsHistory = [];
    }
}

/**
 * Supprime l'état du quiz pour une certification spécifique du localStorage.
 * @param {string} certKey - La clé de la certification à effacer.
 */
function clearQuizState(certKey) {
    try {
        localStorage.removeItem(`quizState_${certKey}_${currentLanguage}`); // Supprime aussi par langue
        console.log(`Scores réinitialisés pour ${certKey} (${currentLanguage}).`);
    } catch (e) {
        console.error("Erreur lors de la réinitialisation du localStorage:", e);
    }
}

/**
 * Réinitialise tous les scores pour toutes les certifications et recharge le quiz.
 */
function resetAllScores() {
    // Utiliser une modale personnalisée au lieu de window.confirm
    showCustomModal(translations[currentLanguage].reset_confirm, 'confirm', (confirmed) => {
        if (confirmed) {
            try {
                // Efface toutes les entrées du localStorage qui commencent par 'quizState_' pour la langue actuelle
                for (let i = localStorage.length - 1; i >= 0; i--) { // Parcourir à l'envers car on modifie la liste
                    const key = localStorage.key(i);
                    if (key.startsWith(`quizState_`) && key.endsWith(`_${currentLanguage}`)) { // Cible spécifiquement la langue actuelle
                        localStorage.removeItem(key);
                    }
                }
                console.log(translations[currentLanguage].reset_success);
                loadCertificationQuestions(currentCertification); // Recharge l'état du quiz actuel (qui sera un nouvel état vide)
                showCustomModal(translations[currentLanguage].reset_success);
            } catch (e) {
                console.error("Erreur lors de la réinitialisation de tous les scores :", e);
                showCustomModal(translations[currentLanguage].reset_error);
            }
        }
    });
}

// Fonction utilitaire pour afficher une modale personnalisée (remplace alert/confirm)
function showCustomModal(message, type = 'info', onConfirm = null) {
    // Crée une div pour la modale
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('custom-modal-overlay');

    const modalContent = document.createElement('div');
    modalContent.classList.add('custom-modal-content');

    const messageP = document.createElement('p');
    messageP.innerText = message;
    modalContent.appendChild(messageP);

    if (type === 'confirm') {
        const confirmBtn = document.createElement('button');
        confirmBtn.innerText = translations[currentLanguage].yes_button; 
        confirmBtn.onclick = () => {
            if (onConfirm) onConfirm(true);
            modalOverlay.remove();
        };
        modalContent.appendChild(confirmBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = translations[currentLanguage].no_button;
        cancelBtn.onclick = () => {
            if (onConfirm) onConfirm(false);
            modalOverlay.remove();
        };
        modalContent.appendChild(cancelBtn);
    } else { // 'info' type
        const okBtn = document.createElement('button');
        okBtn.innerText = translations[currentLanguage].ok_button;
        okBtn.onclick = () => modalOverlay.remove();
        modalContent.appendChild(okBtn);
    }

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Basic styling for the modal (can be moved to CSS file)
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .custom-modal-content {
            background-color: #fefefe;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        .custom-modal-content button {
            margin: 10px;
            padding: 8px 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            background-color: #007bff;
            color: white;
        }
        .custom-modal-content button:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
}


// --- Chargement initial des questions ---
async function loadInitialQuestions() {
    const localStorageKey = `allCertificationsQuestions_${currentLanguage}`;
    try {
        const storedQuestions = localStorage.getItem(localStorageKey);
        if (storedQuestions) {
            allCertificationsQuestions = JSON.parse(storedQuestions);
            console.log(`Questions loaded from localStorage for ${currentLanguage}.`);
        } else {
            // Construire le nom du fichier JSON en fonction de la langue actuelle
            const jsonFileName = `questions_${currentLanguage}.json`;
            const response = await fetch(jsonFileName); 
            if (!response.ok) {
                console.warn(`${translations[currentLanguage].file_not_found_warn} ('${jsonFileName}').`);
                allCertificationsQuestions = {}; // Aucune question par défaut si le fichier n'est pas là
            } else {
                const data = await response.json();
                if (typeof data === 'object' && data !== null) {
                    allCertificationsQuestions = data;
                    localStorage.setItem(localStorageKey, JSON.stringify(data)); // Save to localStorage for future use
                    console.log(`Questions loaded from '${jsonFileName}' and saved to localStorage.`);
                } else {
                    console.error(`${translations[currentLanguage].invalid_json_error} ('${jsonFileName}').`);
                    allCertificationsQuestions = {};
                }
            }
        }
    } catch (error) {
        console.error(`${translations[currentLanguage].loading_error} (from localStorage or file):`, error);
        allCertificationsQuestions = {};
    } finally {
        const availableCerts = Object.keys(allCertificationsQuestions);
        if (availableCerts.length > 0) {
            // Tenter de sélectionner la certification active actuelle, sinon la première disponible
            if (!availableCerts.includes(currentCertification) || currentCertification === "Default") {
                currentCertification = availableCerts[0]; // Sélectionne la première dispo si l'ancienne n'est plus là ou si c'est la première fois
            }
            
        } else {
            currentCertification = "Default"; 
            allCertificationsQuestions["Default"] = []; // Crée une certif vide pour ne pas crasher
            questionElement.innerText = translations[currentLanguage].no_questions_available + currentCertification + ".";
            validateButton.style.display = 'none';
            nextQuestionButton.style.display = 'none';
        }

        updateCertificationTabs(availableCerts);
        // Mettre à jour l'état actif des onglets
        document.querySelectorAll('.tab-button').forEach(button => {
            if (button.dataset.certification === currentCertification) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        loadCertificationQuestions(currentCertification); // Lance le chargement des questions pour la certification par défaut
        applyTranslations(); // Appliquer les traductions après le chargement initial
    }
}


// --- Écouteurs d'événements ---
validateButton.addEventListener('click', checkAnswer);
reviewAnswersButton.addEventListener('click', showReviewSection);
viewAllAnswersDuringQuizButton.addEventListener('click', showReviewSection);
resetScoresButton.addEventListener('click', resetAllScores);
nextQuestionButton.addEventListener('click', () => {
    currentQuestionIndex++;
    showQuestion();
});

// Écouteurs pour les boutons de sélection de langue
languageSelectorContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('lang-button')) {
        setLanguage(event.target.dataset.lang);
    }
});

// **NOUVEL AJOUT : Sauvegarder l'état du quiz avant que la page ne se décharge**
window.addEventListener('beforeunload', () => {
    // Sauvegarde l'état uniquement si une certification est actuellement sélectionnée
    if (currentCertification) {
        saveQuizState(currentCertification);
    }
});


// --- Initialisation ---
document.addEventListener('DOMContentLoaded', () => {
    // Appliquer les traductions initiales basées sur la langue par défaut/sauvegardée
    applyTranslations(); 
    // Charger les questions et initialiser le quiz
    loadInitialQuestions();
    // Mettre à jour l'état actif du bouton de langue au chargement initial
    const initialLangButton = document.querySelector(`.lang-button[data-lang="${currentLanguage}"]`);
    if (initialLangButton) {
        initialLangButton.classList.add('active');
    }
});
