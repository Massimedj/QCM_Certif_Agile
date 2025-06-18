// script.js
// La source des questions sera chargée depuis un fichier JSON externe
let allCertificationsQuestions = {}; // Initialisation vide, les questions seront chargées ici

// Éléments du DOM
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
const resetScoresButton = document.getElementById('reset-scores-btn'); // Nouveau bouton de réinitialisation


let currentCertification = ""; // Sera défini après le chargement des questions
let questions = []; // Questions de la certification active
let currentQuestionIndex = 0;
let score = 0;
let questionsAttempted = 0;
let answeredQuestionsHistory = []; // Historique pour la révision

// --- Fonctions de gestion du quiz ---

/**
 * Charge les questions pour la certification sélectionnée et initialise le quiz.
 * @param {string} certificationName - Le nom de la certification à charger.
 */
function loadCertificationQuestions(certificationName) {
    questions = allCertificationsQuestions[certificationName];
    if (!questions || questions.length === 0) {
        console.warn(`Aucune question trouvée pour la certification : ${certificationName}. Le quiz pourrait être vide.`);
        questions = []; // S'assurer que 'questions' est un tableau vide en cas d'erreur
        questionElement.innerText = `Aucune question disponible pour la certification ${certificationName}.`;
        answersElement.innerHTML = '';
        validateButton.style.display = 'none';
        return;
    } else {
        validateButton.style.display = 'block'; // S'assurer que le bouton Valider est visible
    }
    resetQuizState(); // Réinitialise l'état du quiz pour la nouvelle certification
    loadQuizState(certificationName); // Tente de charger l'état sauvegardé
    showQuestion(); // Affiche la première question ou la question sauvegardée
}

/**
 * Réinitialise l'état interne du quiz (sans toucher au localStorage).
 */
function resetQuizState() {
    currentQuestionIndex = 0;
    score = 0;
    questionsAttempted = 0;
    answeredQuestionsHistory = [];
    updateQuizInfo(); // Mettre à jour l'affichage des infos
    showQuizSection(); // Afficher la section du quiz
}

/**
 * Affiche la question actuelle et ses réponses.
 */
function showQuestion() {
    feedbackElement.classList.remove('visible', 'correct', 'incorrect');
    feedbackElement.innerText = '';
    validateButton.disabled = false;

    if (currentQuestionIndex >= questions.length) {
        showQuizEnd();
        return;
    }

    const questionData = questions[currentQuestionIndex];
    questionElement.innerText = questionData.question;
    answersElement.innerHTML = ''; // Nettoie les anciennes réponses

    const inputType = questionData.type || 'radio';

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
    });

    updateQuizInfo(); // Mettre à jour les infos du quiz (numéro de question, total)
}

/**
 * Vérifie la réponse de l'utilisateur, met à jour le score et l'historique, puis sauvegarde l'état.
 */
function checkAnswer() {
    const questionData = questions[currentQuestionIndex];
    const selectedInputs = Array.from(answersElement.querySelectorAll(`input[name="answer"]:checked`));
    const userAnswerTexts = selectedInputs.map(input => input.value);

    if (userAnswerTexts.length === 0) {
        feedbackElement.innerText = "Veuillez sélectionner au moins une réponse.";
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

    questionsAttempted++;

    if (isCorrectAttempt) {
        score++;
        feedbackElement.className = 'feedback-container correct visible';
        feedbackElement.innerText = "Bonne réponse !";
    } else {
        feedbackElement.className = 'feedback-container incorrect visible';
        const correctAnswersDisplay = correctAnswersInQuestion.map(a => `'${a}'`).join(', ');
        feedbackElement.innerText = `Mauvaise réponse. La/les bonne(s) réponse(s) était/étaient : ${correctAnswersDisplay}.`;
    }

    answeredQuestionsHistory.push({
        question: questionData,
        userAnswers: userAnswerTexts,
        isCorrect: isCorrectAttempt
    });

    updateQuizInfo();
    validateButton.disabled = true;

    saveQuizState(currentCertification); // Sauvegarde l'état après chaque réponse

    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
    }, 3500);
}

/**
 * Met à jour les informations du quiz affichées à l'écran (progression, score).
 */
function updateQuizInfo() {
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

    finalScoreSummaryElement.innerText = `Votre score final est de ${score} bonne(s) réponse(s) sur ${questionsAttempted} question(s) tentée(s).`;
    if (questions.length > questionsAttempted) {
        finalScoreSummaryElement.innerText += ` (Il restait ${questions.length - questionsAttempted} questions non-répondue(s).)`;
    }
}

/**
 * Affiche la section du quiz (cache les autres).
 */
function showQuizSection() {
    quizSection.style.display = 'block';
    endQuizMessage.style.display = 'none';
    reviewSection.style.display = 'none';
    viewAllAnswersDuringQuizButton.style.display = 'inline-block'; 
}

/**
 * Affiche la section de révision des réponses.
 */
function showReviewSection() {
    quizSection.style.display = 'none';
    endQuizMessage.style.display = 'none';
    reviewSection.style.display = 'block';
    viewAllAnswersDuringQuizButton.style.display = 'none'; 
    
    answeredQuestionsList.innerHTML = ''; 
    answeredQuestionsHistory.forEach((item, index) => {
        const questionItem = document.createElement('div');
        questionItem.classList.add('answered-question-item');
        if (item.isCorrect) {
            questionItem.classList.add('correct-answer-review');
        } else {
            questionItem.classList.add('incorrect-answer-review');
        }

        const questionTitle = document.createElement('h3');
        questionTitle.innerText = `Question ${index + 1}: ${item.question.question}`;
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
    resetQuizState(); // Réinitialise l'état interne
    clearQuizState(currentCertification); // Supprime l'état de cette certification du localStorage
    showQuestion(); // Recharge la première question
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
        localStorage.setItem(`quizState_${certKey}`, JSON.stringify(stateToSave));
        console.log(`État du quiz sauvegardé pour ${certKey}.`);
    } catch (e) {
        console.error("Erreur lors de la sauvegarde dans localStorage:", e);
    }
}

/**
 * Charge l'état du quiz pour une certification donnée depuis localStorage.
 * @param {string} certKey - La clé de la certification.
 */
function loadQuizState(certKey) {
    try {
        const savedState = localStorage.getItem(`quizState_${certKey}`);
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            currentQuestionIndex = parsedState.currentQuestionIndex || 0;
            score = parsedState.score || 0;
            questionsAttempted = parsedState.questionsAttempted || 0;
            answeredQuestionsHistory = parsedState.answeredQuestionsHistory || [];
            console.log(`État du quiz chargé pour ${certKey}.`);
        } else {
            console.log(`Aucun état sauvegardé trouvé pour ${certKey}.`);
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
        localStorage.removeItem(`quizState_${certKey}`);
        console.log(`Scores réinitialisés pour ${certKey}.`);
    } catch (e) {
        console.error("Erreur lors de la réinitialisation du localStorage:", e);
    }
}

/**
 * Réinitialise tous les scores pour toutes les certifications et recharge le quiz.
 */
function resetAllScores() {
    // Remplacer window.confirm par une modale personnalisée si l'application devient plus complexe
    if (confirm("Êtes-vous sûr de vouloir réinitialiser tous les scores et la progression pour toutes les certifications ? Cette action est irréversible.")) {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('quizState_')) {
                    localStorage.removeItem(key);
                }
            }
            console.log("Tous les scores ont été réinitialisés.");
            // Recharge l'état du quiz actuel (qui sera un nouvel état vide)
            loadCertificationQuestions(currentCertification);
            // Remplacer window.alert par une modale personnalisée
            alert("Tous les scores ont été réinitialisés avec succès !"); 
        } catch (e) {
            console.error("Erreur lors de la réinitialisation de tous les scores :", e);
            // Remplacer window.alert par une modale personnalisée
            alert("Une erreur est survenue lors de la réinitialisation des scores.");
        }
    }
}


// --- Chargement initial des questions ---
async function loadInitialQuestions() {
    try {
        const response = await fetch('questions.json'); 
        if (!response.ok) {
            console.warn("Fichier 'questions.json' non trouvé ou erreur de lecture. Le site démarrera sans questions initiales.");
            allCertificationsQuestions = {}; // Aucune question par défaut si le fichier n'est pas là
        } else {
            const data = await response.json();
            if (typeof data === 'object' && data !== null) {
                allCertificationsQuestions = data;
                console.log("Questions chargées depuis 'questions.json'.");
            } else {
                console.error("Format de 'questions.json' invalide. Le fichier doit être un objet JSON.");
                allCertificationsQuestions = {};
            }
        }
    } catch (error) {
        console.error("Erreur lors du chargement de 'questions.json':", error);
        allCertificationsQuestions = {};
    } finally {
        const availableCerts = Object.keys(allCertificationsQuestions);
        if (availableCerts.length > 0) {
            currentCertification = availableCerts[0]; // Prend la première certification disponible
        } else {
            currentCertification = "Default"; 
            allCertificationsQuestions["Default"] = []; // Crée une certif vide pour ne pas crasher
            questionElement.innerText = "Aucune question chargée. Veuillez vérifier votre fichier questions.json.";
            validateButton.style.display = 'none';
        }

        updateCertificationTabs(availableCerts);
        const defaultTab = document.querySelector(`.tab-button[data-certification="${currentCertification}"]`);
        if (defaultTab) {
            defaultTab.classList.add('active');
        }
        loadCertificationQuestions(currentCertification); // Lance le chargement des questions pour la certification par défaut
    }
}


// --- Écouteurs d'événements ---
validateButton.addEventListener('click', checkAnswer);
reviewAnswersButton.addEventListener('click', showReviewSection);
viewAllAnswersDuringQuizButton.addEventListener('click', showReviewSection);
resetScoresButton.addEventListener('click', resetAllScores);


// --- Initialisation ---
document.addEventListener('DOMContentLoaded', loadInitialQuestions);
