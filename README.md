# Reinforcement Learning: Interaktive Infografik & Quiz

Dieses Projekt präsentiert eine interaktive Webseite, die detaillierte Einblicke in die Kernkonzepte des Reinforcement Learning (RL) bietet. Die Seite ist als Infografik strukturiert und enthält ein Quiz zur Wissensüberprüfung. Die Inhalte sind sowohl auf Deutsch als auch auf Englisch verfügbar.

## 🌟 Features

* **Detaillierte Erklärungen:** Umfassende Ausarbeitung grundlegender und fortgeschrittener RL-Konzepte, darunter:
    * Grundlagen: Agent-Umgebung-Zyklus, Reward Hypothesis, Diskontierungsfaktor.
    * Markov-Entscheidungsprozesse (MDPs): Definition, Markov-Eigenschaft.
    * Kernherausforderungen: Credit Assignment, Exploration vs. Exploitation.
    * Dynamische Programmierung (DP): Policy Iteration, Value Iteration, Bellman-Gleichungen.
    * Modellfreie Vorhersage: Monte Carlo (MC) Methoden, Temporal Difference (TD) Learning, N-Step TD.
    * Modellfreie Steuerung: Generalisierte Policy Iteration (GPI), SARSA, Q-Learning (inkl. Expected SARSA, Double Q-Learning).
    * Ausblick auf Wertfunktionsapproximation (VFA).
* **Interaktives Quiz:**
    * Fragen werden dynamisch aus JSON-Dateien geladen (`quiz_data_de.json`, `quiz_data_en.json`).
    * Anzahl der Fragen wählbar (5, 10, 15, Alle).
    * Sofortiges Feedback zu Antworten.
    * Anzeige der korrekten Antwort bei falscher Auswahl.
    * Ergebnisanzeige am Ende des Quiz samt benötigter Zeit.
    * Sofortige Erläuterungen nach falschen Antworten, sofern verfügbar.
    * Möglichkeit zur Überprüfung falsch beantworteter Fragen mit Erklärungen (sofern in den Quizdaten vorhanden).
    * Fortschrittsanzeige mit Timer.
    * Optional: Generiere auf Knopfdruck eine LLM-basierte Erklärung zur richtigen Antwort (benötigt eigenen OpenAI API Key oder GitHub PAT).
* **Zweisprachigkeit:**
    * Einfacher Wechsel zwischen Deutsch (DE) und Englisch (EN).
    * Alle Texte, Beschriftungen und Quizfragen werden entsprechend angepasst.
* **Visualisierungen:**
    * Ein Balkendiagramm (erstellt mit Chart.js) zum visuellen Vergleich der Eigenschaften von Monte Carlo (MC) und Temporal Difference (TD) Lernmethoden.
    * Mathematische Formeln und Gleichungen werden mit MathJax elegant dargestellt.
* **Responsive Design:**
    * Gestaltet mit Tailwind CSS für eine gute Darstellung auf verschiedenen Bildschirmgrößen.
    * Umschaltbarer Dark-Mode für angenehmes Lesen bei Nacht.

## 🛠️ Verwendete Technologien

* **HTML5:** Für die Grundstruktur der Webseite.
* **CSS3:**
    * Tailwind CSS: Für das Utility-First-Styling.
    * `style.css`: Für benutzerdefinierte Stile und Anpassungen.
* **JavaScript (ES6+):**
    * `main.js`: Hauptlogik, Initialisierung, Sprachumschaltung.
    * `chart_logic.js`: Logik für die Erstellung und Aktualisierung des Chart.js-Diagramms.
    * `quiz_logic.js`: Komplette Logik für das Quiz (Laden, Anzeigen, Auswerten, Review).
    * `translations.js`: Speichert die Übersetzungsstrings für DE und EN.
* **Chart.js:** Für die Erstellung des MC vs. TD Vergleichsdiagramms.
* **MathJax:** Zur Darstellung von LaTeX-formatierten mathematischen Formeln.
* **JSON:** Für die Speicherung der Quizfragen und -antworten.

## 🚀 Ausführen der Infografik

1.  Klone dieses Repository oder lade die Dateien herunter.
2.  Stelle sicher, dass alle Dateien und Ordner (`css`, `js`, `quiz_data_de.json`, `quiz_data_en.json`, `index.html`, `README.md`) im selben Hauptverzeichnis liegen.
3.  Öffne die Datei `index.html` in einem modernen Webbrowser (z.B. Chrome, Firefox, Edge).

Da die Quizdaten (`quiz_data_*.json`) mit `fetch` geladen werden, kann es bei lokaler Ausführung (über `file://` Protokoll) in manchen Browsern zu CORS-Problemen kommen. In diesem Fall:
* Nutze eine Browser-Erweiterung, die lokale CORS-Beschränkungen umgeht (nur für Entwicklungszwecke).
* Oder stelle die Dateien über einen lokalen Webserver bereit (z.B. mit Python: `python -m http.server` im Hauptverzeichnis, dann `http://localhost:8000` im Browser öffnen).

## 📁 Projektstruktur

```
/
├── index.html          # Die Hauptseite der Infografik
├── README.md           # Diese Readme-Datei
├── css/
│   └── style.css       # Benutzerdefinierte CSS-Stile
├── js/
│   ├── main.js         # Haupt-JavaScript-Datei für Seitenlogik und Sprachumschaltung
│   ├── chart_logic.js  # JavaScript für die Chart.js Diagrammlogik
│   ├── quiz_logic.js   # JavaScript für die Quizlogik
│   └── translations.js # Enthält die Übersetzungen für DE und EN
├── quiz_data_de.json   # Quizfragen und -antworten auf Deutsch
└── quiz_data_en.json   # Quizfragen und -antworten auf Englisch
```

## 📖 Nutzung

* **Sprache wechseln:** Klicke auf die "Deutsch" oder "English" Buttons oben rechts, um die Sprache der gesamten Seite inklusive des Quiz zu ändern.
* **Quiz starten:** Wähle die gewünschte Anzahl an Fragen aus dem Dropdown-Menü im Quiz-Bereich. Das Quiz startet dann automatisch.
* **Quiz spielen:** Lies die Frage und wähle eine der angebotenen Optionen aus. Du erhältst sofort Feedback. Klicke auf "Nächste Frage", um fortzufahren.
* **Ergebnisse ansehen:** Nach der letzten Frage werden deine Ergebnisse angezeigt.
* **Fehleranalyse:** Wenn du Fragen falsch beantwortet hast, erscheint ein Bereich zur Fehleranalyse, in dem deine falsche Antwort, die richtige Antwort und ggf. eine Erklärung angezeigt werden.
* **Diagramm ansehen:** Scrolle zum Bereich "Modellfreie Vorhersage", um das Diagramm zu sehen, das MC- und TD-Methoden vergleicht. Die Beschriftungen des Diagramms ändern sich ebenfalls mit der Sprachauswahl.
* **LLM-Erklärungen aktivieren:** Speichere entweder deinen OpenAI API Key (`localStorage.setItem('openaiApiKey', 'sk-...')`) oder ein GitHub Personal Access Token mit `models:read`-Rechten (`localStorage.setItem('githubPat', 'ghp_...')`) im Browser. Danach kannst du über den Button "Erklärung generieren" eine kurze Begründung abrufen.

## 📄 Lizenz

Dieses Projekt dient Bildungszwecken. Der Inhalt basiert auf Standard-RL-Konzepten und Vorlesungsmaterialien. Der Code kann frei verwendet und modifiziert werden, vorzugsweise unter Nennung der Inspirationsquellen für die Inhalte. (Eine formale Lizenz wie MIT könnte hier noch ergänzt werden, falls gewünscht).
