diff --git a/js/quiz_logic.js b/js/quiz_logic.js
index 56a50bb209b4d564be3e114deaa9c13524f62d68..08be4dd565518637d293b893ea842a25520280ca 100644
--- a/js/quiz_logic.js
+++ b/js/quiz_logic.js
@@ -1,126 +1,178 @@
 // js/quiz_logic.js
 let quizDataStore = {};
 let activeQuizQuestions = [];
 let currentQuizData = [];
 let incorrectlyAnswered = []; // Array to store incorrect answers
 
 let currentQuestionIndex = 0;
 let score = 0;
 let selectedOptionElement = null;
 let answerSubmitted = false;
+let quizTimerInterval = null;
+let quizStartTime = null;
 // const MAX_QUIZ_QUESTIONS = 10; // Wird jetzt durch Dropdown gesteuert
 
 // DOM Elements
-let questionTextEl, optionsContainerEl, feedbackAreaEl, nextQuestionBtn, quizResultsAreaEl, scoreTextEl, restartQuizBtn, questionCounterEl, quizQuestionContainerEl, quizLoadingMessageEl, quizNavigationEl, numQuestionsSelectEl, quizReviewContainerEl, quizReviewAreaEl, quizProgressEl;
+let questionTextEl, optionsContainerEl, feedbackAreaEl, nextQuestionBtn, quizResultsAreaEl, scoreTextEl, restartQuizBtn, startQuizBtn, questionCounterEl, quizQuestionContainerEl, quizLoadingMessageEl, quizNavigationEl, numQuestionsSelectEl, quizReviewContainerEl, quizReviewAreaEl, quizProgressEl, timerDisplayEl, finalTimeEl, finalTimeWrapperEl;
 
 function initializeQuizDOMElements() {
     questionTextEl = document.getElementById('question-text');
     optionsContainerEl = document.getElementById('options-container');
     feedbackAreaEl = document.getElementById('quiz-feedback-area');
     nextQuestionBtn = document.getElementById('next-question-btn');
     quizResultsAreaEl = document.getElementById('quiz-results-area');
     scoreTextEl = document.getElementById('score-text');
     restartQuizBtn = document.getElementById('restart-quiz-btn');
+    startQuizBtn = document.getElementById('start-quiz-btn');
     questionCounterEl = document.getElementById('question-counter');
     quizQuestionContainerEl = document.getElementById('quiz-question-container');
     quizLoadingMessageEl = document.getElementById('quiz-loading-message');
     quizNavigationEl = document.getElementById('quiz-navigation');
     numQuestionsSelectEl = document.getElementById('num-questions-select');
     quizReviewContainerEl = document.getElementById('quiz-review-container');
     quizReviewAreaEl = document.getElementById('quiz-review-area');
     quizProgressEl = document.getElementById('quiz-progress');
+    timerDisplayEl = document.getElementById('quiz-timer');
+    finalTimeEl = document.getElementById('final-time');
+    finalTimeWrapperEl = document.getElementById('final-time-wrapper');
 }
 
 
 async function loadQuizDataForLang(lang) {
     if (!quizLoadingMessageEl || !quizQuestionContainerEl || !quizNavigationEl) {
         console.error("Quiz DOM elements not ready for loadQuizDataForLang");
         return false;
     }
     quizLoadingMessageEl.style.display = 'block';
     quizQuestionContainerEl.style.display = 'none';
     quizNavigationEl.style.display = 'none';
     if (quizReviewContainerEl) quizReviewContainerEl.style.display = 'none';
 
 
     try {
         const response = await fetch(`quiz_data_${lang}.json`);
         if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status} for quiz_data_${lang}.json`);
         }
         const data = await response.json();
         quizDataStore[lang] = data;
         currentQuizData = data;
 
         quizLoadingMessageEl.style.display = 'none';
         // Do not show question container yet, initializeQuizSession will handle it
         return true;
     } catch (error) {
         console.error('Failed to load quiz data for language:', lang, error);
         const langTranslations = translations[lang] || translations['de'];
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
 
+function formatTime(ms) {
+    const totalSeconds = Math.floor(ms / 1000);
+    const minutes = Math.floor(totalSeconds / 60);
+    const seconds = totalSeconds % 60;
+    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
+}
+
+function startQuizTimer() {
+    if (!timerDisplayEl) return;
+    quizStartTime = Date.now();
+    timerDisplayEl.style.display = 'inline';
+    updateQuizTimer();
+    if (quizTimerInterval) clearInterval(quizTimerInterval);
+    quizTimerInterval = setInterval(updateQuizTimer, 1000);
+}
+
+function updateQuizTimer() {
+    if (!timerDisplayEl || quizStartTime === null) return;
+    const elapsed = Date.now() - quizStartTime;
+    const langTranslations = translations[currentLanguage] || translations['de'];
+    timerDisplayEl.textContent = `${langTranslations.quiz_timerLabel} ${formatTime(elapsed)}`;
+}
+
+function stopQuizTimer() {
+    if (quizTimerInterval) clearInterval(quizTimerInterval);
+    quizTimerInterval = null;
+}
+
+function resetQuizUI() {
+    if (quizQuestionContainerEl) quizQuestionContainerEl.style.display = 'none';
+    if (quizNavigationEl) quizNavigationEl.style.display = 'none';
+    if (quizResultsAreaEl) quizResultsAreaEl.style.display = 'none';
+    if (quizReviewContainerEl) quizReviewContainerEl.style.display = 'none';
+    if (quizLoadingMessageEl) quizLoadingMessageEl.style.display = 'none';
+    if (startQuizBtn) startQuizBtn.style.display = 'inline-block';
+    stopQuizTimer();
+    if (timerDisplayEl) {
+        timerDisplayEl.textContent = '';
+        timerDisplayEl.style.display = 'none';
+    }
+    if (quizProgressEl) quizProgressEl.style.width = '0%';
+}
+
 function initializeQuizSession() {
     const langTranslations = translations[currentLanguage] || translations['de'];
+    if (startQuizBtn) startQuizBtn.style.display = 'none';
     if (!currentQuizData || currentQuizData.length === 0) {
         displayQuizError(langTranslations.quizJsonLoading.replace("Lade", "Keine Quizdaten verfügbar für") + ` ${currentLanguage}.`);
         activeQuizQuestions = [];
         return;
     }
 
     let numQuestionsToShow = numQuestionsSelectEl.value;
     if (numQuestionsToShow === "all") {
         numQuestionsToShow = currentQuizData.length;
     } else {
         numQuestionsToShow = parseInt(numQuestionsToShow, 10);
     }
 
     let shuffledQuestions = [...currentQuizData];
     shuffleArray(shuffledQuestions);
     activeQuizQuestions = shuffledQuestions.slice(0, Math.min(numQuestionsToShow, shuffledQuestions.length));
 
     currentQuestionIndex = 0;
     score = 0;
     incorrectlyAnswered = []; // Reset incorrect answers
     if (quizProgressEl) {
         quizProgressEl.style.width = '0%';
     }
+    if (finalTimeWrapperEl) finalTimeWrapperEl.style.display = 'none';
+    startQuizTimer();
 
     if (activeQuizQuestions.length > 0) {
         quizResultsAreaEl.style.display = 'none';
         quizReviewContainerEl.style.display = 'none';
         quizReviewAreaEl.innerHTML = ''; // Clear previous review
         quizQuestionContainerEl.style.display = 'block';
         quizNavigationEl.style.display = 'flex';
         loadQuestion();
     } else {
         displayQuizError(langTranslations.quizJsonLoading.replace("Lade", "Keine Quizfragen für die Auswahl verfügbar in") + ` quiz_data_${currentLanguage}.json`);
     }
 }
 
 function displayQuizError(message) {
     if (!quizLoadingMessageEl || !quizQuestionContainerEl || !quizNavigationEl) return;
     quizLoadingMessageEl.innerHTML = message;
     quizLoadingMessageEl.style.display = 'block';
     quizQuestionContainerEl.style.display = 'none';
     quizNavigationEl.style.display = 'none';
     if (quizReviewContainerEl) quizReviewContainerEl.style.display = 'none';
 }
 
 function loadQuestion() {
     const langTranslations = translations[currentLanguage] || translations['de'];
     if (!activeQuizQuestions || activeQuizQuestions.length === 0) {
diff --git a/js/quiz_logic.js b/js/quiz_logic.js
index 56a50bb209b4d564be3e114deaa9c13524f62d68..08be4dd565518637d293b893ea842a25520280ca 100644
--- a/js/quiz_logic.js
+++ b/js/quiz_logic.js
@@ -191,50 +243,56 @@ function submitAnswer() {
     answerSubmitted = true;
     const langTranslations = translations[currentLanguage] || translations['de'];
 
     const selectedOriginalIndex = parseInt(selectedOptionElement.dataset.originalIndex);
     const currentQuestionData = activeQuizQuestions[currentQuestionIndex];
     const correctAnswerOriginalIndex = currentQuestionData.answer;
 
     optionsContainerEl.childNodes.forEach(buttonEl => {
         buttonEl.disabled = true;
         buttonEl.classList.remove('selected');
         if (parseInt(buttonEl.dataset.originalIndex) === correctAnswerOriginalIndex) {
             if (selectedOriginalIndex !== correctAnswerOriginalIndex) {
                  buttonEl.classList.add('correct');
             }
         }
     });
 
     if (selectedOriginalIndex === correctAnswerOriginalIndex) {
         score++;
         feedbackAreaEl.textContent = langTranslations.quiz_feedbackCorrect;
         feedbackAreaEl.className = 'quiz-feedback feedback-correct';
         selectedOptionElement.classList.add('correct');
     } else {
         const correctOptionText = currentQuestionData.options[correctAnswerOriginalIndex];
         feedbackAreaEl.innerHTML = `${langTranslations.quiz_feedbackIncorrectPrefix} "${correctOptionText}"`;
+        if (currentQuestionData.explanation) {
+            const explDiv = document.createElement('div');
+            explDiv.classList.add('quiz-explanation');
+            explDiv.innerHTML = `<span class="label">${langTranslations.quiz_reviewExplanation}</span> ${currentQuestionData.explanation}`;
+            feedbackAreaEl.appendChild(explDiv);
+        }
         feedbackAreaEl.className = 'quiz-feedback feedback-incorrect';
         selectedOptionElement.classList.add('incorrect');
         incorrectlyAnswered.push({
             questionData: currentQuestionData,
             userAnswerIndex: selectedOriginalIndex,
             correctAnswerIndex: correctAnswerOriginalIndex
         });
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
 
 function displayIncorrectReview() {
     const langTranslations = translations[currentLanguage] || translations['de'];
     quizReviewAreaEl.innerHTML = ''; // Clear previous reviews
diff --git a/js/quiz_logic.js b/js/quiz_logic.js
index 56a50bb209b4d564be3e114deaa9c13524f62d68..08be4dd565518637d293b893ea842a25520280ca 100644
--- a/js/quiz_logic.js
+++ b/js/quiz_logic.js
@@ -270,66 +328,80 @@ function displayIncorrectReview() {
                 const explanationEl = document.createElement('div');
                 explanationEl.classList.add('review-item-explanation');
                 explanationEl.innerHTML = `<span class="label">${langTranslations.quiz_reviewExplanation}</span> ${item.questionData.explanation}`;
                 reviewItemEl.appendChild(explanationEl);
             }
             quizReviewAreaEl.appendChild(reviewItemEl);
         });
 
         if (window.MathJax && window.MathJax.typesetPromise) {
             window.MathJax.typesetPromise([quizReviewAreaEl]).catch(function (err) { console.error('MathJax typeset error in review:', err); });
         }
 
     } else {
         quizReviewContainerEl.style.display = 'none';
     }
 }
 
 
 function showResults() {
     const langTranslations = translations[currentLanguage] || translations['de'];
     if (quizQuestionContainerEl) quizQuestionContainerEl.style.display = 'none';
     if (feedbackAreaEl) feedbackAreaEl.style.display = 'none';
     if (quizNavigationEl) quizNavigationEl.style.display = 'none';
     if (quizResultsAreaEl) quizResultsAreaEl.style.display = 'block';
 
+    stopQuizTimer();
+    if (finalTimeWrapperEl && quizStartTime !== null) {
+        const elapsed = Date.now() - quizStartTime;
+        finalTimeEl.textContent = formatTime(elapsed);
+        const labelEl = finalTimeWrapperEl.querySelector('[data-i18n="quiz_finalTimeLabel"]');
+        if (labelEl) labelEl.textContent = langTranslations.quiz_finalTimeLabel;
+        finalTimeWrapperEl.style.display = 'block';
+    }
+
     if (quizProgressEl) {
         quizProgressEl.style.width = '100%';
     }
 
     if (activeQuizQuestions && activeQuizQuestions.length > 0) {
         scoreTextEl.textContent = `${score} ${langTranslations.quiz_scoreOutOf} ${activeQuizQuestions.length} (${((score / activeQuizQuestions.length) * 100).toFixed(0)}%)`;
     } else {
         scoreTextEl.textContent = "N/A"; // Should not happen if quiz started
     }
 
     const finishedTitleEl = quizResultsAreaEl.querySelector('h3[data-i18n="quiz_finishedTitle"]');
     if (finishedTitleEl) finishedTitleEl.textContent = langTranslations.quiz_finishedTitle;
     const scorePrefixEl = quizResultsAreaEl.querySelector('span[data-i18n="quiz_scorePrefix"]');
     if (scorePrefixEl) scorePrefixEl.textContent = langTranslations.quiz_scorePrefix;
     if (restartQuizBtn) restartQuizBtn.textContent = langTranslations.quiz_restartButton;
 
     displayIncorrectReview(); // Display the review section
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
-    if (numQuestionsSelectEl) { // Add event listener for question number change
+    if (startQuizBtn) {
+        startQuizBtn.addEventListener('click', () => {
+            initializeQuizSession();
+        });
+    }
+    if (numQuestionsSelectEl) {
         numQuestionsSelectEl.addEventListener('change', () => {
-            initializeQuizSession(); // Restart quiz with new setting
+            resetQuizUI();
         });
     }
-}
+}
