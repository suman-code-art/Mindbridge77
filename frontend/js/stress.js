// ==========================================================
// MINDBRIDGE - STRESS CHECK
// File: frontend/js/stress.js
// Questionnaire-only version
// ==========================================================

import { API_ENDPOINTS } from "./config.js";


// ==========================================================
// DOM ELEMENTS
// ==========================================================

const statusMessage =
    document.getElementById("statusMessage");

const startSection =
    document.getElementById("startSection");

const startCheckBtn =
    document.getElementById("startCheckBtn");

const questionLoadingSection =
    document.getElementById("questionLoadingSection");

const questionnaireSection =
    document.getElementById("questionnaireSection");

const questionProgress =
    document.getElementById("questionProgress");

const progressBar =
    document.getElementById("progressBar");

const questionText =
    document.getElementById("questionText");

const scoreButtons =
    document.querySelectorAll(".score-btn");

const previousQuestionBtn =
    document.getElementById("previousQuestionBtn");

const nextQuestionBtn =
    document.getElementById("nextQuestionBtn");

const resultLoadingSection =
    document.getElementById("resultLoadingSection");

const resultSection =
    document.getElementById("resultSection");

const resultScore =
    document.getElementById("resultScore");

const resultLevel =
    document.getElementById("resultLevel");

const resultReflection =
    document.getElementById("resultReflection");

const suggestionsList =
    document.getElementById("suggestionsList");

const resultDisclaimer =
    document.getElementById("resultDisclaimer");

const restartCheckBtn =
    document.getElementById("restartCheckBtn");


// ==========================================================
// APPLICATION STATE
// ==========================================================

let questions = [];
let answers = [];
let currentQuestionIndex = 0;


// ==========================================================
// UI HELPERS
// ==========================================================

function showElement(element) {

    if (element) {
        element.classList.remove("hidden");
    }

}


function hideElement(element) {

    if (element) {
        element.classList.add("hidden");
    }

}


function showStatusMessage(message) {

    if (!statusMessage) {
        return;
    }

    statusMessage.textContent = message;

    showElement(statusMessage);

}


function hideStatusMessage() {

    if (!statusMessage) {
        return;
    }

    statusMessage.textContent = "";

    hideElement(statusMessage);

}


// ==========================================================
// START STRESS CHECK
// ==========================================================

if (startCheckBtn) {

    startCheckBtn.addEventListener(
        "click",
        generateQuestions
    );

}


// ==========================================================
// GENERATE QUESTIONS USING GEMINI BACKEND
// ==========================================================

async function generateQuestions() {

    console.log(
        "Starting Gemini stress questionnaire..."
    );


    hideStatusMessage();

    hideElement(startSection);

    hideElement(questionnaireSection);

    hideElement(resultSection);

    hideElement(resultLoadingSection);

    showElement(questionLoadingSection);


    try {

        console.log(
            "Calling question endpoint:",
            API_ENDPOINTS.generateStressQuestions
        );


        const response = await fetch(
            API_ENDPOINTS.generateStressQuestions,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    context: ""
                })
            }
        );


        let data;


        try {

            data = await response.json();

        }

        catch (error) {

            throw new Error(
                "The server returned an invalid response."
            );

        }


        console.log(
            "Question API response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to generate stress questions."
            );

        }


        if (
            !data.success ||
            !Array.isArray(data.questions)
        ) {

            throw new Error(
                "The server did not return valid stress questions."
            );

        }


        // Backend returns:
        //
        // [
        //   {
        //      id: 1,
        //      question: "..."
        //   }
        // ]

        questions = data.questions
            .map((item) => {

                if (
                    typeof item === "string"
                ) {

                    return item.trim();

                }


                if (
                    item &&
                    typeof item === "object"
                ) {

                    return String(
                        item.question || ""
                    ).trim();

                }


                return "";

            })
            .filter(Boolean);


        // Backend requires exactly 7 answers later.

        if (questions.length !== 7) {

            throw new Error(
                "The questionnaire must contain exactly 7 questions."
            );

        }


        console.log(
            "Gemini questions loaded:",
            questions
        );


        // Create 7 empty answer positions.

        answers =
            new Array(questions.length)
                .fill(null);


        currentQuestionIndex = 0;


        hideElement(
            questionLoadingSection
        );


        showElement(
            questionnaireSection
        );


        displayQuestion();

    }

    catch (error) {

        console.error(
            "Generate Questions Error:",
            error
        );


        hideElement(
            questionLoadingSection
        );


        showElement(
            startSection
        );


        showStatusMessage(
            error.message ||
            "Unable to generate your questions. Please try again."
        );

    }

}


// ==========================================================
// DISPLAY CURRENT QUESTION
// ==========================================================

function displayQuestion() {

    if (
        questions.length === 0
    ) {

        return;

    }


    const totalQuestions =
        questions.length;


    const questionNumber =
        currentQuestionIndex + 1;


    // ======================================================
    // QUESTION TEXT
    // ======================================================

    if (questionText) {

        questionText.textContent =
            questions[currentQuestionIndex];

    }


    // ======================================================
    // QUESTION NUMBER
    // ======================================================

    if (questionProgress) {

        questionProgress.textContent =
            `Question ${questionNumber} of ${totalQuestions}`;

    }


    // ======================================================
    // PROGRESS BAR
    // ======================================================

    if (progressBar) {

        const percentage =
            (
                questionNumber /
                totalQuestions
            ) * 100;


        progressBar.style.width =
            `${percentage}%`;

    }


    // ======================================================
    // PREVIOUS BUTTON
    // ======================================================

    if (previousQuestionBtn) {

        previousQuestionBtn.disabled =
            currentQuestionIndex === 0;

    }


    // ======================================================
    // RESTORE SELECTED ANSWER
    // ======================================================

    scoreButtons.forEach(
        (button) => {

            button.classList.remove(
                "selected"
            );


            const buttonScore =
                Number(
                    button.dataset.score
                );


            const currentAnswer =
                answers[currentQuestionIndex];


            if (
                currentAnswer === buttonScore
            ) {

                button.classList.add(
                    "selected"
                );

            }

        }
    );


    // ======================================================
    // NEXT BUTTON
    // ======================================================

    if (nextQuestionBtn) {

        nextQuestionBtn.disabled =
            answers[currentQuestionIndex] === null;


        if (
            currentQuestionIndex ===
            totalQuestions - 1
        ) {

            nextQuestionBtn.textContent =
                "View My Reflection";

        }

        else {

            nextQuestionBtn.textContent =
                "Next Question";

        }

    }

}


// ==========================================================
// SCORE SELECTION
// ==========================================================

scoreButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const selectedScore =
                    Number(
                        button.dataset.score
                    );


                // Only accept 1-5.

                if (
                    selectedScore < 1 ||
                    selectedScore > 5
                ) {

                    return;

                }


                // Save answer.

                answers[currentQuestionIndex] =
                    selectedScore;


                // Remove previous selection.

                scoreButtons.forEach(
                    (item) => {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


                // Highlight selected button.

                button.classList.add(
                    "selected"
                );


                // Enable next button.

                if (nextQuestionBtn) {

                    nextQuestionBtn.disabled =
                        false;

                }


                hideStatusMessage();

            }
        );

    }
);


// ==========================================================
// PREVIOUS QUESTION
// ==========================================================

if (previousQuestionBtn) {

    previousQuestionBtn.addEventListener(
        "click",
        () => {

            if (
                currentQuestionIndex > 0
            ) {

                currentQuestionIndex--;

                displayQuestion();

            }

        }
    );

}


// ==========================================================
// NEXT QUESTION
// ==========================================================

if (nextQuestionBtn) {

    nextQuestionBtn.addEventListener(
        "click",
        () => {

            const currentAnswer =
                answers[currentQuestionIndex];


            if (
                currentAnswer === null
            ) {

                showStatusMessage(
                    "Please select an answer before continuing."
                );

                return;

            }


            hideStatusMessage();


            // More questions remaining.

            if (
                currentQuestionIndex <
                questions.length - 1
            ) {

                currentQuestionIndex++;

                displayQuestion();

                return;

            }


            // All 7 questions completed.

            submitStressReflection();

        }
    );

}


// ==========================================================
// SUBMIT ANSWERS FOR GEMINI REFLECTION
// ==========================================================

async function submitStressReflection() {

    console.log(
        "Submitting questionnaire for Gemini reflection..."
    );


    // Ensure exactly 7 questions.

    if (
        questions.length !== 7 ||
        answers.length !== 7
    ) {

        showStatusMessage(
            "The questionnaire is incomplete. Please restart the Stress Check."
        );

        return;

    }


    // Ensure every answer is valid.

    const allAnswersValid =
        answers.every(
            (score) =>
                Number.isInteger(score) &&
                score >= 1 &&
                score <= 5
        );


    if (!allAnswersValid) {

        showStatusMessage(
            "Please answer all 7 questions before continuing."
        );

        return;

    }


    hideStatusMessage();

    hideElement(
        questionnaireSection
    );

    showElement(
        resultLoadingSection
    );


    try {

        // ==================================================
        // FORMAT EXACTLY AS app.py EXPECTS
        // ==================================================
        //
        // app.py expects:
        //
        // {
        //   answers: [
        //      {
        //          question: "...",
        //          score: 3
        //      }
        //   ]
        // }
        //
        // Exactly 7 objects.
        // ==================================================

        const formattedAnswers =
            questions.map(
                (
                    question,
                    index
                ) => {

                    return {

                        question:
                            question,

                        score:
                            answers[index]

                    };

                }
            );


        const requestBody = {

            answers:
                formattedAnswers

        };


        console.log(
            "Stress Reflection Request:",
            requestBody
        );


        console.log(
            "Calling reflection endpoint:",
            API_ENDPOINTS.stressReflection
        );


        // ==================================================
        // CALL /api/stress-reflection
        // ==================================================

        const response = await fetch(
            API_ENDPOINTS.stressReflection,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        requestBody
                    )
            }
        );


        let data;


        try {

            data =
                await response.json();

        }

        catch (error) {

            throw new Error(
                "The server returned an invalid reflection response."
            );

        }


        console.log(
            "Stress Reflection Response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to generate your stress reflection."
            );

        }


        if (!data.success) {

            throw new Error(
                data.error ||
                "The stress reflection could not be generated."
            );

        }


        displayResult(data);

    }

    catch (error) {

        console.error(
            "Stress Reflection Error:",
            error
        );


        hideElement(
            resultLoadingSection
        );


        showElement(
            questionnaireSection
        );


        showStatusMessage(
            error.message ||
            "Unable to generate your reflection. Please try again."
        );

    }

}


// ==========================================================
// DISPLAY GEMINI REFLECTION RESULT
// ==========================================================

function displayResult(data) {

    hideElement(
        resultLoadingSection
    );


    showElement(
        resultSection
    );


    // ======================================================
    // QUESTIONNAIRE DATA
    // ======================================================

    const questionnaire =
        data.questionnaire || {};


    // ======================================================
    // SCORE
    // ======================================================

    if (resultScore) {

        const score =
            questionnaire.score;


        const maximumScore =
            questionnaire.maximum_score;


        if (
            score !== undefined &&
            maximumScore !== undefined
        ) {

            resultScore.textContent =
                `${score} / ${maximumScore}`;

        }

        else if (
            score !== undefined
        ) {

            resultScore.textContent =
                score;

        }

        else {

            resultScore.textContent =
                "--";

        }

    }


    // ======================================================
    // REFLECTION LEVEL
    // ======================================================

    if (resultLevel) {

        resultLevel.textContent =

            questionnaire.reflection_level ||

            questionnaire.level ||

            "Reflection Complete";

    }


    // ======================================================
    // GEMINI PERSONALIZED REFLECTION
    // ======================================================

    if (resultReflection) {

        resultReflection.textContent =

            data.reflection ||

            "Thank you for taking time to reflect on how you have been feeling recently.";

    }


    // ======================================================
    // GEMINI WELLNESS SUGGESTIONS
    // ======================================================

    if (suggestionsList) {

        suggestionsList.innerHTML =
            "";


        let suggestions =
            data.suggestions || [];


        if (
            typeof suggestions === "string"
        ) {

            suggestions = [
                suggestions
            ];

        }


        if (
            Array.isArray(suggestions) &&
            suggestions.length > 0
        ) {

            suggestions.forEach(
                (suggestion) => {

                    const text =
                        String(
                            suggestion || ""
                        ).trim();


                    if (!text) {

                        return;

                    }


                    const item =
                        document.createElement(
                            "li"
                        );


                    item.textContent =
                        text;


                    suggestionsList.appendChild(
                        item
                    );

                }
            );

        }

        else {

            const fallbackSuggestions = [

                "Take a short break and give yourself time to reset.",

                "Break larger tasks into smaller, manageable steps.",

                "Try a brief breathing or grounding exercise.",

                "Consider talking with someone you trust if you feel overwhelmed."

            ];


            fallbackSuggestions.forEach(
                (suggestion) => {

                    const item =
                        document.createElement(
                            "li"
                        );


                    item.textContent =
                        suggestion;


                    suggestionsList.appendChild(
                        item
                    );

                }
            );

        }

    }


    // ======================================================
    // DISCLAIMER
    // ======================================================

    if (resultDisclaimer) {

        resultDisclaimer.textContent =

            data.disclaimer ||

            "This Stress Check is intended for general wellness and self-reflection only. It is not a medical or mental-health diagnosis.";

    }


    // ======================================================
    // SCROLL TO RESULT
    // ======================================================

    if (resultSection) {

        resultSection.scrollIntoView(
            {
                behavior:
                    "smooth",

                block:
                    "start"
            }
        );

    }

}


// ==========================================================
// RESTART STRESS CHECK
// ==========================================================

if (restartCheckBtn) {

    restartCheckBtn.addEventListener(
        "click",
        () => {

            // Reset state.

            questions = [];

            answers = [];

            currentQuestionIndex = 0;


            // Reset UI.

            hideElement(
                resultSection
            );

            hideElement(
                resultLoadingSection
            );

            hideElement(
                questionnaireSection
            );

            hideElement(
                questionLoadingSection
            );


            showElement(
                startSection
            );


            hideStatusMessage();


            // Clear selected score buttons.

            scoreButtons.forEach(
                (button) => {

                    button.classList.remove(
                        "selected"
                    );

                }
            );


            // Reset progress bar.

            if (progressBar) {

                progressBar.style.width =
                    "0%";

            }


            // Reset button.

            if (nextQuestionBtn) {

                nextQuestionBtn.disabled =
                    true;

                nextQuestionBtn.textContent =
                    "Next Question";

            }


            // Scroll to page top.

            window.scrollTo(
                {
                    top:
                        0,

                    behavior:
                        "smooth"
                }
            );

        }
    );

}


// ==========================================================
// INITIALIZATION / DEBUG
// ==========================================================

console.log(
    "MindBridge Stress Check initialized."
);

console.log(
    "Gemini Question API:",
    API_ENDPOINTS.generateStressQuestions
);

console.log(
    "Gemini Reflection API:",
    API_ENDPOINTS.stressReflection
);