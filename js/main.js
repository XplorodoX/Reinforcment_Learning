// js/main.js
let currentLanguage = 'de'; // Default language

// Optional: Dark Mode Logic
const themeToggleBtn = document.getElementById('theme-toggle-btn'); // Falls du einen Button hinzufügst

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    }
    // Wichtig: Diagramm neu zeichnen oder Farben aktualisieren, wenn das Theme wechselt
    // Dies erfordert eine Erweiterung in chart_logic.js, um Theme-abhängige Farben zu verwenden
    // oder das Diagramm mit neuer Konfiguration neu zu initialisieren.
    if (typeof updateChartLanguage === 'function') { // Sicherstellen, dass die Funktion existiert
        updateChartLanguage(); // Dies aktualisiert auch das Diagramm, was Farben neu setzen könnte, wenn getChartConfig theme-aware ist
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(newTheme);
    });
}

// Initial theme setup
// if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
//     applyTheme('dark');
// } else {
//     applyTheme('light');
// }


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
        const langTranslations = translations[lang] || translations['de'];
        const prevLangTranslations = translations[previousLang] || translations['de'];

        let translationText = langTranslations[key] || prevLangTranslations[key] || (el.tagName === 'OPTION' ? el.textContent : el.innerHTML);

        if (el.tagName === 'OPTION' && el.dataset.i18n) {
            el.textContent = translationText;
        } else {
            el.innerHTML = translationText;
        }
    });

    document.title = (translations[lang] && translations[lang].pageTitle) || "Reinforcement Learning Infographic";

    document.getElementById('lang-de-btn').classList.toggle('active', lang === 'de');
    document.getElementById('lang-en-btn').classList.toggle('active', lang === 'en');

    updateChartLanguage(); // Dies muss nach den Übersetzungen erfolgen

    const resultsAreaVisible = quizResultsAreaEl && quizResultsAreaEl.style.display !== 'none';

    if (quizDataLoadedSuccessfully) {
        const quizSection = document.getElementById('quiz');
        const isQuizSectionCurrentlyRendered = quizSection && window.getComputedStyle(quizSection).display !== 'none';

        if (isQuizSectionCurrentlyRendered && !resultsAreaVisible) {
             if (typeof initializeQuizSession === "function") initializeQuizSession();
        } else if (resultsAreaVisible) {
            if (typeof showResults === "function") showResults();
        }
    } else if (lang !== previousLang) {
        const langTranslations = translations[lang] || translations['de'];
        if (typeof displayQuizError === "function") {
            displayQuizError(langTranslations.quizJsonLoading.replace("Lade", "Fehler beim Laden der") + ` quiz_data_${lang}.json. Versuche ${previousLang}...`);
        }
        if (quizDataStore[previousLang]){
            currentQuizData = quizDataStore[previousLang];
            if (typeof initializeQuizSession === "function") initializeQuizSession();
        }
    }

    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(err => console.error("MathJax typesetting error on lang change:", err));
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements (aus quiz_logic.js)
    if (typeof initializeQuizDOMElements === "function") initializeQuizDOMElements();
    if (typeof setupQuizEventListeners === "function") setupQuizEventListeners();

    document.getElementById('lang-de-btn').addEventListener('click', () => setLanguage('de'));
    document.getElementById('lang-en-btn').addEventListener('click', () => setLanguage('en'));

    if (typeof initializeChart === "function") initializeChart();

    // Load initial language settings, which will also trigger quiz loading if appropriate
    setLanguage(currentLanguage);

    // Beispiel für AOS Initialisierung (wenn du es verwendest)
    // if (typeof AOS !== 'undefined') {
    //     AOS.init({
    //         once: true, // Animation nur einmal abspielen
    //         duration: 700, // Dauer der Animation
    //         offset: 50, // Offset (in px) vom ursprünglichen Triggerpunkt
    //         easing: 'ease-in-out', // Standard-Easing
    //     });
    // }
});
