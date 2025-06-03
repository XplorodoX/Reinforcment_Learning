// js/quiz_logic.js
let quizDataStore = {};
let activeQuizQuestions = [];
let currentQuizData = []; // This will hold the quiz data for the current language

let currentQuestionIndex = 0;
let score = 0;
let selectedOptionElement = null;
let answerSubmitted = false;
const MAX_QUIZ_QUESTIONS = 10; // You can adjust this

// DOM Elements (will be initialized in main.js or when this script is loaded and DOM is ready)
let questionTextEl, optionsContainerEl, feedbackAreaEl, nextQuestionBtn, quizResultsAreaEl, scoreTextEl, restartQuizBtn, questionCounterEl, quizQuestionContainerEl, quizLoadingMessageEl, quizNavigationEl;

function initializeQuizDOMElements() {
    questionTextEl = document.getElementById('question-text');
    optionsContainerEl = document.getElementById('options-container');
    feedbackAreaEl = document.getElementById('quiz-feedback-area');
    nextQuestionBtn = document.getElementById('next-question-btn');
    quizResultsAreaEl = document.getElementById('quiz-results-area');
    scoreTextEl = document.getElementById('score-text');
    restartQuizBtn = document.getElementById('restart-quiz-btn');
    questionCounterEl = document.getElementById('question-counter');
    quizQuestionContainerEl = document.getElementById('quiz-question-container');
    quizLoadingMessageEl = document.getElementById('quiz-loading-message');
    quizNavigationEl = document.getElementById('quiz-navigation');
}


async function loadQuizDataForLang(lang) {
    if (!quizLoadingMessageEl || !quizQuestionContainerEl || !quizNavigationEl) {
        console.error("Quiz DOM elements not ready for loadQuizDataForLang");
        return false;
    }

    quizLoadingMessageEl.style.display = 'block';
    quizQuestionContainerEl.style.display = 'none';
    quizNavigationEl.style.display = 'none';

    try {
        const response = await fetch(`quiz_data_${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for quiz_data_${lang}.json`);
        }
        const data = await response.json();
        quizDataStore[lang] = data;
        currentQuizData = data; // Set currentQuizData for the loaded language

        quizLoadingMessageEl.style.display = 'none';
        quizQuestionContainerEl.style.display = 'block';
        quizNavigationEl.style.display = 'flex';
        return true;
    } catch (error) {
        console.error('Failed to load quiz data for language:', lang, error);
        const langTranslations = translations[lang] || translations['de']; // Fallback
        quizLoadingMessageEl.innerHTML = langTranslations.quizJsonLoading.replace("Lade", "Fehler beim Laden der") + ` (quiz_data_${lang}.json).`;
        quizQuestionContainerEl.style.display = 'none';
        quizNavigationEl.style.display = 'none';
        currentQuizData = [];
        activeQuizQuestions = [];
        return false;
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initializeQuizSession() {
    if (!currentQuizData || currentQuizData.length === 0) {
        const langTranslations = translations[currentLanguage] || translations['de'];
        displayQuizError(langTranslations.quizJsonLoading.replace("Lade", "Keine Quizdaten verfügbar für") + ` ${currentLanguage}.`);
        activeQuizQuestions = [];
        return;
    }

    let shuffledQuestions = [...currentQuizData];
    shuffleArray(shuffledQuestions);
    activeQuizQuestions = shuffledQuestions.slice(0, Math.min(MAX_QUIZ_QUESTIONS, shuffledQuestions.length));

    currentQuestionIndex = 0;
    score = 0;

    if (activeQuizQuestions.length > 0) {
        quizResultsAreaEl.style.display = 'none'; // Hide results if restarting
        quizQuestionContainerEl.style.display = 'block'; // Ensure question area is visible
        quizNavigationEl.style.display = 'flex'; // Ensure navigation is visible
        loadQuestion();
    } else {
        const langTranslations = translations[currentLanguage] || translations['de'];
        displayQuizError(langTranslations.quizJsonLoading.replace("Lade", "Keine Quizfragen verfügbar in") + ` quiz_data_${currentLanguage}.json`);
    }
}

function displayQuizError(message) {
    if (!quizLoadingMessageEl || !quizQuestionContainerEl || !quizNavigationEl) return;
    quizLoadingMessageEl.innerHTML = message;
    quizLoadingMessageEl.style.display = 'block';
    quizQuestionContainerEl.style.display = 'none';
    quizNavigationEl.style.display = 'none';
}

function loadQuestion() {
    const langTranslations = translations[currentLanguage] || translations['de'];
    if (!activeQuizQuestions || activeQuizQuestions.length === 0) {
        displayQuizError(langTranslations.quizJsonLoading.replace("Lade", "Keine Fragen zu laden in") + ` ${currentLanguage}.`);
        return;
    }
    if (currentQuestionIndex >= activeQuizQuestions.length) {
        showResults();
        return;
    }

    if (quizLoadingMessageEl) quizLoadingMessageEl.style.display = 'none';
    if (quizQuestionContainerEl) quizQuestionContainerEl.style.display = 'block';
    if (quizNavigationEl) quizNavigationEl.style.display = 'flex';


    answerSubmitted = false;
    selectedOptionElement = null;
    const currentQuestionData = activeQuizQuestions[currentQuestionIndex];
    questionTextEl.innerHTML = currentQuestionData.question;

    optionsContainerEl.innerHTML = '';

    let questionOptions = currentQuestionData.options.map((optionText, index) => ({
        text: optionText,
        originalIndex: index
    }));

    shuffleArray(questionOptions);

    questionOptions.forEach((optionObj) => {
        const optionEl = document.createElement('button');
        optionEl.classList.add('quiz-option');
        optionEl.innerHTML = optionObj.text;
        optionEl.dataset.originalIndex = optionObj.originalIndex;
        optionEl.addEventListener('click', selectOption);
        optionsContainerEl.appendChild(optionEl);
    });

    feedbackAreaEl.style.display = 'none';
    nextQuestionBtn.disabled = true;
    nextQuestionBtn.classList.add('opacity-50', 'cursor-not-allowed');
    nextQuestionBtn.classList.remove('opacity-100');
    questionCounterEl.textContent = `${langTranslations.quiz_questionCounterPrefix} ${currentQuestionIndex + 1} ${langTranslations.quiz_questionCounterOf} ${activeQuizQuestions.length}`;
    nextQuestionBtn.textContent = langTranslations.quiz_nextButton;


    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([questionTextEl, optionsContainerEl]).catch(function (err) { console.error('MathJax typesetting error:', err); });
    }
}

function selectOption(event) {
    if (answerSubmitted) return;

    const currentlySelected = optionsContainerEl.querySelector('.quiz-option.selected');
    if (currentlySelected) {
        currentlySelected.classList.remove('selected');
    }

    selectedOptionElement = event.target.closest('.quiz-option');
    selectedOptionElement.classList.add('selected');

    submitAnswer();
}

function submitAnswer() {
    if (!selectedOptionElement || answerSubmitted) return;
    answerSubmitted = true;
    const langTranslations = translations[currentLanguage] || translations['de'];

    const selectedOriginalIndex = parseInt(selectedOptionElement.dataset.originalIndex);
    const correctAnswerOriginalIndex = activeQuizQuestions[currentQuestionIndex].answer;

    optionsContainerEl.childNodes.forEach(buttonEl => {
        buttonEl.disabled = true;
        buttonEl.classList.remove('selected');
        if (parseInt(buttonEl.dataset.originalIndex) === correctAnswerOriginalIndex) {
            // Highlight correct answer only if the selected one was wrong
            if (selectedOriginalIndex !== correctAnswerOriginalIndex) {
                 buttonEl.classList.add('correct');
            }
        }
    });


    if (selectedOriginalIndex === correctAnswerOriginalIndex) {
        score++;
        feedbackAreaEl.textContent = langTranslations.quiz_feedbackCorrect;
        feedbackAreaEl.className = 'quiz-feedback feedback-correct';
        selectedOptionElement.classList.add('correct'); // Also mark the selected one as correct
    } else {
        const correctOptionText = activeQuizQuestions[currentQuestionIndex].options[correctAnswerOriginalIndex];
        feedbackAreaEl.innerHTML = `${langTranslations.quiz_feedbackIncorrectPrefix} "${correctOptionText}"`;
        feedbackAreaEl.className = 'quiz-feedback feedback-incorrect';
        selectedOptionElement.classList.add('incorrect');
    }
    feedbackAreaEl.style.display = 'block';
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([feedbackAreaEl]).catch(function (err) { console.error('MathJax typesetting error:', err); });
    }

    nextQuestionBtn.disabled = false;
    nextQuestionBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    nextQuestionBtn.classList.add('opacity-100');

    if (currentQuestionIndex === activeQuizQuestions.length - 1) {
        nextQuestionBtn.textContent = langTranslations.quiz_resultsButton;
    }
}

function showResults() {
    const langTranslations = translations[currentLanguage] || translations['de'];
    if (quizQuestionContainerEl) quizQuestionContainerEl.style.display = 'none';
    if (feedbackAreaEl) feedbackAreaEl.style.display = 'none';
    if (quizNavigationEl) quizNavigationEl.style.display = 'none';
    if (quizResultsAreaEl) quizResultsAreaEl.style.display = 'block';

    const scoreSuffix = score === 1 ? langTranslations.quiz_scoreSuffix_singular : langTranslations.quiz_scoreSuffix_plural;
    if (activeQuizQuestions && activeQuizQuestions.length > 0) {
        scoreTextEl.textContent = `${score} ${langTranslations.quiz_scoreOutOf} ${activeQuizQuestions.length} (${((score / activeQuizQuestions.length) * 100).toFixed(0)}%)`;
    } else {
        scoreTextEl.textContent = "N/A";
    }
     // Ensure i18n for title and button in results area is applied
    const finishedTitleEl = quizResultsAreaEl.querySelector('h3[data-i18n="quiz_finishedTitle"]');
    if (finishedTitleEl) finishedTitleEl.textContent = langTranslations.quiz_finishedTitle;
    const scorePrefixEl = quizResultsAreaEl.querySelector('span[data-i18n="quiz_scorePrefix"]');
    if (scorePrefixEl) scorePrefixEl.textContent = langTranslations.quiz_scorePrefix;
    if (restartQuizBtn) restartQuizBtn.textContent = langTranslations.quiz_restartButton;
}

function setupQuizEventListeners() {
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < activeQuizQuestions.length) {
                loadQuestion();
            } else {
                showResults();
            }
        });
    }

    if (restartQuizBtn) {
        restartQuizBtn.addEventListener('click', () => {
            initializeQuizSession();
        });
    }
}
