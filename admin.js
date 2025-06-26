// admin.js
let allCertificationsQuestions = {};
let currentAdminLanguage = localStorage.getItem('quizLanguage') || 'fr';
let currentAdminCertification = "";
let editingQuestionIndex = -1; // -1 si pas en mode édition, sinon l'index de la question éditée

// Traductions spécifiques à la page d'administration
const adminTranslations = {
    fr: {
        admin_page_title: "Administration du Quiz",
        admin_main_title: "Administration des Questions du Quiz",
        lang_fr: "Français",
        lang_en: "English",
        form_title_add: "Ajouter une nouvelle question",
        form_title_edit: "Modifier la question",
        label_question_text: "Texte de la question:",
        label_question_type: "Type de question:",
        option_radio: "Choix unique",
        option_checkbox: "Choix multiple",
        label_answers: "Réponses (cochez la/les bonne(s) réponse(s)):",
        button_add_answer: "Ajouter une réponse",
        button_save_question: "Sauvegarder la question",
        button_cancel_edit: "Annuler l'édition",
        list_title: "Questions existantes pour ",
        link_back_to_quiz: "Retour au Quiz",
        delete_confirm: "Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible.",
        question_added: "Question ajoutée avec succès !",
        question_updated: "Question mise à jour avec succès !",
        question_deleted: "Question supprimée avec succès !",
        no_questions_for_cert: "Aucune question disponible pour cette certification.",
        answer_placeholder: "Texte de la réponse",
        no_answers_error: "Veuillez ajouter au moins une réponse.",
        no_correct_answer_radio_error: "Pour un choix unique, veuillez sélectionner exactement une bonne réponse.",
        no_correct_answer_checkbox_error: "Pour un choix multiple, veuillez sélectionner au moins une bonne réponse.",
        ok_button: "OK",
        yes_button: "Oui",
        no_button: "Non",
        button_edit: "Modifier", // Ajout de la traduction
        button_delete: "Supprimer", // Ajout de la traduction
    },
    en: {
        admin_page_title: "Quiz Administration",
        admin_main_title: "Quiz Questions Administration",
        lang_fr: "Français",
        lang_en: "English",
        form_title_add: "Add New Question",
        form_title_edit: "Edit Question",
        label_question_text: "Question Text:",
        label_question_type: "Question Type:",
        option_radio: "Single choice",
        option_checkbox: "Multiple choice",
        label_answers: "Answers (check the correct one(s)):",
        button_add_answer: "Add Answer",
        button_save_question: "Save Question",
        button_cancel_edit: "Cancel Edit",
        list_title: "Existing Questions for ",
        link_back_to_quiz: "Back to Quiz",
        delete_confirm: "Are you sure you want to delete this question? This action is irreversible.",
        question_added: "Question added successfully!",
        question_updated: "Question updated successfully!",
        question_deleted: "Question deleted successfully!",
        no_questions_for_cert: "No questions available for this certification.",
        answer_placeholder: "Answer text",
        no_answers_error: "Please add at least one answer.",
        no_correct_answer_radio_error: "For single choice, please select exactly one correct answer.",
        no_correct_answer_checkbox_error: "For multiple choice, please select at least one correct answer.",
        ok_button: "OK",
        yes_button: "Yes",
        no_button: "No",
        button_edit: "Edit", // Ajout de la traduction
        button_delete: "Delete", // Ajout de la traduction
    }
};


// DOM Elements
const langSelectorContainer = document.querySelector('.language-selector');
const certSelectorContainer = document.querySelector('.certification-selector');
const questionTextInput = document.getElementById('question-text');
const questionTypeSelect = document.getElementById('question-type');
const answersFormContainer = document.getElementById('answers-form-container');
const addAnswerBtn = document.getElementById('add-answer-btn');
const saveQuestionBtn = document.getElementById('save-question-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editQuestionIndexInput = document.getElementById('edit-question-index');
const questionsListContainer = document.getElementById('questions-list');
const currentCertDisplay = document.getElementById('current-cert-display');
const formTitle = document.querySelector('#add-edit-question-form h2');


// --- Utility Functions ---

/**
 * Applies translations to data-i18n attributes.
 */
function applyAdminTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        if (adminTranslations[currentAdminLanguage] && adminTranslations[currentAdminLanguage][key]) {
            element.innerText = adminTranslations[currentAdminLanguage][key];
        }
    });
    document.title = adminTranslations[currentAdminLanguage].admin_page_title;
}

/**
 * Shows a custom modal message (replaces alert/confirm).
 */
function showCustomModal(message, type = 'info', onConfirm = null) {
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('custom-modal-overlay');

    const modalContent = document.createElement('div');
    modalContent.classList.add('custom-modal-content');

    const messageP = document.createElement('p');
    messageP.innerText = message;
    modalContent.appendChild(messageP);

    if (type === 'confirm') {
        const confirmBtn = document.createElement('button');
        confirmBtn.innerText = adminTranslations[currentAdminLanguage].yes_button;
        confirmBtn.onclick = () => {
            if (onConfirm) onConfirm(true);
            modalOverlay.remove();
        };
        modalContent.appendChild(confirmBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = adminTranslations[currentAdminLanguage].no_button;
        cancelBtn.onclick = () => {
            if (onConfirm) onConfirm(false);
            modalOverlay.remove();
        };
        modalContent.appendChild(cancelBtn);
    } else { // 'info' type
        const okBtn = document.createElement('button');
        okBtn.innerText = adminTranslations[currentAdminLanguage].ok_button;
        okBtn.onclick = () => modalOverlay.remove();
        modalContent.appendChild(okBtn);
    }

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}


// --- Data Management (LocalStorage) ---

/**
 * Loads all questions for all certifications for the current language.
 * Prioritizes localStorage, but falls back to file if localStorage is empty or on error.
 */
async function loadAllCertificationsQuestions() {
    try {
        const storedQuestions = localStorage.getItem(`allCertificationsQuestions_${currentAdminLanguage}`);
        if (storedQuestions && Object.keys(JSON.parse(storedQuestions)).length > 0) { // Check if not just empty object
            allCertificationsQuestions = JSON.parse(storedQuestions);
        } else {
            // If nothing valid in localStorage for this language, load from file and save to localStorage
            await loadQuestionsFromFile();
        }
    } catch (e) {
        console.error("Error loading questions from localStorage:", e);
        // On error, also try to load from file as a fallback
        await loadQuestionsFromFile();
    }
}

/**
 * Loads questions from the static JSON file and saves them to localStorage.
 */
async function loadQuestionsFromFile() {
    const jsonFileName = `questions_${currentAdminLanguage}.json`;
    try {
        const response = await fetch(jsonFileName);
        if (!response.ok) {
            console.warn(`File not found: ${jsonFileName}. Initializing with empty questions for this language.`);
            allCertificationsQuestions = {}; // Reset for this language if file not found
        } else {
            const data = await response.json();
            if (typeof data === 'object' && data !== null) {
                allCertificationsQuestions = data;
                // Save to localStorage immediately after loading from file to persist initial data
                saveAllCertificationsQuestions(); 
            } else {
                console.error(`Invalid JSON format in ${jsonFileName}.`);
                allCertificationsQuestions = {};
            }
        }
    } catch (error) {
        console.error(`Error fetching questions from ${jsonFileName}:`, error);
        allCertificationsQuestions = {};
    }
}

/**
 * Saves all questions for all certifications for the current language to localStorage.
 */
function saveAllCertificationsQuestions() {
    try {
        localStorage.setItem(`allCertificationsQuestions_${currentAdminLanguage}`, JSON.stringify(allCertificationsQuestions));
        console.log(`All certifications questions saved for ${currentAdminLanguage}.`);
    }
    catch (e) {
        console.error("Error saving questions to localStorage:", e);
    }
}

// --- UI Management ---

/**
 * Renders the certification buttons.
 */
function renderCertificationButtons() {
    certSelectorContainer.innerHTML = '';
    const certs = Object.keys(allCertificationsQuestions);
    if (certs.length === 0) {
        // Add a default "Default" cert if no others exist
        allCertificationsQuestions["Default"] = [];
        certs.push("Default");
        showCustomModal(adminTranslations[currentAdminLanguage].no_questions_for_cert, 'info'); // Use translated message
    }

    certs.forEach(cert => {
        const button = document.createElement('button');
        button.classList.add('cert-select-button');
        button.dataset.cert = cert;
        button.innerText = cert.replace(/([A-Z])(\d)/g, '$1 $2').trim(); // Format like PSM 1
        certSelectorContainer.appendChild(button);
    });

    if (!currentAdminCertification || !certs.includes(currentAdminCertification)) {
        currentAdminCertification = certs[0];
    }
    // Ensure the active class is applied to the correct button
    document.querySelectorAll('.cert-select-button').forEach(button => {
        if (button.dataset.cert === currentAdminCertification) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    currentCertDisplay.innerText = currentAdminCertification.replace(/([A-Z])(\d)/g, '$1 $2').trim();
    renderQuestionsList(currentAdminCertification);
}

/**
 * Renders the list of questions for the currently selected certification.
 * @param {string} certName 
 */
function renderQuestionsList(certName) {
    questionsListContainer.innerHTML = '';
    const certQuestions = allCertificationsQuestions[certName] || [];

    if (certQuestions.length === 0) {
        questionsListContainer.innerHTML = `<p>${adminTranslations[currentAdminLanguage].no_questions_for_cert}</p>`;
        return;
    }

    certQuestions.forEach((q, index) => {
        const questionItem = document.createElement('div');
        questionItem.classList.add('question-item');
        if (q.type === 'checkbox') {
            questionItem.classList.add('multiple-choice');
        }

        const questionTitle = document.createElement('h3');
        questionTitle.innerText = `${index + 1}. ${q.question}`;
        questionItem.appendChild(questionTitle);

        const answersList = document.createElement('ul');
        q.answers.forEach(answer => {
            const li = document.createElement('li');
            li.innerText = answer.text;
            if (answer.correct) {
                li.classList.add('correct-answer');
            }
            answersList.appendChild(li);
        });
        questionItem.appendChild(answersList);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('question-actions');

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.innerText = adminTranslations[currentAdminLanguage].button_edit; // Translated
        editBtn.onclick = () => editQuestion(index);
        actionsDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerText = adminTranslations[currentAdminLanguage].button_delete; // Translated
        deleteBtn.onclick = () => deleteQuestion(index);
        actionsDiv.appendChild(deleteBtn);

        questionItem.appendChild(actionsDiv);
        questionsListContainer.appendChild(questionItem);
    });
}

/**
 * Clears the question form.
 */
function clearQuestionForm() {
    questionTextInput.value = '';
    questionTypeSelect.value = 'radio';
    answersFormContainer.innerHTML = '';
    addAnswerField(); // Add one empty answer field by default
    editingQuestionIndex = -1;
    editQuestionIndexInput.value = '';
    formTitle.innerText = adminTranslations[currentAdminLanguage].form_title_add;
    cancelEditBtn.style.display = 'none';
    saveQuestionBtn.innerText = adminTranslations[currentAdminLanguage].button_save_question;
}

/**
 * Adds an empty answer field to the form.
 * @param {string} text - Optional text for the answer.
 * @param {boolean} isCorrect - Optional boolean for correct status.
 */
function addAnswerField(text = '', isCorrect = false) {
    const div = document.createElement('div');
    div.classList.add('answer-input-group');

    const inputType = questionTypeSelect.value;
    const correctInput = document.createElement('input');
    correctInput.type = inputType;
    correctInput.name = 'correct-answer-flag'; // Name is same for all to manage selection
    correctInput.checked = isCorrect;
    div.appendChild(correctInput);

    const answerInput = document.createElement('input');
    answerInput.type = 'text';
    answerInput.placeholder = adminTranslations[currentAdminLanguage].answer_placeholder;
    answerInput.value = text;
    div.appendChild(answerInput);

    const removeBtn = document.createElement('button');
    removeBtn.innerText = 'X';
    removeBtn.onclick = () => {
        if (answersFormContainer.children.length > 1) { // Ensure at least one answer remains
            div.remove();
        } else {
            showCustomModal("You must have at least one answer.", 'info'); // Can be translated
        }
    };
    div.appendChild(removeBtn);

    answersFormContainer.appendChild(div);

    // Update input types if question type changes dynamically
    questionTypeSelect.onchange = () => {
        answersFormContainer.querySelectorAll('input[name="correct-answer-flag"]').forEach(input => {
            input.type = questionTypeSelect.value;
            // For radio, ensure only one is checked when switching from checkbox
            if (questionTypeSelect.value === 'radio' && input.checked) {
                // Uncheck others if multiple were checked as checkbox
                if (answersFormContainer.querySelectorAll('input[name="correct-answer-flag"]:checked').length > 1) {
                    answersFormContainer.querySelectorAll('input[name="correct-answer-flag"]').forEach(otherInput => {
                        if (otherInput !== input) otherInput.checked = false;
                    });
                }
            }
        });
    };
    // Initial call to ensure correct input type for newly added fields
    correctInput.type = inputType;
}

// --- CRUD Operations ---

/**
 * Saves a new question or updates an existing one.
 */
function saveQuestion() {
    const questionText = questionTextInput.value.trim();
    const questionType = questionTypeSelect.value;
    const answers = [];
    const answerInputs = answersFormContainer.querySelectorAll('.answer-input-group');

    if (!questionText) {
        showCustomModal("Question text cannot be empty.", 'info'); // Translate
        return;
    }

    let correctAnswersCount = 0;
    answerInputs.forEach(group => {
        const textInput = group.querySelector('input[type="text"]');
        const correctFlag = group.querySelector('input[type="checkbox"], input[type="radio"]');
        if (textInput.value.trim()) {
            answers.push({
                text: textInput.value.trim(),
                correct: correctFlag.checked
            });
            if (correctFlag.checked) {
                correctAnswersCount++;
            }
        }
    });

    if (answers.length === 0) {
        showCustomModal(adminTranslations[currentAdminLanguage].no_answers_error, 'info');
        return;
    }
    if (questionType === 'radio' && correctAnswersCount !== 1) {
        showCustomModal(adminTranslations[currentAdminLanguage].no_correct_answer_radio_error, 'info');
        return;
    }
    if (questionType === 'checkbox' && correctAnswersCount === 0) {
        showCustomModal(adminTranslations[currentAdminLanguage].no_correct_answer_checkbox_error, 'info');
        return;
    }

    const newQuestion = {
        question: questionText,
        answers: answers,
        type: questionType
    };

    if (!allCertificationsQuestions[currentAdminCertification]) {
        allCertificationsQuestions[currentAdminCertification] = [];
    }

    if (editingQuestionIndex === -1) {
        // Add new question
        allCertificationsQuestions[currentAdminCertification].push(newQuestion);
        showCustomModal(adminTranslations[currentAdminLanguage].question_added, 'info');
    } else {
        // Update existing question
        allCertificationsQuestions[currentAdminCertification][editingQuestionIndex] = newQuestion;
        showCustomModal(adminTranslations[currentAdminLanguage].question_updated, 'info');
    }

    saveAllCertificationsQuestions();
    renderQuestionsList(currentAdminCertification);
    clearQuestionForm();
}

/**
 * Loads a question into the form for editing.
 * @param {number} index - The index of the question to edit.
 */
function editQuestion(index) {
    const questionToEdit = allCertificationsQuestions[currentAdminCertification][index];
    editingQuestionIndex = index;
    editQuestionIndexInput.value = index;

    formTitle.innerText = adminTranslations[currentAdminLanguage].form_title_edit;
    questionTextInput.value = questionToEdit.question;
    questionTypeSelect.value = questionToEdit.type;
    answersFormContainer.innerHTML = ''; // Clear existing answers in form

    questionToEdit.answers.forEach(answer => {
        addAnswerField(answer.text, answer.correct);
    });

    cancelEditBtn.style.display = 'inline-block';
    saveQuestionBtn.innerText = adminTranslations[currentAdminLanguage].button_save_question; // Ensure text is correct for save/update
}

/**
 * Deletes a question from the current certification.
 * @param {number} index - The index of the question to delete.
 */
function deleteQuestion(index) {
    showCustomModal(adminTranslations[currentAdminLanguage].delete_confirm, 'confirm', (confirmed) => {
        if (confirmed) {
            allCertificationsQuestions[currentAdminCertification].splice(index, 1);
            saveAllCertificationsQuestions();
            renderQuestionsList(currentAdminCertification);
            showCustomModal(adminTranslations[currentAdminLanguage].question_deleted, 'info');
            clearQuestionForm(); // Clear form if current question was being edited/deleted
        }
    });
}

// --- Event Listeners ---

addAnswerBtn.addEventListener('click', () => addAnswerField());
saveQuestionBtn.addEventListener('click', saveQuestion);
cancelEditBtn.addEventListener('click', clearQuestionForm);

// Language selection
langSelectorContainer.addEventListener('click', async (event) => {
    if (event.target.classList.contains('lang-button')) {
        const newLang = event.target.dataset.lang;
        if (newLang === currentAdminLanguage) return; // No change needed

        // Save the current state (questions for the OLD language) before changing currentAdminLanguage
        localStorage.setItem(`allCertificationsQuestions_${currentAdminLanguage}`, JSON.stringify(allCertificationsQuestions));

        // Update to the new language
        currentAdminLanguage = newLang;
        
        // Clear current in-memory questions to avoid stale data from previous language
        allCertificationsQuestions = {}; 

        // Load questions for the NEW language from file (force loading from file)
        await loadQuestionsFromFile(); // This will load from file and save to localStorage

        // Update UI
        document.querySelectorAll('.lang-button').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        renderCertificationButtons(); // Re-render cert buttons based on new language's data
        applyAdminTranslations(); // Apply translations for new language
        clearQuestionForm(); // Clear form after language switch
    }
});

// Certification selection
certSelectorContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('cert-select-button')) {
        document.querySelectorAll('.cert-select-button').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        currentAdminCertification = event.target.dataset.cert;
        currentCertDisplay.innerText = currentAdminCertification.replace(/([A-Z])(\d)/g, '$1 $2').trim();
        renderQuestionsList(currentAdminCertification);
        clearQuestionForm(); // Clear form when switching certifications
    }
});


// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    // Set initial active language button
    document.querySelector(`.lang-button[data-lang="${currentAdminLanguage}"]`)?.classList.add('active');
    
    // Load all questions from localStorage (or file fallback)
    await loadAllCertificationsQuestions();
    
    // Render initial UI elements
    renderCertificationButtons(); // This also sets currentAdminCertification and calls renderQuestionsList
    clearQuestionForm(); // Initialize form with one empty answer field
    applyAdminTranslations(); // Apply initial translations
});
