// ==========================================================
// MINDBRIDGE - IMMEDIATE HELP MODE
// File: frontend/js/immediate-help.js
// ==========================================================


// ==========================================================
// FIREBASE
// ==========================================================

import {
    auth
} from "../firebase/firebase-config.js";


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================================
// PAGE ELEMENTS
// ==========================================================

const authLoading =
    document.getElementById("authLoading");

const helpApp =
    document.getElementById("helpApp");

const userName =
    document.getElementById("userName");

const userEmail =
    document.getElementById("userEmail");

const userAvatar =
    document.getElementById("userAvatar");

const logoutBtn =
    document.getElementById("logoutBtn");

const sidebarToggle =
    document.getElementById("sidebarToggle");

const sidebar =
    document.getElementById("sidebar");


// ==========================================================
// TOOL ELEMENTS
// ==========================================================

const toolCards =
    document.querySelectorAll(".tool-card");

const breathingSection =
    document.getElementById("breathingSection");

const groundingSection =
    document.getElementById("groundingSection");

const resetSection =
    document.getElementById("resetSection");


// ==========================================================
// BREATHING ELEMENTS
// ==========================================================

const breathingCircle =
    document.getElementById("breathingCircle");

const breathingText =
    document.getElementById("breathingText");

const breathingTimer =
    document.getElementById("breathingTimer");

const cycleStatus =
    document.getElementById("cycleStatus");

const startBreathingBtn =
    document.getElementById("startBreathingBtn");

const stopBreathingBtn =
    document.getElementById("stopBreathingBtn");


// ==========================================================
// GROUNDING ELEMENTS
// ==========================================================

const groundingNumber =
    document.getElementById("groundingNumber");

const groundingSense =
    document.getElementById("groundingSense");

const groundingTitle =
    document.getElementById("groundingTitle");

const groundingDescription =
    document.getElementById("groundingDescription");

const groundingProgressBar =
    document.getElementById("groundingProgressBar");

const groundingProgressText =
    document.getElementById("groundingProgressText");

const previousGroundingBtn =
    document.getElementById("previousGroundingBtn");

const nextGroundingBtn =
    document.getElementById("nextGroundingBtn");


// ==========================================================
// QUICK RESET
// ==========================================================

const randomResetText =
    document.getElementById("randomResetText");

const randomResetBtn =
    document.getElementById("randomResetBtn");


// ==========================================================
// FIREBASE AUTHENTICATION
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


        const displayName =
            user.displayName ||
            "MindBridge User";


        if (userName) {

            userName.textContent =
                displayName;
        }


        if (userEmail) {

            userEmail.textContent =
                user.email || "";
        }


        if (userAvatar) {

            userAvatar.textContent =
                displayName
                    .charAt(0)
                    .toUpperCase();
        }


        if (authLoading) {

            authLoading.style.display =
                "none";
        }


        if (helpApp) {

            helpApp.classList.remove(
                "hidden"
            );
        }

    }

);


// ==========================================================
// TOOL NAVIGATION
// ==========================================================

toolCards.forEach(

    (card) => {

        card.addEventListener(

            "click",

            () => {

                const selectedTool =
                    card.dataset.tool;


                // Remove active class

                toolCards.forEach(

                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }

                );


                // Activate selected card

                card.classList.add(
                    "active"
                );


                // Hide all sections

                breathingSection.classList.add(
                    "hidden"
                );

                groundingSection.classList.add(
                    "hidden"
                );

                resetSection.classList.add(
                    "hidden"
                );


                // Show selected section

                if (
                    selectedTool ===
                    "breathing"
                ) {

                    breathingSection
                        .classList
                        .remove(
                            "hidden"
                        );

                }


                if (
                    selectedTool ===
                    "grounding"
                ) {

                    groundingSection
                        .classList
                        .remove(
                            "hidden"
                        );

                }


                if (
                    selectedTool ===
                    "reset"
                ) {

                    resetSection
                        .classList
                        .remove(
                            "hidden"
                        );

                }

            }

        );

    }

);


// ==========================================================
// BREATHING EXERCISE
// ==========================================================
//
// Cycle:
//
// Inhale: 4 seconds
// Hold:   4 seconds
// Exhale: 6 seconds
//
// This is a general guided wellness exercise.
// The user can stop at any time.
//
// ==========================================================

let breathingRunning =
    false;

let breathingTimeout =
    null;

let completedCycles =
    0;


// ==========================================================
// START BREATHING
// ==========================================================

if (startBreathingBtn) {

    startBreathingBtn.addEventListener(

        "click",

        () => {

            if (breathingRunning) {

                return;
            }


            breathingRunning =
                true;


            completedCycles =
                0;


            startBreathingBtn.disabled =
                true;


            stopBreathingBtn.disabled =
                false;


            cycleStatus.textContent =
                "Follow the breathing circle at a comfortable pace.";


            runBreathingCycle();

        }

    );

}


// ==========================================================
// RUN BREATHING CYCLE
// ==========================================================

function runBreathingCycle() {

    if (!breathingRunning) {

        return;
    }


    // ======================================================
    // INHALE
    // ======================================================

    setBreathingPhase(
        "inhale",
        "Inhale",
        "Breathe in gently",
        4
    );


    breathingTimeout =
        setTimeout(

            () => {

                if (!breathingRunning) {

                    return;
                }


                // ==========================================
                // HOLD
                // ==========================================

                setBreathingPhase(
                    "hold",
                    "Hold",
                    "Pause comfortably",
                    4
                );


                breathingTimeout =
                    setTimeout(

                        () => {

                            if (!breathingRunning) {

                                return;
                            }


                            // ==============================
                            // EXHALE
                            // ==============================

                            setBreathingPhase(
                                "exhale",
                                "Exhale",
                                "Breathe out slowly",
                                6
                            );


                            breathingTimeout =
                                setTimeout(

                                    () => {

                                        if (!breathingRunning) {

                                            return;
                                        }


                                        completedCycles++;


                                        cycleStatus.textContent =
                                            `Completed breathing cycles: ${completedCycles}`;


                                        runBreathingCycle();

                                    },

                                    6000

                                );

                        },

                        4000

                    );

            },

            4000

        );

}


// ==========================================================
// SET BREATHING PHASE
// ==========================================================

function setBreathingPhase(
    className,
    title,
    description,
    seconds
) {

    breathingCircle.classList.remove(
        "inhale",
        "hold",
        "exhale"
    );


    breathingCircle.classList.add(
        className
    );


    breathingText.textContent =
        title;


    breathingTimer.textContent =
        `${description} • ${seconds} seconds`;

}


// ==========================================================
// STOP BREATHING
// ==========================================================

if (stopBreathingBtn) {

    stopBreathingBtn.addEventListener(

        "click",

        stopBreathing

    );

}


function stopBreathing() {

    breathingRunning =
        false;


    if (breathingTimeout) {

        clearTimeout(
            breathingTimeout
        );

    }


    breathingCircle.classList.remove(
        "inhale",
        "hold",
        "exhale"
    );


    breathingText.textContent =
        "Ready";


    breathingTimer.textContent =
        "Start again whenever you're comfortable";


    cycleStatus.textContent =

        completedCycles > 0

            ? `You completed ${completedCycles} breathing cycle${completedCycles === 1 ? "" : "s"}.`

            : "Breathing exercise stopped.";


    startBreathingBtn.disabled =
        false;


    stopBreathingBtn.disabled =
        true;

}


// ==========================================================
// GROUNDING EXERCISE DATA
// ==========================================================

const groundingSteps = [

    {

        number:
            "5",

        sense:
            "SEE",

        title:
            "Notice 5 things you can see.",

        description:
            "Slowly look around you. Notice colors, shapes, objects, light, or movement."

    },


    {

        number:
            "4",

        sense:
            "TOUCH",

        title:
            "Notice 4 things you can feel.",

        description:
            "Notice physical sensations such as your feet on the floor, your clothing, the chair beneath you, or an object you can touch."

    },


    {

        number:
            "3",

        sense:
            "HEAR",

        title:
            "Notice 3 things you can hear.",

        description:
            "Listen carefully. Notice nearby sounds and quieter sounds in the background."

    },


    {

        number:
            "2",

        sense:
            "SMELL",

        title:
            "Notice 2 things you can smell.",

        description:
            "Notice any scents around you. If you cannot smell anything clearly, think of two familiar scents you enjoy."

    },


    {

        number:
            "1",

        sense:
            "TASTE",

        title:
            "Notice 1 thing you can taste.",

        description:
            "Notice any taste currently in your mouth, take a sip of water, or simply focus on this final moment of awareness."

    }

];


let currentGroundingStep =
    0;


// ==========================================================
// UPDATE GROUNDING
// ==========================================================

function updateGroundingStep() {

    const step =
        groundingSteps[
            currentGroundingStep
        ];


    groundingNumber.textContent =
        step.number;


    groundingSense.textContent =
        step.sense;


    groundingTitle.textContent =
        step.title;


    groundingDescription.textContent =
        step.description;


    const progress =
        (
            (
                currentGroundingStep +
                1
            )

            /

            groundingSteps.length

        )

        *

        100;


    groundingProgressBar.style.width =
        `${progress}%`;


    groundingProgressText.textContent =
        `Step ${currentGroundingStep + 1} of ${groundingSteps.length}`;


    previousGroundingBtn.disabled =
        currentGroundingStep === 0;


    if (
        currentGroundingStep ===
        groundingSteps.length - 1
    ) {

        nextGroundingBtn.textContent =
            "Finish";

    }

    else {

        nextGroundingBtn.textContent =
            "Next Step";

    }

}


// ==========================================================
// NEXT GROUNDING STEP
// ==========================================================

if (nextGroundingBtn) {

    nextGroundingBtn.addEventListener(

        "click",

        () => {

            if (
                currentGroundingStep <
                groundingSteps.length - 1
            ) {

                currentGroundingStep++;


                updateGroundingStep();

            }

            else {

                groundingNumber.textContent =
                    "✓";


                groundingSense.textContent =
                    "COMPLETE";


                groundingTitle.textContent =
                    "Grounding exercise complete.";


                groundingDescription.textContent =
                    "Take a moment to notice how you feel now. You can repeat the exercise whenever you find it helpful.";


                groundingProgressBar.style.width =
                    "100%";


                groundingProgressText.textContent =
                    "Exercise complete";


                nextGroundingBtn.textContent =
                    "Start Again";


                currentGroundingStep =
                    -1;

            }

        }

    );

}


// ==========================================================
// PREVIOUS GROUNDING STEP
// ==========================================================

if (previousGroundingBtn) {

    previousGroundingBtn.addEventListener(

        "click",

        () => {

            if (
                currentGroundingStep >
                0
            ) {

                currentGroundingStep--;


                updateGroundingStep();

            }

        }

    );

}


// Initialize grounding

updateGroundingStep();


// ==========================================================
// QUICK RESET ACTIVITIES
// ==========================================================

const resetActivities = [

    "Take three slow, comfortable breaths and relax your shoulders.",

    "Take a few slow sips of water.",

    "Stand up and gently stretch for one minute.",

    "Look away from your screen and notice three objects around you.",

    "Unclench your jaw and let your shoulders drop.",

    "If possible, step outside or near a window for a few minutes.",

    "Choose one small task you can complete in the next five minutes.",

    "Send a simple message to someone you trust.",

    "Put your phone down for two minutes and notice your surroundings.",

    "Listen to one song that helps you feel calm or grounded."

];


if (randomResetBtn) {

    randomResetBtn.addEventListener(

        "click",

        () => {

            const randomIndex =
                Math.floor(

                    Math.random() *

                    resetActivities.length

                );


            randomResetText.textContent =
                resetActivities[
                    randomIndex
                ];

        }

    );

}


// ==========================================================
// LOGOUT
// ==========================================================

if (logoutBtn) {

    logoutBtn.addEventListener(

        "click",

        async () => {

            try {

                stopBreathing();


                await signOut(
                    auth
                );


                window.location.replace(
                    "./login.html"
                );

            }

            catch (error) {

                console.error(
                    "MindBridge Logout Error:",
                    error
                );

            }

        }

    );

}


// ==========================================================
// MOBILE SIDEBAR
// ==========================================================

if (
    sidebarToggle &&
    sidebar
) {

    sidebarToggle.addEventListener(

        "click",

        () => {

            sidebar.classList.toggle(
                "mobile-open"
            );

        }

    );

}


// ==========================================================
// INITIALIZATION
// ==========================================================

console.log(
    "MindBridge Immediate Help loaded."
);