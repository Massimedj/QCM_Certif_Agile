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

// Button to view all answers during the quiz (already in HTML)
const viewAllAnswersDuringQuizButton = document.getElementById('view-all-answers-during-quiz-btn');


let currentCertification = ""; // Sera défini après le chargement des questions
let questions = []; // Questions de la certification active
let currentQuestionIndex = 0;
let score = 0;
let questionsAttempted = 0;
let answeredQuestionsHistory = []; // Historique pour la révision

// --- Fonctions de gestion du quiz ---

// Charge les questions pour la certification sélectionnée
function loadCertificationQuestions(certificationName) {
    questions = allCertificationsQuestions[certificationName];
    if (!questions || questions.length === 0) {
        console.warn(`Aucune question trouvée pour la certification : ${certificationName}. Le quiz pourrait être vide.`);
        questions = []; // S'assurer que 'questions' est un tableau vide en cas d'erreur
        // Afficher un message à l'utilisateur si aucune question
        questionElement.innerText = `Aucune question disponible pour la certification ${certificationName}.`;
        answersElement.innerHTML = '';
        validateButton.style.display = 'none';
        return;
    } else {
        validateButton.style.display = 'block'; // S'assurer que le bouton Valider est visible
    }
    resetQuizState(); // Réinitialiser le quiz lorsque la certification change
}

// Réinitialise l'état du quiz
function resetQuizState() {
    currentQuestionIndex = 0;
    score = 0;
    questionsAttempted = 0;
    answeredQuestionsHistory = [];
    updateQuizInfo(); // Mettre à jour l'affichage des infos
    showQuizSection(); // Afficher la section du quiz
    showQuestion(); // Charger la première question
}

// Affiche la question actuelle et ses réponses
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

// Vérifie la réponse de l'utilisateur
function checkAnswer() {
    const questionData = questions[currentQuestionIndex];
    const selectedInputs = Array.from(answersElement.querySelectorAll(`input[name="answer"]:checked`));
    const userAnswerTexts = selectedInputs.map(input => input.value); // Réponses choisies par l'utilisateur

    if (userAnswerTexts.length === 0) {
        feedbackElement.innerText = "Veuillez sélectionner au moins une réponse.";
        feedbackElement.className = 'feedback-container incorrect visible';
        return;
    }

    let isCorrectAttempt = true;
    const correctAnswersInQuestion = questionData.answers.filter(a => a.correct).map(a => a.text);

    // Vérifier si toutes les bonnes réponses ont été sélectionnées par l'utilisateur
    for (const correctAnswer of correctAnswersInQuestion) {
        if (!userAnswerTexts.includes(correctAnswer)) {
            isCorrectAttempt = false;
            break;
        }
    }

    // Vérifier si l'utilisateur n'a pas sélectionné de mauvaises réponses
    for (const userAnswer of userAnswerTexts) {
        if (!correctAnswersInQuestion.includes(userAnswer)) {
            isCorrectAttempt = false;
            break;
        }
    }

    // Et s'assurer que le nombre de réponses sélectionnées correspond au nombre de bonnes réponses
    if (correctAnswersInQuestion.length !== userAnswerTexts.length) {
        isCorrectAttempt = false;
    }

    questionsAttempted++; // Incrémente le compteur de questions tentées

    if (isCorrectAttempt) {
        score++;
        feedbackElement.className = 'feedback-container correct visible';
        feedbackElement.innerText = "Bonne réponse !";
    } else {
        feedbackElement.className = 'feedback-container incorrect visible';
        const correctAnswersDisplay = correctAnswersInQuestion.map(a => `'${a}'`).join(', ');
        feedbackElement.innerText = `Mauvaise réponse. La/les bonne(s) réponse(s) était/étaient : ${correctAnswersDisplay}.`;
    }

    // Enregistrer la question, la réponse de l'utilisateur et le résultat
    answeredQuestionsHistory.push({
        question: questionData,
        userAnswers: userAnswerTexts,
        isCorrect: isCorrectAttempt
    });

    updateQuizInfo(); // Mettre à jour l'affichage du score
    validateButton.disabled = true; // Désactive le bouton après validation

    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
    }, 2500); // Délai avant la prochaine question
}

// Met à jour les informations du quiz (progression, score)
function updateQuizInfo() {
    currentQuestionNumberElement.innerText = Math.min(currentQuestionIndex + 1, questions.length);
    totalQuestionsElement.innerText = questions.length;
    currentScoreElement.innerText = score;
    questionsAttemptedElement.innerText = questionsAttempted;

    let percentage = 0;
    if (questionsAttempted > 0) {
        percentage = ((score / questionsAttempted) * 100).toFixed(0); // Arrondi à l'entier
    }
    scorePercentageElement.innerText = `${percentage}%`;
}

// Affiche la section de fin de quiz
function showQuizEnd() {
    quizSection.style.display = 'none';
    endQuizMessage.style.display = 'block';
    reviewSection.style.display = 'none'; // S'assurer que la section de révision est cachée
    viewAllAnswersDuringQuizButton.style.display = 'none'; // Cache le bouton "Voir toutes les réponses" à la fin du quiz

    finalScoreSummaryElement.innerText = `Votre score final est de ${score} bonne(s) réponse(s) sur ${questionsAttempted} question(s) tentée(s).`;
    if (questions.length > questionsAttempted) {
        finalScoreSummaryElement.innerText += ` (Il restait ${questions.length - questionsAttempted} questions non-répondue(s).)`;
    }
}

// Affiche la section du quiz (cache les autres)
function showQuizSection() {
    quizSection.style.display = 'block';
    endQuizMessage.style.display = 'none';
    reviewSection.style.display = 'none';
    // Assurez-vous que le bouton "Voir toutes les réponses" est visible quand la section du quiz est affichée
    viewAllAnswersDuringQuizButton.style.display = 'inline-block'; 
}

// Affiche la section de révision des réponses
function showReviewSection() {
    quizSection.style.display = 'none';
    endQuizMessage.style.display = 'none';
    reviewSection.style.display = 'block';
    viewAllAnswersDuringQuizButton.style.display = 'none'; // Cache le bouton "Voir toutes les réponses" lors de la révision
    
    answeredQuestionsList.innerHTML = ''; // Nettoie la liste
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
            
            // Si c'est une bonne réponse
            if (answerOption.correct) {
                answerP.classList.add('correct-option');
            } 
            // Si l'utilisateur a sélectionné cette option
            if (item.userAnswers.includes(answerOption.text)) {
                answerP.classList.add('user-selected');
                // Si l'utilisateur a sélectionné une mauvaise réponse
                if (!answerOption.correct) {
                    answerP.classList.add('incorrect-option');
                }
            } else if (!answerOption.correct && !item.userAnswers.includes(answerOption.text)) {
                // Si c'est une mauvaise option et qu'elle n'a pas été sélectionnée
                // Pas de style particulier, juste le texte par default
            }

            answersList.appendChild(answerP);
        });
        questionItem.appendChild(answersList);
        answeredQuestionsList.appendChild(questionItem);
    });
}

// Ferme la section de révision et retourne au quiz
function closeReview() {
    showQuizSection(); // Retourne à la section du quiz pour continuer
    showQuestion(); // Assure que la question actuelle est affichée
}

// Recommence le quiz pour la certification actuelle
function resetQuiz() {
    resetQuizState();
}

// Met à jour les onglets de certification en fonction des questions chargées
function updateCertificationTabs(certifications) {
    certificationTabsContainer.innerHTML = ''; // Nettoie les anciens onglets
    certifications.forEach(cert => {
        const button = document.createElement('button');
        button.classList.add('tab-button');
        button.dataset.certification = cert;
        // Transforme "PSM1" en "PSM 1" pour un affichage plus propre
        button.innerText = cert.replace(/([A-Z])(\d)/g, '$1 $2').trim(); 
        certificationTabsContainer.appendChild(button);
    });
    // Réaffecte l'écouteur d'événements car les boutons ont été recréés
    addTabEventListeners(); 
}

// Ajoute les écouteurs d'événements aux onglets de certification
function addTabEventListeners() {
    // Supprimer les écouteurs existants pour éviter les duplications
    certificationTabsContainer.querySelectorAll('.tab-button').forEach(button => {
        button.removeEventListener('click', handleTabClick); 
        button.addEventListener('click', handleTabClick);
    });
}

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

// --- Chargement initial des questions ---
async function loadInitialQuestions() {
    try {
        const response = await fetch('questions.json'); // Tente de charger questions.json
        if (!response.ok) {
            // Si le fichier n'existe pas ou ne peut pas être lu, utilise les questions par défaut
            console.warn("Fichier 'questions.json' non trouvé ou erreur de lecture. Utilisation des questions par défaut (vides).");
            // Questions par défaut vides pour ne pas avoir de questions en dur dans script.js
            allCertificationsQuestions = {
                "PSM1": [], 
                "PSPO1": []
            };
        } else {
            const data = await response.json();
            if (typeof data === 'object' && data !== null) {
                allCertificationsQuestions = data;
                console.log("Questions chargées depuis 'questions.json'.");
            } else {
                console.error("Format de 'questions.json' invalide. Le fichier doit être un objet JSON.");
                // Fallback aux questions par défaut si le format est incorrect
                allCertificationsQuestions = {
                    "PSM1": [], 
                    "PSPO1": []
                };
            }
        }
    } catch (error) {
        console.error("Erreur lors du chargement de 'questions.json':", error);
        // Fallback aux questions par défaut en cas d'erreur réseau ou autre
        allCertificationsQuestions = {
            "PSM1": [], 
            "PSPO1": []
        };
    } finally {
        // Initialiser l'interface après le chargement (réussi ou avec fallback)
        const firstCert = Object.keys(allCertificationsQuestions)[0];
        if (firstCert) {
            currentCertification = firstCert;
        } else {
            // Si aucune question chargée (même pas de fallback), mettre une certif vide
            currentCertification = "Default"; 
            allCertificationsQuestions["Default"] = []; // S'assurer qu'il y a au moins une certif vide pour ne pas crasher
        }

        updateCertificationTabs(Object.keys(allCertificationsQuestions));
        const defaultTab = document.querySelector(`.tab-button[data-certification="${currentCertification}"]`);
        if (defaultTab) {
            defaultTab.classList.add('active');
        }
        loadCertificationQuestions(currentCertification);
    }
}


// --- Écouteurs d'événements ---

validateButton.addEventListener('click', checkAnswer);
reviewAnswersButton.addEventListener('click', showReviewSection);
viewAllAnswersDuringQuizButton.addEventListener('click', showReviewSection);


// --- Initialisation ---
document.addEventListener('DOMContentLoaded', loadInitialQuestions);
