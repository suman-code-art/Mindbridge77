// ==========================================================
// MINDBRIDGE - STRESS CHECK
// File: frontend/js/stress.js
// Camera-free questionnaire version
// ==========================================================


// ==========================================================
// IMPORT API CONFIGURATION
// ==========================================================

import {
    API_ENDPOINTS
} from "./config.js";


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
// SHOW / HIDE HELPERS
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


// ==========================================================
// STATUS MESSAGE
// ==========================================================

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
// GENERATE STRESS QUESTIONS
// ==========================================================

async function generateQuestions() {

    console.log(
        "Starting stress questionnaire..."
    );

    hideStatusMessage();

    hideElement(startSection);

    hideElement(questionnaireSection);

    hideElement(resultSection);

    hideElement(resultLoadingSection);

    showElement(questionLoadingSection);


    try {

        console.log(
            "Calling:",
            API_ENDPOINTS.generateStressQuestions
        );


        const response = await fetch(
            API_ENDPOINTS.generateStressQuestions,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    question_count: 7
                })
            }
        );


        // ----------------------------------------------
        // READ RESPONSE
        // ----------------------------------------------

        let data;

        try {

            data = await response.json();

        }

        catch (jsonError) {

            throw new Error(
                "The server returned an invalid response."
            );

        }


        console.log(
            "Question API Response:",
            data
        );


        // ----------------------------------------------
        // HANDLE SERVER ERROR
        // ----------------------------------------------

        if (!response.ok) {

            throw new Error(

                data.error ||
                data.message ||
                "Unable to generate stress questions."

            );

        }


        // ----------------------------------------------
        // EXTRACT QUESTIONS
        // ----------------------------------------------

        if (Array.isArray(data.questions)) {

            questions =
                data.questions;

        }

        else if (
            data.data &&
            Array.isArray(data.data.questions)
        ) {

            questions =
                data.data.questions;

        }

        else if (Array.isArray(data.data)) {

            questions =
                data.data;

        }

        else {

            throw new Error(
                "The server did not return any questions."
            );

        }


        // ----------------------------------------------
        // NORMALIZE QUESTION FORMAT
        // ----------------------------------------------

        questions = questions
            .map((question) => {

                if (
                    typeof question ===
                    "string"
                ) {

                    return question.trim();

                }


                if (
                    question &&
                    typeof question ===
                    "object"
                ) {

                    return (

                        question.question ||

                        question.text ||

                        question.prompt ||

                        ""

                    ).trim();

                }


                return "";

            })
            .filter(Boolean);


        // ----------------------------------------------
        // VERIFY QUESTIONS
        // ----------------------------------------------

        if (questions.length === 0) {

            throw new Error(
                "No valid questions were returned by the server."
            );

        }


        console.log(
            "Stress Questions:",
            questions
        );


        // ----------------------------------------------
        // INITIALIZE QUESTIONNAIRE
        // ----------------------------------------------

        answers =
            new Array(
                questions.length
            ).fill(null);


        currentQuestionIndex =
            0;


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
            "Stress Question Generation Error:",
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

            "Unable to prepare your Stress Check. Please try again."

        );

    }

}


// ==========================================================
// DISPLAY QUESTION
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


    // ------------------------------------------------------
    // QUESTION TEXT
    // ------------------------------------------------------

    if (questionText) {

        questionText.textContent =
            questions[
                currentQuestionIndex
            ];

    }


    // ------------------------------------------------------
    // QUESTION PROGRESS
    // ------------------------------------------------------

    if (questionProgress) {

        questionProgress.textContent =

            `Question ${questionNumber} of ${totalQuestions}`;

    }


    // ------------------------------------------------------
    // PROGRESS BAR
    // ------------------------------------------------------

    if (progressBar) {

        const progressPercentage =

            (
                questionNumber /
                totalQuestions
            ) * 100;


        progressBar.style.width =

            `${progressPercentage}%`;

    }


    // ------------------------------------------------------
    // PREVIOUS BUTTON
    // ------------------------------------------------------

    if (previousQuestionBtn) {

        previousQuestionBtn.disabled =

            currentQuestionIndex === 0;

    }


    // ------------------------------------------------------
    // RESTORE SELECTED ANSWER
    // ------------------------------------------------------

    scoreButtons.forEach(
        (button) => {

            button.classList.remove(
                "selected"
            );


            const buttonScore =

                Number(
                    button.dataset.score
                );


            const savedAnswer =

                answers[
                    currentQuestionIndex
                ];


            if (
                savedAnswer ===
                buttonScore
            ) {

                button.classList.add(
                    "selected"
                );

            }

        }
    );


    // ------------------------------------------------------
    // NEXT BUTTON
    // ------------------------------------------------------

    if (nextQuestionBtn) {

        const currentAnswer =

            answers[
                currentQuestionIndex
            ];


        nextQuestionBtn.disabled =

            currentAnswer === null;


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


                // ------------------------------------------
                // SAVE ANSWER
                // ------------------------------------------

                answers[
                    currentQuestionIndex
                ] = selectedScore;


                // ------------------------------------------
                // REMOVE OLD SELECTION
                // ------------------------------------------

                scoreButtons.forEach(
                    (item) => {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


                // ------------------------------------------
                // HIGHLIGHT NEW SELECTION
                // ------------------------------------------

                button.classList.add(
                    "selected"
                );


                // ------------------------------------------
                // ENABLE NEXT BUTTON
                // ------------------------------------------

                if (nextQuestionBtn) {

                    nextQuestionBtn.disabled =
                        false;

                }

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

            // ----------------------------------------------
            // REQUIRE ANSWER
            // ----------------------------------------------

            if (

                answers[
                    currentQuestionIndex
                ] === null

            ) {

                showStatusMessage(
                    "Please select an answer before continuing."
                );

                return;

            }


            hideStatusMessage();


            // ----------------------------------------------
            // GO TO NEXT QUESTION
            // ----------------------------------------------

            if (

                currentQuestionIndex <

                questions.length - 1

            ) {

                currentQuestionIndex++;

                displayQuestion();

                return;

            }


            // ----------------------------------------------
            // FINISHED ALL QUESTIONS
            // ----------------------------------------------

            analyzeStress();

        }
    );

}


// ==========================================================
// ANALYZE STRESS QUESTIONNAIRE
// ==========================================================

async function analyzeStress() {

    console.log(
        "Submitting stress questionnaire..."
    );


    hideStatusMessage();

    hideElement(
        questionnaireSection
    );

    showElement(
        resultLoadingSection
    );


    try {

        // ----------------------------------------------
        // CREATE QUESTION / ANSWER STRUCTURE
        // ----------------------------------------------

        const responses =

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


        console.log(
            "Stress Responses:",
            responses
        );


        console.log(
            "Calling:",
            API_ENDPOINTS.analyzeStress
        );


        // ----------------------------------------------
        // SEND TO BACKEND
        // ----------------------------------------------

        const response = await fetch(
            API_ENDPOINTS.analyzeStress,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    answers:
                        answers,

                    responses:
                        responses

                })
            }
        );


        // ----------------------------------------------
        // READ RESPONSE
        // ----------------------------------------------

        let data;

        try {

            data =
                await response.json();

        }

        catch (jsonError) {

            throw new Error(
                "The server returned an invalid analysis response."
            );

        }


        console.log(
            "Stress Analysis Response:",
            data
        );


        // ----------------------------------------------
        // HANDLE SERVER ERROR
        // ----------------------------------------------

        if (!response.ok) {

            throw new Error(

                data.error ||

                data.message ||

                "Unable to analyze your responses."

            );

        }


        // ----------------------------------------------
        // SHOW RESULT
        // ----------------------------------------------

        displayResult(data);

    }

    catch (error) {

        console.error(
            "Stress Analysis Error:",
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

            "Unable to prepare your reflection. Please try again."

        );

    }

}


// ==========================================================
// DISPLAY RESULT
// ==========================================================

function displayResult(data) {

    hideElement(
        resultLoadingSection
    );


    showElement(
        resultSection
    );


    // ======================================================
    // CALCULATE FALLBACK SCORE
    // ======================================================

    const calculatedScore =

        answers.reduce(
            (
                total,
                score
            ) => {

                return (

                    total +

                    Number(
                        score || 0
                    )

                );

            },
            0
        );


    // ======================================================
    // SCORE
    // ======================================================

    if (resultScore) {

        resultScore.textContent =

            data.score ??

            data.total_score ??

            data.stress_score ??

            calculatedScore;

    }


    // ======================================================
    // STRESS / REFLECTION LEVEL
    // ======================================================

    if (resultLevel) {

        resultLevel.textContent =

            data.level ??

            data.stress_level ??

            data.category ??

            "Reflection Complete";

    }


    // ======================================================
    // AI REFLECTION
    // ======================================================

    if (resultReflection) {

        resultReflection.textContent =

            data.reflection ??

            data.message ??

            data.analysis ??

            data.summary ??

            "Thank you for taking a moment to reflect on how you have been feeling.";

    }


    // ======================================================
    // SUGGESTIONS
    // ======================================================

    if (suggestionsList) {

        suggestionsList.innerHTML =
            "";


        let suggestions =

            data.suggestions ??

            data.recommendations ??

            data.wellness_suggestions ??

            [];


        // --------------------------------------------------
        // CONVERT STRING TO ARRAY
        // --------------------------------------------------

        if (
            typeof suggestions ===
            "string"
        ) {

            suggestions = [
                suggestions
            ];

        }


        // --------------------------------------------------
        // DISPLAY BACKEND SUGGESTIONS
        // --------------------------------------------------

        if (

            Array.isArray(
                suggestions
            ) &&

            suggestions.length > 0

        ) {

            suggestions.forEach(
                (suggestion) => {

                    const listItem =

                        document.createElement(
                            "li"
                        );


                    if (
                        typeof suggestion ===
                        "string"
                    ) {

                        listItem.textContent =
                            suggestion;

                    }

                    else {

                        listItem.textContent =

                            suggestion.text ||

                            suggestion.message ||

                            "Take a moment to focus on your wellbeing.";

                    }


                    suggestionsList.appendChild(
                        listItem
                    );

                }
            );

        }

        else {

            // ----------------------------------------------
            // FALLBACK WELLNESS SUGGESTIONS
            // ----------------------------------------------

            const defaultSuggestions = [

                "Take a short break and give yourself time to reset.",

                "Try slow breathing or a brief grounding exercise.",

                "Consider taking a short walk or stepping away from screens for a few minutes.",

                "If something is weighing on you, consider talking with someone you trust."

            ];


            defaultSuggestions.forEach(
                (suggestion) => {

                    const listItem =

                        document.createElement(
                            "li"
                        );


                    listItem.textContent =
                        suggestion;


                    suggestionsList.appendChild(
                        listItem
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

            data.disclaimer ??

            "This result is intended for general wellness and self-reflection only. It is not a medical or mental-health diagnosis.";

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

            // ----------------------------------------------
            // RESET STATE
            // ----------------------------------------------

            questions = [];

            answers = [];

            currentQuestionIndex = 0;


            // ----------------------------------------------
            // RESET UI
            // ----------------------------------------------

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


            // ----------------------------------------------
            // RESET SCORE BUTTONS
            // ----------------------------------------------

            scoreButtons.forEach(
                (button) => {

                    button.classList.remove(
                        "selected"
                    );

                }
            );


            // ----------------------------------------------
            // RESET PROGRESS
            // ----------------------------------------------

            if (progressBar) {

                progressBar.style.width =
                    "0%";

            }


            // ----------------------------------------------
            // SCROLL TO TOP
            // ----------------------------------------------

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
// INITIALIZATION
// ==========================================================

console.log(
    "MindBridge Stress Check initialized."
);

console.log(
    "Generate Questions API:",
    API_ENDPOINTS.generateStressQuestions
);

console.log(
    "Analyze Stress API:",
    API_ENDPOINTS.analyzeStress
);