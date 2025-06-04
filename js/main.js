// js/main.js
let currentLanguage = 'de'; // Default language
let isDarkMode = false;
let githubPatInput, githubPatSaveBtn, githubPatSavedMsg;
let settingsVisible = false;

function applyDarkMode(state) {
    document.body.classList.toggle('dark-mode', state);
    const btn = document.getElementById('dark-mode-toggle');
    if (btn) btn.textContent = state ? '☀️' : '🌙';
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
    applyDarkMode(isDarkMode);
}

function toggleSettings() {
    settingsVisible = !settingsVisible;
    const settingsSection = document.getElementById('settings');
    if (settingsSection) {
        settingsSection.style.display = settingsVisible ? 'block' : 'none';
    }
}

function initializePatElements() {
    githubPatInput = document.getElementById('github-pat-input');
    githubPatSaveBtn = document.getElementById('github-pat-save-btn');
    githubPatSavedMsg = document.getElementById('github-pat-saved');

    if (githubPatSaveBtn && githubPatInput) {
        githubPatSaveBtn.addEventListener('click', () => {
            const token = githubPatInput.value.trim();
            if (token) {
                localStorage.setItem('githubPat', token);
                if (githubPatSavedMsg) {
                    githubPatSavedMsg.style.display = 'inline';
                    const langTranslations = translations[currentLanguage] || translations['de'];
                    githubPatSavedMsg.textContent = langTranslations.githubPatSaved;
                }
            } else {
                localStorage.removeItem('githubPat');
                if (githubPatSavedMsg) githubPatSavedMsg.style.display = 'none';
            }
        });
    }

    const stored = localStorage.getItem('githubPat');
    if (stored && githubPatInput) {
        githubPatInput.value = stored;
        if (githubPatSavedMsg) githubPatSavedMsg.style.display = 'inline';
    }
}

async function setLanguage(lang) {
    const previousLang = currentLanguage;
    currentLanguage = lang;
    document.documentElement.lang = lang;

    let quizDataLoadedSuccessfully = true;
    if (!quizDataStore[lang]) {
        quizDataLoadedSuccessfully = await loadQuizDataForLang(lang);
    } else {
        currentQuizData = quizDataStore[lang];
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const langTranslations = translations[lang] || translations['de']; // Fallback
        const prevLangTranslations = translations[previousLang] || translations['de'];

        if (langTranslations[key]) {
            el.innerHTML = langTranslations[key];
        } else if (prevLangTranslations[key]) {
            el.innerHTML = prevLangTranslations[key];
        }
        // For select options specifically, we might need to update their text content
        if (el.tagName === 'OPTION' && el.dataset.i18n) {
            el.textContent = langTranslations[el.dataset.i18n] || el.textContent;
        }
    });

    document.title = (translations[lang] && translations[lang].pageTitle) || "Reinforcement Learning Infographic";

    if (githubPatInput) {
        const langTranslations = translations[lang] || translations['de'];
        githubPatInput.placeholder = langTranslations.githubPatPlaceholder;
    }
    if (githubPatSaveBtn) {
        const langTranslations = translations[lang] || translations['de'];
        githubPatSaveBtn.textContent = langTranslations.githubPatSaveButton;
    }
    if (githubPatSavedMsg) {
        const langTranslations = translations[lang] || translations['de'];
        githubPatSavedMsg.textContent = langTranslations.githubPatSaved;
    }

    document.getElementById('lang-de-btn').classList.toggle('active', lang === 'de');
    document.getElementById('lang-en-btn').classList.toggle('active', lang === 'en');

    updateChartLanguage();

    const resultsAreaVisible = quizResultsAreaEl && quizResultsAreaEl.style.display !== 'none';

    if (quizDataLoadedSuccessfully) {
        const quizSection = document.getElementById('quiz');
        // Check if quiz section itself is visible; useful if whole sections can be hidden/shown by other logic
        const isQuizSectionCurrentlyRendered = window.getComputedStyle(quizSection).display !== 'none';

        if (isQuizSectionCurrentlyRendered && !resultsAreaVisible) {
             showStartScreen();
        } else if (resultsAreaVisible) {
            showResults(); // Re-render results and review with new language
        }
    } else if (lang !== previousLang) {
        const langTranslations = translations[lang] || translations['de'];
        displayQuizError(langTranslations.quizJsonLoading.replace("Lade", "Fehler beim Laden der") + ` quiz_data_${lang}.json. Versuche ${previousLang}...`);
        if (quizDataStore[previousLang]){
            currentQuizData = quizDataStore[previousLang];
            showStartScreen();
        }
    }

    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(err => console.error("MathJax typesetting error on lang change:", err));
    }
}


document.addEventListener('DOMContentLoaded', () => {
    initializeQuizDOMElements(); // Initialize all quiz related DOM elements
    setupQuizEventListeners();   // Setup event listeners for quiz buttons and select
    initializePatElements();

    document.getElementById('lang-de-btn').addEventListener('click', () => setLanguage('de'));
    document.getElementById('lang-en-btn').addEventListener('click', () => setLanguage('en'));

    const storedDark = localStorage.getItem('darkMode');
    isDarkMode = storedDark === 'true';
    applyDarkMode(isDarkMode);
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
    const settingsToggleBtn = document.getElementById('settings-toggle');
    if (settingsToggleBtn) settingsToggleBtn.addEventListener('click', toggleSettings);

    initializeChart();

    setLanguage(currentLanguage); // Initial language setting and quiz setup
});