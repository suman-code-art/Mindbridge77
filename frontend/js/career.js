// ==========================================================
// MINDBRIDGE - CAREER STREAM SELECTOR
// File: frontend/JS/career.js
// ==========================================================


// ==========================================================
// FIREBASE IMPORTS
// ==========================================================

import {
    auth
} from "../firebase/firebase-config.js";


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================================
// BACKEND API
// ==========================================================

import {
    API_BASE_URL
} from "./config.js";


const STREAM_API_URL =
    `${API_BASE_URL}/api/predict-stream`;


// ==========================================================
// AUTH ELEMENTS
// ==========================================================

const authLoading =
    document.getElementById("authLoading");

const careerApp =
    document.getElementById("careerApp");


// ==========================================================
// SIDEBAR ELEMENTS
// ==========================================================

const sidebar =
    document.getElementById("sidebar");

const sidebarToggle =
    document.getElementById("sidebarToggle");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


// ==========================================================
// USER ELEMENTS
// ==========================================================

const sidebarUserName =
    document.getElementById("sidebarUserName");

const sidebarUserEmail =
    document.getElementById("sidebarUserEmail");

const sidebarAvatar =
    document.getElementById("sidebarAvatar");


const headerFullName =
    document.getElementById("headerFullName");

const headerEmail =
    document.getElementById("headerEmail");

const headerAvatar =
    document.getElementById("headerAvatar");


const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================================
// ASSESSMENT ELEMENTS
// ==========================================================

const assessmentIntro =
    document.getElementById("assessmentIntro");

const assessmentSection =
    document.getElementById("assessmentSection");

const analysingSection =
    document.getElementById("analysingSection");

const resultSection =
    document.getElementById("resultSection");


const startAssessmentBtn =
    document.getElementById("startAssessmentBtn");

const careerAssessmentForm =
    document.getElementById("careerAssessmentForm");


const previousBtn =
    document.getElementById("previousBtn");

const nextBtn =
    document.getElementById("nextBtn");

const submitAssessmentBtn =
    document.getElementById("submitAssessmentBtn");


const formError =
    document.getElementById("formError");


// ==========================================================
// PROGRESS ELEMENTS
// ==========================================================

const progressText =
    document.getElementById("progressText");

const progressPercent =
    document.getElementById("progressPercent");

const progressBar =
    document.getElementById("progressBar");


// ==========================================================
// RESULT ELEMENTS
// ==========================================================

const recommendedStream =
    document.getElementById("recommendedStream");

const confidenceValue =
    document.getElementById("confidenceValue");

const streamDescription =
    document.getElementById("streamDescription");

const recommendationReason =
    document.getElementById("recommendationReason");

const careerDirections =
    document.getElementById("careerDirections");

const probabilityList =
    document.getElementById("probabilityList");

const retakeAssessmentBtn =
    document.getElementById("retakeAssessmentBtn");


// ==========================================================
// ASSESSMENT STATE
// ==========================================================

let currentStep = 1;

const totalSteps = 3;


// ==========================================================
// STREAM INFORMATION
// ==========================================================

const streamInformation = {

    Science_PCM: {

        displayName:
            "Science PCM",

        description:
            "Your profile shows a strong alignment with Mathematics, " +
            "Physics-oriented problem solving, technology and logical reasoning.",

        reason:
            "The recommendation is based on the combination of your academic " +
            "scores, mathematical interest, technology interest, logical " +
            "reasoning and problem-solving preferences.",

        careers: [

            "Engineering",

            "Computer Science",

            "Architecture",

            "Data Science",

            "Mathematics",

            "Physics",

            "Technology"

        ]

    },


    Science_PCB: {

        displayName:
            "Science PCB",

        description:
            "Your profile shows a strong alignment with Biology, life sciences, " +
            "scientific exploration and research-oriented learning.",

        reason:
            "The recommendation reflects your Science performance together " +
            "with your interest in Biology, research and analytical exploration.",

        careers: [

            "Medicine",

            "Biotechnology",

            "Life Sciences",

            "Pharmacy",

            "Environmental Science",

            "Research",

            "Healthcare"

        ]

    },


    Commerce: {

        displayName:
            "Commerce",

        description:
            "Your profile shows an alignment with business, finance, economics " +
            "and practical decision-making.",

        reason:
            "The recommendation is influenced by your interest in business, " +
            "finance, communication and analytical thinking.",

        careers: [

            "Business",

            "Finance",

            "Accounting",

            "Economics",

            "Management",

            "Entrepreneurship",

            "Marketing"

        ]

    },


    Arts: {

        displayName:
            "Arts & Humanities",

        description:
            "Your profile shows an alignment with humanities, communication, " +
            "creativity and understanding people and society.",

        reason:
            "The recommendation reflects your interests in humanities and " +
            "social subjects together with creativity and communication strengths.",

        careers: [

            "Psychology",

            "Law",

            "Journalism",

            "Design",

            "Social Sciences",

            "Public Policy",

            "Media"

        ]

    }

};


// ==========================================================
// GET DISPLAY NAME
// ==========================================================

function getDisplayName(user) {

    if (user.displayName) {

        return user.displayName;

    }


    if (user.email) {

        const emailName =
            user.email.split("@")[0];


        return emailName

            .replace(
                /[._-]/g,
                " "
            )

            .replace(

                /\b\w/g,

                character =>
                    character.toUpperCase()

            );

    }


    return "MindBridge User";

}


// ==========================================================
// FIREBASE AUTH STATE
// ==========================================================

onAuthStateChanged(

    auth,

    (user) => {

        if (!user) {

            window.location.replace(
                "./login.html"
            );

            return;

        }


        const name =
            getDisplayName(user);


        const firstName =
            name.split(" ")[0];


        const email =
            user.email || "";


        const initial =
            firstName
                .charAt(0)
                .toUpperCase();


        // --------------------------------------------------
        // Sidebar user
        // --------------------------------------------------

        sidebarUserName.textContent =
            name;

        sidebarUserEmail.textContent =
            email;

        sidebarAvatar.textContent =
            initial;


        // --------------------------------------------------
        // Header user
        // --------------------------------------------------

        headerFullName.textContent =
            name;

        headerEmail.textContent =
            email;

        headerAvatar.textContent =
            initial;


        // --------------------------------------------------
        // Show application
        // --------------------------------------------------

        authLoading.style.display =
            "none";


        careerApp.classList.remove(
            "hidden"
        );


        console.log(
            "Career page loaded for:",
            user.uid
        );

    }

);


// ==========================================================
// LOGOUT
// ==========================================================

logoutBtn.addEventListener(

    "click",

    async () => {

        try {

            await signOut(
                auth
            );


            window.location.replace(
                "./login.html"
            );

        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );


            alert(
                "Unable to log out. Please try again."
            );

        }

    }

);


// ==========================================================
// MOBILE SIDEBAR
// ==========================================================

function openSidebar() {

    sidebar.classList.add(
        "mobile-open"
    );


    sidebarOverlay.classList.add(
        "active"
    );

}


function closeSidebar() {

    sidebar.classList.remove(
        "mobile-open"
    );


    sidebarOverlay.classList.remove(
        "active"
    );

}


sidebarToggle.addEventListener(

    "click",

    () => {

        if (

            sidebar.classList.contains(
                "mobile-open"
            )

        ) {

            closeSidebar();

        }

        else {

            openSidebar();

        }

    }

);


sidebarOverlay.addEventListener(

    "click",

    closeSidebar

);


// ==========================================================
// CLOSE SIDEBAR AFTER MOBILE NAVIGATION
// ==========================================================

const sidebarLinks =
    document.querySelectorAll(
        ".sidebar-link"
    );


sidebarLinks.forEach(

    (link) => {

        link.addEventListener(

            "click",

            () => {

                if (
                    window.innerWidth <= 900
                ) {

                    closeSidebar();

                }

            }

        );

    }

);


// ==========================================================
// WINDOW RESIZE
// ==========================================================

window.addEventListener(

    "resize",

    () => {

        if (
            window.innerWidth > 900
        ) {

            closeSidebar();

        }

    }

);


// ==========================================================
// START ASSESSMENT
// ==========================================================

startAssessmentBtn.addEventListener(

    "click",

    () => {

        assessmentIntro.classList.add(
            "hidden"
        );


        assessmentSection.classList.remove(
            "hidden"
        );


        currentStep = 1;


        updateAssessmentStep();


        assessmentSection.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

);


// ==========================================================
// RATING BUTTONS
// ==========================================================

const ratingQuestions =
    document.querySelectorAll(
        ".rating-question"
    );


ratingQuestions.forEach(

    (question) => {

        const fieldName =
            question.dataset.field;


        const hiddenInput =
            document.getElementById(
                fieldName
            );


        const buttons =
            question.querySelectorAll(
                ".rating-options button"
            );


        buttons.forEach(

            (button) => {

                button.addEventListener(

                    "click",

                    () => {

                        const value =
                            button.dataset.value;


                        // Remove selection from all buttons

                        buttons.forEach(

                            (item) => {

                                item.classList.remove(
                                    "selected"
                                );

                            }

                        );


                        // Select clicked button

                        button.classList.add(
                            "selected"
                        );


                        // Store value

                        hiddenInput.value =
                            value;


                        hideError();

                    }

                );

            }

        );

    }

);


// ==========================================================
// UPDATE ASSESSMENT STEP
// ==========================================================

function updateAssessmentStep() {

    const steps =
        document.querySelectorAll(
            ".form-step"
        );


    steps.forEach(

        (step) => {

            const stepNumber =
                Number(
                    step.dataset.step
                );


            if (
                stepNumber === currentStep
            ) {

                step.classList.add(
                    "active"
                );

            }

            else {

                step.classList.remove(
                    "active"
                );

            }

        }

    );


    // ------------------------------------------------------
    // Progress
    // ------------------------------------------------------

    const percentage =
        Math.round(

            (
                currentStep
                /
                totalSteps
            )

            * 100

        );


    progressText.textContent =
        `Step ${currentStep} of ${totalSteps}`;


    progressPercent.textContent =
        `${percentage}%`;


    progressBar.style.width =
        `${percentage}%`;


    // ------------------------------------------------------
    // Previous button
    // ------------------------------------------------------

    if (
        currentStep === 1
    ) {

        previousBtn.classList.add(
            "hidden"
        );

    }

    else {

        previousBtn.classList.remove(
            "hidden"
        );

    }


    // ------------------------------------------------------
    // Next / Submit buttons
    // ------------------------------------------------------

    if (
        currentStep === totalSteps
    ) {

        nextBtn.classList.add(
            "hidden"
        );


        submitAssessmentBtn.classList.remove(
            "hidden"
        );

    }

    else {

        nextBtn.classList.remove(
            "hidden"
        );


        submitAssessmentBtn.classList.add(
            "hidden"
        );

    }


    hideError();

}


// ==========================================================
// SHOW ERROR
// ==========================================================

function showError(message) {

    formError.textContent =
        message;


    formError.classList.remove(
        "hidden"
    );


    formError.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });

}


// ==========================================================
// HIDE ERROR
// ==========================================================

function hideError() {

    formError.classList.add(
        "hidden"
    );


    formError.textContent =
        "";

}


// ==========================================================
// VALIDATE CURRENT STEP
// ==========================================================

function validateCurrentStep() {

    hideError();


    // ======================================================
    // STEP 1
    // Academic marks
    // ======================================================

    if (
        currentStep === 1
    ) {

        const academicFields = [

            "math_score",

            "science_score",

            "english_score",

            "social_science_score"

        ];


        for (
            const fieldName
            of academicFields
        ) {

            const input =
                document.getElementById(
                    fieldName
                );


            if (
                input.value.trim() === ""
            ) {

                showError(
                    "Please enter all four academic scores."
                );


                input.focus();


                return false;

            }


            const value =
                Number(
                    input.value
                );


            if (

                Number.isNaN(
                    value
                )

                ||

                value < 0

                ||

                value > 100

            ) {

                showError(
                    "Academic scores must be between 0 and 100."
                );


                input.focus();


                return false;

            }

        }

    }


    // ======================================================
    // STEP 2
    // Interests
    // ======================================================

    if (
        currentStep === 2
    ) {

        const interestFields = [

            "math_interest",

            "biology_interest",

            "technology_interest",

            "business_interest",

            "finance_interest",

            "humanities_interest"

        ];


        for (
            const fieldName
            of interestFields
        ) {

            const input =
                document.getElementById(
                    fieldName
                );


            if (
                !input.value
            ) {

                showError(
                    "Please rate every interest before continuing."
                );


                return false;

            }

        }

    }


    // ======================================================
    // STEP 3
    // Aptitudes
    // ======================================================

    if (
        currentStep === 3
    ) {

        const aptitudeFields = [

            "logical_reasoning",

            "problem_solving",

            "creativity",

            "communication",

            "research_interest"

        ];


        for (
            const fieldName
            of aptitudeFields
        ) {

            const input =
                document.getElementById(
                    fieldName
                );


            if (
                !input.value
            ) {

                showError(
                    "Please rate every aptitude before getting your recommendation."
                );


                return false;

            }

        }

    }


    return true;

}


// ==========================================================
// NEXT STEP
// ==========================================================

nextBtn.addEventListener(

    "click",

    () => {

        if (
            !validateCurrentStep()
        ) {

            return;

        }


        if (
            currentStep < totalSteps
        ) {

            currentStep++;


            updateAssessmentStep();


            assessmentSection.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

        }

    }

);


// ==========================================================
// PREVIOUS STEP
// ==========================================================

previousBtn.addEventListener(

    "click",

    () => {

        if (
            currentStep > 1
        ) {

            currentStep--;


            updateAssessmentStep();


            assessmentSection.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

        }

    }

);


// ==========================================================
// BUILD ASSESSMENT DATA
// ==========================================================

function buildAssessmentData() {

    return {

        // --------------------------------------------------
        // Academic scores
        // --------------------------------------------------

        math_score:

            Number(
                document.getElementById(
                    "math_score"
                ).value
            ),


        science_score:

            Number(
                document.getElementById(
                    "science_score"
                ).value
            ),


        english_score:

            Number(
                document.getElementById(
                    "english_score"
                ).value
            ),


        social_science_score:

            Number(
                document.getElementById(
                    "social_science_score"
                ).value
            ),


        // --------------------------------------------------
        // Interests
        // --------------------------------------------------

        math_interest:

            Number(
                document.getElementById(
                    "math_interest"
                ).value
            ),


        biology_interest:

            Number(
                document.getElementById(
                    "biology_interest"
                ).value
            ),


        technology_interest:

            Number(
                document.getElementById(
                    "technology_interest"
                ).value
            ),


        business_interest:

            Number(
                document.getElementById(
                    "business_interest"
                ).value
            ),


        finance_interest:

            Number(
                document.getElementById(
                    "finance_interest"
                ).value
            ),


        humanities_interest:

            Number(
                document.getElementById(
                    "humanities_interest"
                ).value
            ),


        // --------------------------------------------------
        // Aptitudes
        // --------------------------------------------------

        logical_reasoning:

            Number(
                document.getElementById(
                    "logical_reasoning"
                ).value
            ),


        problem_solving:

            Number(
                document.getElementById(
                    "problem_solving"
                ).value
            ),


        creativity:

            Number(
                document.getElementById(
                    "creativity"
                ).value
            ),


        communication:

            Number(
                document.getElementById(
                    "communication"
                ).value
            ),


        research_interest:

            Number(
                document.getElementById(
                    "research_interest"
                ).value
            )

    };

}


// ==========================================================
// SUBMIT ASSESSMENT
// ==========================================================

careerAssessmentForm.addEventListener(

    "submit",

    async (event) => {

        event.preventDefault();


        // --------------------------------------------------
        // Validate final step
        // --------------------------------------------------

        if (
            !validateCurrentStep()
        ) {

            return;

        }


        // --------------------------------------------------
        // Build JSON
        // --------------------------------------------------

        const assessmentData =
            buildAssessmentData();


        console.log(
            "Assessment data:",
            assessmentData
        );


        // --------------------------------------------------
        // Hide form
        // --------------------------------------------------

        assessmentSection.classList.add(
            "hidden"
        );


        // --------------------------------------------------
        // Show analysing state
        // --------------------------------------------------

        analysingSection.classList.remove(
            "hidden"
        );


        analysingSection.scrollIntoView({

            behavior:
                "smooth",

            block:
                "center"

        });


        try {

            // ==================================================
            // SEND DATA TO FLASK ML API
            // ==================================================

            const response =
                await fetch(

                    STREAM_API_URL,

                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                assessmentData
                            )

                    }

                );


            // --------------------------------------------------
            // Parse response
            // --------------------------------------------------

            const result =
                await response.json();


            // --------------------------------------------------
            // Handle backend errors
            // --------------------------------------------------

            if (

                !response.ok

                ||

                !result.success

            ) {

                throw new Error(

                    result.error

                    ||

                    "Unable to generate recommendation."

                );

            }


            console.log(
                "Stream prediction:",
                result
            );


            // --------------------------------------------------
            // Small delay so analysing animation is visible
            // --------------------------------------------------

            await new Promise(

                resolve =>

                    setTimeout(
                        resolve,
                        900
                    )

            );


            // --------------------------------------------------
            // Display result
            // --------------------------------------------------

            displayResult(
                result
            );

        }

        catch (error) {

            console.error(
                "Stream prediction error:",
                error
            );


            analysingSection.classList.add(
                "hidden"
            );


            assessmentSection.classList.remove(
                "hidden"
            );


            showError(

                error.message

                ||

                "Unable to connect to the MindBridge prediction server."

            );


            assessmentSection.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

        }

    }

);


// ==========================================================
// FORMAT STREAM NAME
// ==========================================================

function formatStreamName(
    stream
) {

    if (
        streamInformation[
            stream
        ]
    ) {

        return streamInformation[
            stream
        ].displayName;

    }


    return stream.replace(
        /_/g,
        " "
    );

}


// ==========================================================
// DISPLAY RESULT
// ==========================================================

function displayResult(
    result
) {

    // ------------------------------------------------------
    // Hide analysing
    // ------------------------------------------------------

    analysingSection.classList.add(
        "hidden"
    );


    // ------------------------------------------------------
    // Get recommendation
    // ------------------------------------------------------

    const stream =
        result.recommended_stream;


    const information =
        streamInformation[
            stream
        ];


    // ------------------------------------------------------
    // Main result
    // ------------------------------------------------------

    recommendedStream.textContent =

        information

            ? information.displayName

            : formatStreamName(
                stream
            );


    confidenceValue.textContent =

        `${Number(
            result.confidence
        ).toFixed(1)}%`;


    // ------------------------------------------------------
    // Description
    // ------------------------------------------------------

    if (
        information
    ) {

        streamDescription.textContent =
            information.description;


        recommendationReason.textContent =
            information.reason;

    }

    else {

        streamDescription.textContent =
            "Your assessment indicates that this stream may align with your profile.";


        recommendationReason.textContent =
            "The recommendation was generated from your academic scores, interests and aptitude responses.";

    }


    // ------------------------------------------------------
    // Career directions
    // ------------------------------------------------------

    careerDirections.innerHTML =
        "";


    if (
        information
    ) {

        information.careers.forEach(

            (career) => {

                const tag =
                    document.createElement(
                        "span"
                    );


                tag.className =
                    "career-tag";


                tag.textContent =
                    career;


                careerDirections.appendChild(
                    tag
                );

            }

        );

    }


    // ------------------------------------------------------
    // Probability breakdown
    // ------------------------------------------------------

    displayProbabilities(

        result.probabilities

    );


    // ------------------------------------------------------
    // Show result
    // ------------------------------------------------------

    resultSection.classList.remove(
        "hidden"
    );


    resultSection.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}


// ==========================================================
// DISPLAY PROBABILITIES
// ==========================================================

function displayProbabilities(
    probabilities
) {

    probabilityList.innerHTML =
        "";


    // ------------------------------------------------------
    // Convert object to array
    // ------------------------------------------------------

    const probabilityEntries =

        Object.entries(
            probabilities
        );


    // ------------------------------------------------------
    // Sort highest to lowest
    // ------------------------------------------------------

    probabilityEntries.sort(

        (
            first,
            second
        ) =>

            second[1]
            -
            first[1]

    );


    // ------------------------------------------------------
    // Create probability bars
    // ------------------------------------------------------

    probabilityEntries.forEach(

        (
            [
                stream,
                probability
            ]
        ) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "probability-item";


            // --------------------------------------------------
            // Name
            // --------------------------------------------------

            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "probability-name";


            name.textContent =
                formatStreamName(
                    stream
                );


            // --------------------------------------------------
            // Track
            // --------------------------------------------------

            const track =
                document.createElement(
                    "div"
                );


            track.className =
                "probability-track";


            // --------------------------------------------------
            // Fill
            // --------------------------------------------------

            const fill =
                document.createElement(
                    "div"
                );


            fill.className =
                "probability-fill";


            // Start at zero for animation

            fill.style.width =
                "0%";


            track.appendChild(
                fill
            );


            // --------------------------------------------------
            // Percentage
            // --------------------------------------------------

            const value =
                document.createElement(
                    "span"
                );


            value.className =
                "probability-value";


            value.textContent =

                `${Number(
                    probability
                ).toFixed(1)}%`;


            // --------------------------------------------------
            // Add elements
            // --------------------------------------------------

            item.appendChild(
                name
            );


            item.appendChild(
                track
            );


            item.appendChild(
                value
            );


            probabilityList.appendChild(
                item
            );


            // --------------------------------------------------
            // Animate bar
            // --------------------------------------------------

            requestAnimationFrame(

                () => {

                    requestAnimationFrame(

                        () => {

                            fill.style.width =

                                `${Math.min(
                                    Number(
                                        probability
                                    ),
                                    100
                                )}%`;

                        }

                    );

                }

            );

        }

    );

}


// ==========================================================
// RESET RATING BUTTONS
// ==========================================================

function resetRatingButtons() {

    const ratingButtons =
        document.querySelectorAll(
            ".rating-options button"
        );


    ratingButtons.forEach(

        (button) => {

            button.classList.remove(
                "selected"
            );

        }

    );

}


// ==========================================================
// RETAKE ASSESSMENT
// ==========================================================

retakeAssessmentBtn.addEventListener(

    "click",

    () => {

        // --------------------------------------------------
        // Reset form
        // --------------------------------------------------

        careerAssessmentForm.reset();


        resetRatingButtons();


        // --------------------------------------------------
        // Reset state
        // --------------------------------------------------

        currentStep = 1;


        updateAssessmentStep();


        // --------------------------------------------------
        // Hide results
        // --------------------------------------------------

        resultSection.classList.add(
            "hidden"
        );


        analysingSection.classList.add(
            "hidden"
        );


        // --------------------------------------------------
        // Show assessment
        // --------------------------------------------------

        assessmentSection.classList.remove(
            "hidden"
        );


        assessmentSection.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

);


// ==========================================================
// INITIALISE
// ==========================================================

updateAssessmentStep();


console.log(
    "MindBridge Career Stream Selector loaded."
);