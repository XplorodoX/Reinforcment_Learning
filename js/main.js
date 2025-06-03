// js/main.js
let currentLanguage = 'de'; // Default language

async function setLanguage(lang) {
    const previousLang = currentLanguage;
    currentLanguage = lang;
    document.documentElement.lang = lang;

    let quizDataLoadedSuccessfully = true;
    if (!quizDataStore[lang]) { // Check if quiz data for this lang is already in our store
        quizDataLoadedSuccessfully = await loadQuizDataForLang(lang);
    } else {
        currentQuizData = quizDataStore[lang]; // Use stored quiz data
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        } else if (translations[previousLang] && translations[previousLang][key]) {
            // Fallback to previous language if key not found for new lang, though ideally all keys exist
            el.innerHTML = translations[previousLang][key];
        }
    });

    document.title = translations[lang].pageTitle || "Reinforcement Learning Infographic";

    document.getElementById('lang-de-btn').classList.toggle('active', lang === 'de');
    document.getElementById('lang-en-btn').classList.toggle('active', lang === 'en');

    updateChartLanguage(); // Update chart with new language strings

    const quizAreaVisible = document.getElementById('quiz-area') && document.getElementById('quiz-area').checkVisibility(); // Modern way, might need polyfill or older check
    const resultsAreaVisible = quizResultsAreaEl && quizResultsAreaEl.style.display !== 'none';


    if (quizDataLoadedSuccessfully) {
        // If quiz area is meant to be visible and not showing results, re-initialize
        // This handles language change during an active quiz or on first load
        const quizSection = document.getElementById('quiz');
        const isQuizSectionVisible = window.getComputedStyle(quizSection).display !== 'none';

        if (isQuizSectionVisible && !resultsAreaVisible) {
             initializeQuizSession(); // This will load the first question or show error if no questions
        } else if (resultsAreaVisible) {
            // If results are showing, re-render them with new language
            showResults();
        }
    } else if (lang !== previousLang) {
        // Attempted to switch lang, but new quiz data failed to load. Revert or show persistent error.
        // For now, let's try to reload previous language's quiz data if it was available
        const langTranslations = translations[lang] || translations['de'];
        displayQuizError(langTranslations.quizJsonLoading.replace("Lade", "Fehler beim Laden der") + ` quiz_data_${lang}.json. Versuche ${previousLang}...`);
        if (quizDataStore[previousLang]){
            currentQuizData = quizDataStore[previousLang];
            initializeQuizSession();
        } else {
            // Can't even load previous, major issue or first load failed.
        }
    }


    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(err => console.error("MathJax typesetting error on lang change:", err));
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements for quiz logic
    initializeQuizDOMElements();
    setupQuizEventListeners();

    document.getElementById('lang-de-btn').addEventListener('click', () => setLanguage('de'));
    document.getElementById('lang-en-btn').addEventListener('click', () => setLanguage('en'));

    initializeChart(); // Create the chart instance

    // Set initial language and load initial quiz data
    // loadQuizDataForLang will be called by setLanguage
    setLanguage(currentLanguage);
});
