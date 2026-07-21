// ==========================================================
// MINDBRIDGE - STRESS CHECK
// File: frontend/js/stress.js
// ==========================================================


// ==========================================================
// IMPORT API CONFIGURATION
// ==========================================================

import {
    API_ENDPOINTS
} from "./config.js";


// ==========================================================
// ELEMENTS
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
// HELPER FUNCTIONS
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

function showStatusMessage(
    message
) {

    if (!statusMessage) {

        return;

    }


    statusMessage.textContent =
        message;


    showElement(
        statusMessage
    );

}


function hideStatusMessage() {

    if (!statusMessage) {

        return;

    }


    statusMessage.textContent =
        "";


    hideElement(
        statusMessage
    );

}


// ==========================================================
// START STRESS CHECK
// ==========================================================

if (startCheckBtn) {

    startCheckBtn.addEventListener(

        "click",

        () => {

            generateQuestions();

        }

    );

}


// ==========================================================
// GENERATE QUESTIONS
// ==========================================================

async function generateQuestions() {


    hideStatusMessage();


    hideElement(
        startSection
    );


    hideElement(
        questionnaireSection
    );


    hideElement(
        resultSection
    );


    showElement(
        questionLoadingSection
    );


    try {


        const response =
            await fetch(

                API_ENDPOINTS.generateStressQuestions,

                {

                    method:
                        "POST",


                    headers: {

                        "Content-Type":
                            "application/json"

                    },


                    body:
                        JSON.stringify({

                            question_count: 7

                        })

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.error ||
                data.message ||
                "Could not generate stress questions."

            );

        }


        // ==================================================
        // SUPPORT MULTIPLE BACKEND RESPONSE FORMATS
        // ==================================================

        if (
            Array.isArray(
                data.questions
            )
        ) {

            questions =
                data.questions;

        }

        else if (
            Array.isArray(
                data.data
            )
        ) {

            questions =
                data.data;

        }

        else {

            throw new Error(
                "No questions were returned by the server."
            );

        }


        // ==================================================
        // NORMALIZE QUESTIONS
        // ==================================================

        questions =
            questions.map(

                (question) => {

                    if (
                        typeof question ===
                        "string"
                    ) {

                        return question;

                    }


                    return (

                        question.question ||

                        question.text ||

                        question.prompt ||

                        "How have you been feeling recently?"

                    );

                }

            );


        if (
            questions.length === 0
        ) {

            throw new Error(
                "The server returned an empty questionnaire."
            );

        }


        // ==================================================
        // INITIALIZE ANSWERS
        // ==================================================

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

            "Unable to prepare the stress check. Please try again."

        );


    }

}


// ==========================================================
// DISPLAY CURRENT QUESTION
// ==========================================================

function displayQuestion() {


    if (
        !questions.length
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

    questionText.textContent =
        questions[
            currentQuestionIndex
        ];



    // ======================================================
    // PROGRESS TEXT
    // ======================================================

    questionProgress.textContent =

        `Question ${questionNumber} of ${totalQuestions}`;



    // ======================================================
    // PROGRESS BAR
    // ======================================================

    const progressPercentage =

        (
            questionNumber /
            totalQuestions
        ) * 100;


    progressBar.style.width =

        `${progressPercentage}%`;



    // ======================================================
    // PREVIOUS BUTTON
    // ======================================================

    previousQuestionBtn.disabled =

        currentQuestionIndex === 0;



    // ======================================================
    // RESET SCORE BUTTONS
    // ======================================================

    scoreButtons.forEach(

        (button) => {


            button.classList.remove(
                "selected"
            );


            const score =
                Number(
                    button.dataset.score
                );


            if (
                answers[
                    currentQuestionIndex
                ] === score
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


                answers[
                    currentQuestionIndex
                ] = selectedScore;



                // Remove previous selection

                scoreButtons.forEach(

                    (item) => {

                        item.classList.remove(
                            "selected"
                        );

                    }

                );



                // Highlight current selection

                button.classList.add(
                    "selected"
                );



                // Enable next button

                nextQuestionBtn.disabled =
                    false;


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


            if (

                answers[
                    currentQuestionIndex
                ] === null

            ) {

                return;

            }


            // ==================================================
            // MOVE TO NEXT QUESTION
            // ==================================================

            if (

                currentQuestionIndex <

                questions.length - 1

            ) {


                currentQuestionIndex++;


                displayQuestion();


                return;

            }



            // ==================================================
            // ALL QUESTIONS COMPLETED
            // ==================================================

            analyzeStress();

        }

    );

}


// ==========================================================
// ANALYZE STRESS
// ==========================================================

async function analyzeStress() {


    hideStatusMessage();


    hideElement(
        questionnaireSection
    );


    showElement(
        resultLoadingSection
    );


    try {


        // ==================================================
        // CREATE QUESTION + ANSWER STRUCTURE
        // ==================================================

        const responseData =

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



        // ==================================================
        // CALL BACKEND
        // ==================================================

        const response =

            await fetch(

                API_ENDPOINTS.analyzeStress,

                {

                    method:
                        "POST",


                    headers: {

                        "Content-Type":
                            "application/json"

                    },


                    body:
                        JSON.stringify({

                            answers:
                                answers,

                            responses:
                                responseData

                        })

                }

            );



        const data =

            await response.json();



        if (!response.ok) {

            throw new Error(

                data.error ||

                data.message ||

                "Unable to analyze your responses."

            );

        }



        // ==================================================
        // DISPLAY RESULT
        // ==================================================

        displayResult(
            data
        );


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

function displayResult(
    data
) {


    hideElement(
        resultLoadingSection
    );


    showElement(
        resultSection
    );



    // ======================================================
    // SCORE
    // ======================================================

    const calculatedScore =

        answers.reduce(

            (
                total,
                score
            ) =>

                total +
                Number(
                    score || 0
                ),

            0

        );



    resultScore.textContent =

        data.score ??

        data.total_score ??

        data.stress_score ??

        calculatedScore;



    // ======================================================
    // LEVEL
    // ======================================================

    resultLevel.textContent =

        data.level ??

        data.stress_level ??

        data.category ??

        "Reflection Complete";



    // ======================================================
    // REFLECTION
    // ======================================================

    resultReflection.textContent =

        data.reflection ??

        data.message ??

        data.analysis ??

        data.summary ??

        "Thank you for taking a moment to check in with yourself.";



    // ======================================================
    // SUGGESTIONS
    // ======================================================

    suggestionsList.innerHTML =
        "";


    const suggestions =

        data.suggestions ??

        data.recommendations ??

        data.wellness_suggestions ??

        [];


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


                listItem.textContent =

                    typeof suggestion ===
                    "string"

                        ? suggestion

                        : suggestion.text ||
                          suggestion.message ||
                          JSON.stringify(
                              suggestion
                          );


                suggestionsList.appendChild(
                    listItem
                );


            }

        );


    }

    else {


        const defaultSuggestions = [

            "Take a short break and give yourself time to reset.",

            "Try slow breathing or a brief grounding exercise.",

            "Consider talking with someone you trust if something is weighing on you."

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



    // ======================================================
    // DISCLAIMER
    // ======================================================

    if (resultDisclaimer) {

        resultDisclaimer.textContent =

            data.disclaimer ??

            "This result is intended for general wellness and self-reflection only and is not a medical or mental-health diagnosis.";

    }



    // ======================================================
    // SCROLL TO RESULT
    // ======================================================

    resultSection.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}


// ==========================================================
// RESTART STRESS CHECK
// ==========================================================

if (restartCheckBtn) {

    restartCheckBtn.addEventListener(

        "click",

        () => {


            // Reset application state

            questions =
                [];


            answers =
                [];


            currentQuestionIndex =
                0;



            // Hide result

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


            // Show start screen

            showElement(
                startSection
            );


            hideStatusMessage();



            // Reset button selections

            scoreButtons.forEach(

                (button) => {

                    button.classList.remove(
                        "selected"
                    );

                }

            );


            // Scroll to top

            window.scrollTo({

                top:
                    0,

                behavior:
                    "smooth"

            });


        }

    );

}


// ==========================================================
// DEBUG
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