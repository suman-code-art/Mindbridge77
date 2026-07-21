// ==========================================================
// MINDBRIDGE - STRESS CHECK
// File: frontend/js/stress.js
// ==========================================================


import {
    API_BASE_URL
} from "./config.js";

// ==========================================================
// DOM ELEMENTS
// ==========================================================

const statusMessage =
    document.getElementById("statusMessage");


const cameraChoiceSection =
    document.getElementById("cameraChoiceSection");

const cameraSection =
    document.getElementById("cameraSection");

const questionLoadingSection =
    document.getElementById("questionLoadingSection");

const questionnaireSection =
    document.getElementById("questionnaireSection");

const resultLoadingSection =
    document.getElementById("resultLoadingSection");

const resultSection =
    document.getElementById("resultSection");


const startCameraBtn =
    document.getElementById("startCameraBtn");

const skipCameraBtn =
    document.getElementById("skipCameraBtn");

const finishCameraBtn =
    document.getElementById("finishCameraBtn");

const stopCameraBtn =
    document.getElementById("stopCameraBtn");

const restartCameraBtn =
    document.getElementById("restartCameraBtn");


const cameraVideo =
    document.getElementById("cameraVideo");

const cameraCanvas =
    document.getElementById("cameraCanvas");

const cameraAnalysisStatus =
    document.getElementById("cameraAnalysisStatus");

const observationCount =
    document.getElementById("observationCount");

const latestEmotion =
    document.getElementById("latestEmotion");


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

const cameraSummaryBlock =
    document.getElementById("cameraSummaryBlock");

const cameraSummaryText =
    document.getElementById("cameraSummaryText");

const restartCheckBtn =
    document.getElementById("restartCheckBtn");


// ==========================================================
// APPLICATION STATE
// ==========================================================

let mediaStream = null;

let cameraUsed = false;

let cameraRunning = false;

let analysisInterval = null;

let analysisInProgress = false;


let expressionObservations = [];


let questions = [];

let answers = [];

let currentQuestionIndex = 0;


// Analyze one camera frame every 5 seconds.

const ANALYSIS_INTERVAL = 5000;


// ==========================================================
// UTILITY FUNCTIONS
// ==========================================================

function hideElement(element) {

    if (element) {

        element.classList.add(
            "hidden"
        );

    }

}


function showElement(element) {

    if (element) {

        element.classList.remove(
            "hidden"
        );

    }

}


function showStatus(
    message,
    type = "info"
) {

    if (!statusMessage) {

        return;

    }


    statusMessage.textContent =
        message;


    statusMessage.className =
        `status-message ${type}`;


    showElement(
        statusMessage
    );

}


function hideStatus() {

    hideElement(
        statusMessage
    );

}


// ==========================================================
// START CAMERA
// ==========================================================

async function startCamera() {

    hideStatus();


    try {

        if (
            !navigator.mediaDevices
            ||
            !navigator.mediaDevices.getUserMedia
        ) {

            throw new Error(
                "Camera access is not supported by this browser."
            );

        }


        stopCameraStream();


        cameraAnalysisStatus.textContent =
            "Requesting camera access...";


        mediaStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    width: {
                        ideal: 640
                    },

                    height: {
                        ideal: 480
                    },

                    facingMode:
                        "user"

                },

                audio:
                    false

            });


        cameraVideo.srcObject =
            mediaStream;


        await cameraVideo.play();


        cameraUsed =
            true;


        cameraRunning =
            true;


        hideElement(
            cameraChoiceSection
        );


        showElement(
            cameraSection
        );


        hideElement(
            restartCameraBtn
        );


        showElement(
            stopCameraBtn
        );


        cameraAnalysisStatus.textContent =
            "Camera active. Automatic observation will begin shortly.";


        // First analysis after 2 seconds.

        setTimeout(
            () => {

                if (cameraRunning) {

                    analyzeCurrentFrame();

                }

            },
            2000
        );


        // Continue automatically.

        startAutomaticAnalysis();


    }
    catch (error) {

        console.error(
            "Camera Error:",
            error
        );


        showStatus(

            "Unable to start the camera: "
            +
            error.message,

            "error"

        );

    }

}


// ==========================================================
// AUTOMATIC CAMERA ANALYSIS
// ==========================================================

function startAutomaticAnalysis() {

    stopAutomaticAnalysis();


    analysisInterval =
        setInterval(

            async () => {

                if (
                    cameraRunning
                    &&
                    !analysisInProgress
                ) {

                    await analyzeCurrentFrame();

                }

            },

            ANALYSIS_INTERVAL

        );

}


// ==========================================================
// STOP AUTOMATIC ANALYSIS
// ==========================================================

function stopAutomaticAnalysis() {

    if (analysisInterval) {

        clearInterval(
            analysisInterval
        );


        analysisInterval =
            null;

    }

}


// ==========================================================
// CAPTURE AND ANALYZE CAMERA FRAME
// ==========================================================

async function analyzeCurrentFrame() {

    if (
        !cameraRunning
        ||
        !mediaStream
        ||
        analysisInProgress
    ) {

        return;

    }


    if (
        cameraVideo.readyState
        <
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {

        return;

    }


    analysisInProgress =
        true;


    cameraAnalysisStatus.textContent =
        "Analyzing current frame...";


    try {

        const width =
            cameraVideo.videoWidth;


        const height =
            cameraVideo.videoHeight;


        if (
            !width
            ||
            !height
        ) {

            throw new Error(
                "Camera frame is not ready."
            );

        }


        cameraCanvas.width =
            width;


        cameraCanvas.height =
            height;


        const context =
            cameraCanvas.getContext(
                "2d"
            );


        context.drawImage(

            cameraVideo,

            0,

            0,

            width,

            height

        );


        const imageData =
            cameraCanvas.toDataURL(
                "image/jpeg",
                0.8
            );


        const response =
            await fetch(

                `${API_BASE_URL}/api/analyze-expression`,

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            image:
                                imageData

                        })

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.error
                ||
                "Expression analysis failed."

            );

        }


        if (!data.success) {

            throw new Error(

                data.error
                ||
                "Expression analysis was not completed."

            );

        }


        // Support common backend response names.

        const emotion =

            data.dominant_emotion

            ||

            data.emotion

            ||

            data.expression

            ||

            data.result?.dominant_emotion;


        if (emotion) {

            expressionObservations.push(

                String(
                    emotion
                ).toLowerCase()

            );


            observationCount.textContent =
                expressionObservations.length;


            latestEmotion.textContent =
                emotion;


            cameraAnalysisStatus.textContent =
                "Observation completed. Camera monitoring continues.";

        }
        else {

            cameraAnalysisStatus.textContent =
                "Frame analyzed, but no expression observation was returned.";

        }

    }
    catch (error) {

        console.error(

            "Expression Analysis Error:",

            error

        );


        cameraAnalysisStatus.textContent =

            "Could not analyze this frame. "
            +
            "The system will try again automatically.";

    }
    finally {

        analysisInProgress =
            false;

    }

}


// ==========================================================
// STOP CAMERA STREAM
// ==========================================================

function stopCameraStream() {

    stopAutomaticAnalysis();


    if (mediaStream) {

        mediaStream
            .getTracks()
            .forEach(

                track => {

                    track.stop();

                }

            );


        mediaStream =
            null;

    }


    if (cameraVideo) {

        cameraVideo.srcObject =
            null;

    }


    cameraRunning =
        false;

}


// ==========================================================
// STOP CAMERA BUTTON
// ==========================================================

function handleStopCamera() {

    stopCameraStream();


    cameraAnalysisStatus.textContent =
        "Camera stopped. You can restart it or continue to the questionnaire.";


    hideElement(
        stopCameraBtn
    );


    showElement(
        restartCameraBtn
    );

}


// ==========================================================
// RESTART CAMERA
// ==========================================================

async function handleRestartCamera() {

    await startCamera();

}


// ==========================================================
// FINISH CAMERA CHECK
// ==========================================================

async function finishCameraCheck() {

    stopCameraStream();


    hideElement(
        cameraSection
    );


    await generateQuestions();

}


// ==========================================================
// SKIP CAMERA
// ==========================================================

async function skipCamera() {

    cameraUsed =
        false;


    expressionObservations =
        [];


    hideElement(
        cameraChoiceSection
    );


    await generateQuestions();

}


// ==========================================================
// GENERATE GEMINI QUESTIONS
// ==========================================================

async function generateQuestions() {

    hideStatus();


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

                `${API_BASE_URL}/api/generate-stress-questions`,

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            context:
                                "General student wellness self-reflection"

                        })

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.error
                ||
                "Unable to generate questions."

            );

        }


        if (
            !data.success
            ||
            !Array.isArray(
                data.questions
            )
        ) {

            throw new Error(
                "Invalid questionnaire response."
            );

        }


        if (
            data.questions.length
            !==
            7
        ) {

            throw new Error(
                "Expected exactly 7 questions."
            );

        }


        questions =
            data.questions;


        answers =
            new Array(
                questions.length
            ).fill(
                null
            );


        currentQuestionIndex =
            0;


        hideElement(
            questionLoadingSection
        );


        showElement(
            questionnaireSection
        );


        renderQuestion();

    }
    catch (error) {

        console.error(

            "Question Generation Error:",

            error

        );


        hideElement(
            questionLoadingSection
        );


        showElement(
            cameraChoiceSection
        );


        showStatus(

            "Unable to generate the questionnaire: "
            +
            error.message,

            "error"

        );

    }

}


// ==========================================================
// RENDER CURRENT QUESTION
// ==========================================================

function renderQuestion() {

    if (
        !questions.length
    ) {

        return;

    }


    const question =
        questions[
            currentQuestionIndex
        ];


    questionProgress.textContent =

        `Question ${
            currentQuestionIndex + 1
        } of ${
            questions.length
        }`;


    questionText.textContent =
        question.question;


    const progress =
        (
            (
                currentQuestionIndex + 1
            )
            /
            questions.length
        )
        *
        100;


    progressBar.style.width =
        `${progress}%`;


    // Remove previous selection.

    scoreButtons.forEach(

        button => {

            button.classList.remove(
                "selected"
            );

        }

    );


    // Restore answer if user goes back.

    const existingAnswer =
        answers[
            currentQuestionIndex
        ];


    if (existingAnswer) {

        const selectedButton =
            document.querySelector(

                `.score-btn[data-score="${existingAnswer.score}"]`

            );


        if (selectedButton) {

            selectedButton.classList.add(
                "selected"
            );

        }


        nextQuestionBtn.disabled =
            false;

    }
    else {

        nextQuestionBtn.disabled =
            true;

    }


    previousQuestionBtn.disabled =

        currentQuestionIndex
        ===
        0;


    if (
        currentQuestionIndex
        ===
        questions.length - 1
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
// SELECT SCORE
// ==========================================================

function selectScore(event) {

    const button =
        event.currentTarget;


    const score =
        Number(
            button.dataset.score
        );


    scoreButtons.forEach(

        item => {

            item.classList.remove(
                "selected"
            );

        }

    );


    button.classList.add(
        "selected"
    );


    answers[
        currentQuestionIndex
    ] = {

        question:
            questions[
                currentQuestionIndex
            ].question,

        score:
            score

    };


    nextQuestionBtn.disabled =
        false;

}


// ==========================================================
// NEXT QUESTION
// ==========================================================

async function goToNextQuestion() {

    if (
        !answers[
            currentQuestionIndex
        ]
    ) {

        showStatus(

            "Please select an answer from 1 to 5.",

            "error"

        );


        return;

    }


    hideStatus();


    if (
        currentQuestionIndex
        <
        questions.length - 1
    ) {

        currentQuestionIndex++;


        renderQuestion();


        return;

    }


    await submitStressReflection();

}


// ==========================================================
// PREVIOUS QUESTION
// ==========================================================

function goToPreviousQuestion() {

    if (
        currentQuestionIndex
        >
        0
    ) {

        currentQuestionIndex--;


        renderQuestion();

    }

}


// ==========================================================
// SUBMIT FINAL STRESS REFLECTION
// ==========================================================

async function submitStressReflection() {

    hideStatus();


    hideElement(
        questionnaireSection
    );


    showElement(
        resultLoadingSection
    );


    try {

        const response =
            await fetch(

                `${API_BASE_URL}/api/stress-reflection`,

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

                            camera_used:
                                cameraUsed,

                            expression_observations:
                                expressionObservations

                        })

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.error
                ||
                "Unable to generate reflection."

            );

        }


        if (!data.success) {

            throw new Error(

                data.error
                ||
                "Reflection generation failed."

            );

        }


        displayResult(
            data
        );

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


        showStatus(

            "Unable to generate your reflection: "
            +
            error.message,

            "error"

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


    const questionnaire =
        data.questionnaire
        ||
        {};


    resultScore.textContent =

        `${questionnaire.score ?? "--"} / ${
            questionnaire.maximum_score ?? 35
        }`;


    resultLevel.textContent =

        questionnaire.reflection_level

        ||

        "Reflection completed";


    resultReflection.textContent =

        data.reflection

        ||

        "Your reflection has been completed.";


    suggestionsList.innerHTML =
        "";


    const suggestions =
        Array.isArray(
            data.suggestions
        )

        ?

        data.suggestions

        :

        [];


    suggestions.forEach(

        suggestion => {

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


    resultDisclaimer.textContent =

        data.disclaimer

        ||

        (
            "This is a general wellness self-reflection "
            +
            "and is not a medical or mental-health diagnosis."
        );


    if (
        data.camera_summary
    ) {

        const summary =
            data.camera_summary;


        cameraSummaryText.textContent =

            `The optional camera check collected ${
                summary.total_observations
                ??
                expressionObservations.length
            } experimental expression observations. `
            +
            `The most frequently observed expression was "${
                summary.most_observed_expression
                ??
                "not available"
            }". `
            +
            "These observations are contextual only and were not used as a direct measurement of stress.";


        showElement(
            cameraSummaryBlock
        );

    }
    else {

        hideElement(
            cameraSummaryBlock
        );

    }


    resultSection.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}


// ==========================================================
// RESTART COMPLETE CHECK
// ==========================================================

function restartStressCheck() {

    stopCameraStream();


    cameraUsed =
        false;


    expressionObservations =
        [];


    questions =
        [];


    answers =
        [];


    currentQuestionIndex =
        0;


    observationCount.textContent =
        "0";


    latestEmotion.textContent =
        "Waiting...";


    cameraAnalysisStatus.textContent =
        "Starting camera...";


    hideElement(
        cameraSection
    );


    hideElement(
        questionLoadingSection
    );


    hideElement(
        questionnaireSection
    );


    hideElement(
        resultLoadingSection
    );


    hideElement(
        resultSection
    );


    hideElement(
        restartCameraBtn
    );


    showElement(
        stopCameraBtn
    );


    showElement(
        cameraChoiceSection
    );


    hideStatus();


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    });

}


// ==========================================================
// EVENT LISTENERS
// ==========================================================

startCameraBtn.addEventListener(

    "click",

    startCamera

);


skipCameraBtn.addEventListener(

    "click",

    skipCamera

);


finishCameraBtn.addEventListener(

    "click",

    finishCameraCheck

);


stopCameraBtn.addEventListener(

    "click",

    handleStopCamera

);


restartCameraBtn.addEventListener(

    "click",

    handleRestartCamera

);


scoreButtons.forEach(

    button => {

        button.addEventListener(

            "click",

            selectScore

        );

    }

);


nextQuestionBtn.addEventListener(

    "click",

    goToNextQuestion

);


previousQuestionBtn.addEventListener(

    "click",

    goToPreviousQuestion

);


restartCheckBtn.addEventListener(

    "click",

    restartStressCheck

);


// ==========================================================
// CLEAN UP CAMERA WHEN PAGE CLOSES
// ==========================================================

window.addEventListener(

    "beforeunload",

    () => {

        stopCameraStream();

    }

);