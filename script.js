// script.js
// La source des questions sera chargée depuis un fichier JSON externe
let allCertificationsQuestions = {}; // Initialisation vide, les questions seront chargées ici

// Traductions pour les éléments dynamiques
const translations = {
    fr: {
        page_title: "Préparation Certifications Agile - QCM",
        main_title: "Préparation Certifications Agile - QCM",
        intro_what_is_it: "Bienvenue ! Ce site est un outil de préparation aux certifications Agile (PSM I, PSPO I, PSPO II, Kanban, SAFe). Il vous propose des QCM (Questionnaires à Choix Multiples) pour tester et renforcer vos connaissances.",
        intro_goal: "L'objectif est de vous aider à vous entraîner de manière autonome, à identifier vos points forts et vos axes d'amélioration, et à arriver sereinement le jour de l'examen.",
        intro_how_it_works: "Le fonctionnement est simple : choisissez une certification et une langue, répondez aux questions, et obtenez une correction immédiate. Une explication générée par IA peut vous aider à comprendre vos erreurs. Votre progression est sauvegardée automatiquement dans votre navigateur.",
        intro_call_to_action: "🤝 Vous avez d'autres questions ou souhaitez enrichir cette base ? N'hésitez pas à me les partager ! Contact : massi.medj@yahoo.fr",
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
        yes_button: "Oui",
        no_button: "Non",
        ok_button: "OK",
        filter_label: "Filtrer par :",
        filter_all: "Toutes les questions",
        filter_correct: "Bonnes réponses",
        filter_incorrect: "Mauvaises réponses",
        ai_explanation_title: "Explication de la bonne réponse",
        ai_explanation_notice: "Explication générée par l’IA",
        ai_explanation_loading: "Préparation de l’explication…",
        ai_explanation_unavailable: "L’explication IA n’est pas disponible pour le moment. La bonne réponse est affichée ci-dessus.",
        footer_contact_msg: "Une remarque ou une suggestion d'amélioration ? N'hésitez pas à me contacter :"
    },
    en: {
        page_title: "Agile Certifications Prep - MCQ",
        main_title: "Agile Certifications Prep - MCQ",
        intro_what_is_it: "Welcome! This website is a preparation tool for Agile certifications (PSM I, PSPO I, PSPO II, Kanban, SAFe). It offers MCQs (Multiple Choice Questions) to test and strengthen your knowledge.",
        intro_goal: "The goal is to help you practice independently, identify your strengths and areas for improvement, and arrive confidently on exam day.",
        intro_how_it_works: "How it works: choose a certification and a language, answer the questions, and get immediate feedback. An AI-generated explanation can help you understand your mistakes. Your progress is automatically saved in your browser.",
        intro_call_to_action: "🤝 Do you have more questions or want to help enrich this database? Feel free to share them with me! Contact: massi.medj@yahoo.fr",
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
        yes_button: "Yes",
        no_button: "No",
        ok_button: "OK",
        filter_label: "Filter by:",
        filter_all: "All questions",
        filter_correct: "Correct answers",
        filter_incorrect: "Incorrect answers",
        ai_explanation_title: "Why this is the correct answer",
        ai_explanation_notice: "AI-generated explanation",
        ai_explanation_loading: "Preparing the explanation…",
        ai_explanation_unavailable: "The AI explanation is unavailable right now. The correct answer is shown above.",
        footer_contact_msg: "Any remarks or suggestions for improvement? Feel free to contact me:"
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
const introSection = document.getElementById('intro-section');

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


let currentLanguage = localStorage.getItem('quizLanguage') || 'en';
let currentCertification = ""; 
let questions = []; 
let currentQuestionIndex = 0;
let score = 0;
let questionsAttempted = 0;
let answeredQuestionsHistory = []; 


// --- Fonctions de gestion de la langue ---

/**
 * Met à jour le texte de tous les éléments avec l'attribut data-i18n.
 */
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.innerText = translations[currentLanguage][key];
        }
    });
    document.title = translations[currentLanguage].page_title;
    updateQuizInfo();
    updateCurrentQuestionDisplay();
}

/**
 * Change la langue du quiz.
 * @param {string} lang - La nouvelle langue ('fr' ou 'en').
 */
function setLanguage(lang) {
    if (currentLanguage === lang) return;

    currentLanguage = lang;
    localStorage.setItem('quizLanguage', lang);
    
    document.querySelectorAll('.lang-button').forEach(button => {
        if (button.dataset.lang === lang) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    applyTranslations();
    loadInitialQuestions();
}

/**
 * Met à jour le texte de la question si elle est vide.
 */
function updateCurrentQuestionDisplay() {
    if (!questions || questions.length === 0) {
        questionElement.innerText = translations[currentLanguage].no_questions_available + currentCertification + ".";
    }
}

/**
 * Masque la section d'introduction (appelée dès que le quiz commence).
 */
function hideIntroSection() {
    if (introSection) {
        introSection.style.display = 'none';
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
 * Retourne les réponses officiellement correctes pour une question.
 * @param {Object} questionData
 * @returns {string[]}
 */
function getCorrectAnswers(questionData) {
    return questionData.answers.filter(answer => answer.correct).map(answer => answer.text);
}

/**
 * Affiche la correction d'une réponse erronée.
 * @param {Object} questionData
 * @param {Object} answeredState
 */
function renderIncorrectFeedback(questionData, answeredState) {
    const correctAnswers = getCorrectAnswers(questionData);

    feedbackElement.replaceChildren();
    feedbackElement.className = 'feedback-container incorrect visible';

    const prefix = document.createElement('p');
    prefix.className = 'feedback-message';
    prefix.textContent = translations[currentLanguage].incorrect_answer_feedback_prefix;
    feedbackElement.appendChild(prefix);

    const answersList = document.createElement('ul');
    answersList.className = 'correct-answers-list';
    correctAnswers.forEach(answerText => {
        const item = document.createElement('li');
        item.textContent = answerText;
        answersList.appendChild(item);
    });
    feedbackElement.appendChild(answersList);

    if (answeredState.explanationStatus === 'loading') {
        const explanation = document.createElement('div');
        explanation.className = 'ai-explanation ai-explanation-loading';

        const loadingIndicator = document.createElement('span');
        loadingIndicator.className = 'ai-loading-indicator';
        loadingIndicator.setAttribute('aria-hidden', 'true');
        explanation.appendChild(loadingIndicator);

        const loadingText = document.createElement('span');
        loadingText.textContent = translations[currentLanguage].ai_explanation_loading;
        explanation.appendChild(loadingText);
        feedbackElement.appendChild(explanation);
        return;
    }

    if (answeredState.explanationStatus === 'ready' && answeredState.explanation) {
        const explanation = document.createElement('div');
        explanation.className = 'ai-explanation';

        const title = document.createElement('h3');
        title.textContent = translations[currentLanguage].ai_explanation_title;
        explanation.appendChild(title);

        const content = document.createElement('p');
        content.textContent = answeredState.explanation;
        explanation.appendChild(content);

        const notice = document.createElement('small');
        notice.textContent = translations[currentLanguage].ai_explanation_notice;
        explanation.appendChild(notice);
        feedbackElement.appendChild(explanation);
        return;
    }

    if (answeredState.explanationStatus === 'unavailable') {
        const unavailable = document.createElement('p');
        unavailable.className = 'ai-explanation-unavailable';
        unavailable.textContent = translations[currentLanguage].ai_explanation_unavailable;
        feedbackElement.appendChild(unavailable);
    }
}

/**
 * Demande une explication courte à l'API sécurisée du site.
 * @param {Object} questionData
 * @param {Object} answeredState
 */
async function requestAiExplanation(questionData, answeredState) {
    if (answeredState.explanationStatus === 'loading' || answeredState.explanationStatus === 'ready') {
        return;
    }

    const requestContext = {
        certification: currentCertification,
        language: currentLanguage,
        questionIndex: currentQuestionIndex,
        history: answeredQuestionsHistory
    };

    answeredState.explanationStatus = 'loading';
    renderIncorrectFeedback(questionData, answeredState);

    try {
        const response = await fetch('/api/explain-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                certification: requestContext.certification,
                language: requestContext.language,
                question: questionData.question,
                correctAnswers: getCorrectAnswers(questionData),
                userAnswers: answeredState.userAnswers
            })
        });

        if (!response.ok) {
            throw new Error(`Service d'explication indisponible (${response.status})`);
        }

        const data = await response.json();
        if (!data || typeof data.explanation !== 'string' || data.explanation.trim() === '') {
            throw new Error("Réponse d'explication invalide");
        }

        answeredState.explanation = data.explanation.trim();
        answeredState.explanationStatus = 'ready';
    } catch (error) {
        console.warn("Impossible de charger l'explication IA :", error);
        answeredState.explanationStatus = 'unavailable';
    }

    const isCurrentQuiz = currentCertification === requestContext.certification
        && currentLanguage === requestContext.language
        && answeredQuestionsHistory === requestContext.history;

    if (!isCurrentQuiz) {
        return;
    }

    saveQuizState(currentCertification);

    if (currentQuestionIndex === requestContext.questionIndex
        && answeredQuestionsHistory[currentQuestionIndex] === answeredState) {
        renderIncorrectFeedback(questionData, answeredState);
    }
}

/**
 * Affiche la question actuelle et ses réponses.
 */
function showQuestion() {
    // Masquer l'introduction dès qu'on affiche une question (si le quiz est déjà commencé)
    if (answeredQuestionsHistory.some(state => state !== undefined)) {
        hideIntroSection();
    }

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
            input.disabled = true;
            if (answeredState.userAnswers.includes(answer.text)) {
                input.checked = true;
                label.classList.add('user-selected');
            }
            if (answer.correct) {
                label.classList.add('correct-option');
            } else if (answeredState.userAnswers.includes(answer.text) && !answer.correct) {
                label.classList.add('incorrect-option');
            }
        }
    });

    if (hasBeenAnswered) {
        validateButton.style.display = 'none';
        nextQuestionButton.style.display = 'block';
        if (answeredState.isCorrect) {
            feedbackElement.className = 'feedback-container correct visible';
            feedbackElement.innerText = translations[currentLanguage].correct_answer_feedback;
        } else {
            renderIncorrectFeedback(questionData, answeredState);
            if (!answeredState.explanationStatus) {
                requestAiExplanation(questionData, answeredState);
            }
        }
    } else {
        validateButton.style.display = 'block';
        nextQuestionButton.style.display = 'none';
    }

    updateQuizInfo(); 
}

/**
 * Vérifie la réponse de l'utilisateur, met à jour le score et l'historique.
 */
function checkAnswer() {
    // Masquer l'introduction dès la première validation
    hideIntroSection();

    const questionData = questions[currentQuestionIndex];
    const selectedInputs = Array.from(answersElement.querySelectorAll(`input[name="answer"]:checked`));
    const userAnswerTexts = selectedInputs.map(input => input.value);

    if (userAnswerTexts.length === 0) {
        feedbackElement.innerText = translations[currentLanguage].no_question_selected;
        feedbackElement.className = 'feedback-container incorrect visible';
        return;
    }

    let isCorrectAttempt = true;
    const correctAnswersInQuestion = getCorrectAnswers(questionData);

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

    if (answeredQuestionsHistory[currentQuestionIndex] === undefined) {
        questionsAttempted++;
        if (isCorrectAttempt) {
            score++;
        }
    }

    if (isCorrectAttempt) {
        feedbackElement.className = 'feedback-container correct visible';
        feedbackElement.innerText = translations[currentLanguage].correct_answer_feedback;
    }

    const answeredState = {
        question: questionData,
        userAnswers: userAnswerTexts,
        isCorrect: isCorrectAttempt
    };
    answeredQuestionsHistory[currentQuestionIndex] = answeredState;

    if (!isCorrectAttempt) {
        renderIncorrectFeedback(questionData, answeredState);
    }

    updateQuizInfo();
    validateButton.disabled = true;
    validateButton.style.display = 'none'; 
    nextQuestionButton.style.display = 'block'; 

    saveQuizState(currentCertification); 

    if (!isCorrectAttempt) {
        requestAiExplanation(questionData, answeredState);
    }
}


/**
 * Met à jour les informations du quiz affichées à l'écran (progression, score).
 */
function updateQuizInfo() {
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
 * Affiche la section de révision avec le filtre par statut.
 */
function showReviewSection() {
    quizSection.style.display = 'none';
    endQuizMessage.style.display = 'none';
    viewAllAnswersDuringQuizButton.style.display = 'none';
    reviewSection.style.display = 'block';

    answeredQuestionsList.innerHTML = '';

    const filterElement = document.getElementById('review-filter');
    const filterValue = filterElement ? filterElement.value : 'all';

    let displayedCount = 0;

    answeredQuestionsHistory.forEach((answeredState, index) => {
        if (!answeredState) return; 

        const questionData = questions[index];
        const isCorrect = answeredState.isCorrect;

        if (filterValue === 'correct' && !isCorrect) return; 
        if (filterValue === 'incorrect' && isCorrect) return; 

        displayedCount++;

        const questionDiv = document.createElement('div');
        questionDiv.classList.add('answered-question-item');
        
        if (isCorrect) {
            questionDiv.classList.add('correct-answer-review');
        } else {
            questionDiv.classList.add('incorrect-answer-review');
        }

        const questionTitle = document.createElement('h3');
        const questionLabel = translations[currentLanguage] ? translations[currentLanguage].question_label : "Question";
        questionTitle.innerText = `${questionLabel} ${index + 1} : ${questionData.question}`;
        questionDiv.appendChild(questionTitle);

        const answersListDiv = document.createElement('div');
        answersListDiv.classList.add('review-answers-list');

        questionData.answers.forEach(answer => {
            const answerP = document.createElement('p');
            answerP.innerText = answer.text;

            const isUserSelected = answeredState.userAnswers.includes(answer.text);

            if (answer.correct) {
                answerP.classList.add('correct-option');
            }

            if (isUserSelected) {
                answerP.classList.add('user-selected');
                
                if (!answer.correct) {
                    answerP.classList.add('incorrect-option');
                }
            }

            answersListDiv.appendChild(answerP);
        });

        questionDiv.appendChild(answersListDiv);
        answeredQuestionsList.appendChild(questionDiv);
    });

    if (displayedCount === 0) {
        const noDataP = document.createElement('p');
        noDataP.innerText = currentLanguage === 'fr' 
            ? "Aucune question ne correspond à ce filtre pour le moment." 
            : "No questions match this filter yet.";
        noDataP.style.textAlign = "center";
        noDataP.style.fontStyle = "italic";
        noDataP.style.color = "#666";
        noDataP.style.marginTop = "20px";
        answeredQuestionsList.appendChild(noDataP);
    }
}

/**
 * Ferme la section de révision et retourne au quiz.
 */
function closeReview() {
    reviewSection.style.display = 'none';
    quizSection.style.display = 'block';
    
    if (currentQuestionIndex >= questions.length) {
        endQuizMessage.style.display = 'block';
    } else {
        viewAllAnswersDuringQuizButton.style.display = 'inline-block';
    }

    const filterElement = document.getElementById('review-filter');
    if (filterElement) {
        filterElement.value = 'all';
    }
}

/**
 * Recommence le quiz pour la certification actuelle.
 */
function resetQuiz() {
    resetQuizState(); 
    clearQuizState(currentCertification); 
    showQuestion(); 
}

/**
 * Met à jour les onglets de certification.
 * @param {string[]} certifications
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
 * @param {Event} event
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
 * Sauvegarde l'état actuel du quiz pour une certification donnée.
 */
function saveQuizState(certKey) {
    try {
        const stateToSave = {
            currentQuestionIndex: currentQuestionIndex,
            score: score,
            questionsAttempted: questionsAttempted,
            answeredQuestionsHistory: answeredQuestionsHistory
        };
        localStorage.setItem(`quizState_${certKey}_${currentLanguage}`, JSON.stringify(stateToSave)); 
        console.log(`État du quiz sauvegardé pour ${certKey} (${currentLanguage}).`);
    } catch (e) {
        console.error("Erreur lors de la sauvegarde dans localStorage:", e);
    }
}

/**
 * Charge l'état du quiz pour une certification donnée.
 */
function loadQuizState(certKey) {
    try {
        const savedState = localStorage.getItem(`quizState_${certKey}_${currentLanguage}`);
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
        currentQuestionIndex = 0;
        score = 0;
        questionsAttempted = 0;
        answeredQuestionsHistory = [];
    }
}

/**
 * Supprime l'état du quiz pour une certification spécifique.
 */
function clearQuizState(certKey) {
    try {
        localStorage.removeItem(`quizState_${certKey}_${currentLanguage}`);
        console.log(`Scores réinitialisés pour ${certKey} (${currentLanguage}).`);
    } catch (e) {
        console.error("Erreur lors de