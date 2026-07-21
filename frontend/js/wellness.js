// ==========================================================
// MINDBRIDGE - WELLNESS ACTIVITIES
// ==========================================================


// ==========================================================
// FIREBASE CONFIG
// ==========================================================

import {
    auth,
    db
} from "../../firebase/firebase-config.js";


// ==========================================================
// FIREBASE AUTH
// ==========================================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================================
// FIRESTORE
// ==========================================================

import {
    doc,
    getDoc,
    setDoc,
    increment,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================================
// CURRENT USER
// ==========================================================

let currentUser = null;


// ==========================================================
// MAIN ELEMENTS
// ==========================================================

const authLoading =
    document.getElementById("authLoading");

const wellnessApp =
    document.getElementById("wellnessApp");

const userName =
    document.getElementById("userName");

const userEmail =
    document.getElementById("userEmail");

const userAvatar =
    document.getElementById("userAvatar");

const logoutBtn =
    document.getElementById("logoutBtn");


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
// STATISTICS ELEMENTS
// ==========================================================

const activitiesCompletedElement =
    document.getElementById(
        "activitiesCompleted"
    );

const wellnessMinutesElement =
    document.getElementById(
        "wellnessMinutes"
    );

const recentActivityElement =
    document.getElementById(
        "recentActivity"
    );


// ==========================================================
// COMPLETION TOAST
// ==========================================================

const completionToast =
    document.getElementById(
        "completionToast"
    );

const completionText =
    document.getElementById(
        "completionText"
    );


// ==========================================================
// LOCAL STATISTICS
// ==========================================================

let completedActivities = 0;

let totalWellnessMinutes = 0;


// ==========================================================
// GET USER DISPLAY NAME
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

    async (user) => {

        // User not logged in

        if (!user) {

            window.location.replace(
                "./login.html"
            );

            return;

        }


        // Save current user

        currentUser = user;


        // Get display information

        const name =
            getDisplayName(user);

        const email =
            user.email || "";

        const initial =
            name
                .charAt(0)
                .toUpperCase();


        // Update sidebar user information

        if (userName) {

            userName.textContent =
                name;

        }


        if (userEmail) {

            userEmail.textContent =
                email;

        }


        if (userAvatar) {

            userAvatar.textContent =
                initial;

        }


        // IMPORTANT:
        // Show Wellness page BEFORE Firestore loading.
        // This prevents Firestore errors from blocking the page.

        if (authLoading) {

            authLoading.style.display =
                "none";

        }


        if (wellnessApp) {

            wellnessApp.classList.remove(
                "hidden"
            );

        }


        console.log(
            "Wellness page loaded for:",
            user.uid
        );


        // Load saved statistics

        await loadWellnessStats();

    }

);


// ==========================================================
// LOGOUT
// ==========================================================

logoutBtn?.addEventListener(

    "click",

    async () => {

        try {

            await signOut(auth);

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

    sidebar?.classList.add(
        "mobile-open"
    );

    sidebarOverlay?.classList.add(
        "active"
    );

}


function closeSidebar() {

    sidebar?.classList.remove(
        "mobile-open"
    );

    sidebarOverlay?.classList.remove(
        "active"
    );

}


sidebarToggle?.addEventListener(

    "click",

    () => {

        if (
            sidebar?.classList.contains(
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


sidebarOverlay?.addEventListener(

    "click",

    closeSidebar

);


// Close sidebar after clicking a link on mobile

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
// FIRESTORE
//
// Database structure:
//
// users
//   └── USER_UID
//        └── wellness
//             └── stats
//                  ├── activitiesCompleted
//                  ├── wellnessMinutes
//                  ├── recentActivity
//                  └── updatedAt
// ==========================================================


// ==========================================================
// LOAD WELLNESS STATISTICS
// ==========================================================

async function loadWellnessStats() {

    if (!currentUser) {

        console.log(
            "No authenticated user."
        );

        return;

    }


    try {

        const statsRef =
            doc(
                db,
                "users",
                currentUser.uid,
                "wellness",
                "stats"
            );


        const snapshot =
            await getDoc(
                statsRef
            );


        // ------------------------------------------
        // EXISTING DATA
        // ------------------------------------------

        if (snapshot.exists()) {

            const data =
                snapshot.data();


            completedActivities =
                Number(
                    data.activitiesCompleted
                ) || 0;


            totalWellnessMinutes =
                Number(
                    data.wellnessMinutes
                ) || 0;


            if (
                activitiesCompletedElement
            ) {

                activitiesCompletedElement.textContent =
                    completedActivities;

            }


            if (
                wellnessMinutesElement
            ) {

                wellnessMinutesElement.textContent =
                    totalWellnessMinutes;

            }


            if (
                recentActivityElement
            ) {

                recentActivityElement.textContent =
                    data.recentActivity ||
                    "None yet";

            }


            console.log(
                "Wellness statistics loaded:",
                data
            );

        }


        // ------------------------------------------
        // FIRST-TIME USER
        // ------------------------------------------

        else {

            console.log(
                "Creating wellness statistics document."
            );


            await setDoc(

                statsRef,

                {

                    activitiesCompleted:
                        0,

                    wellnessMinutes:
                        0,

                    recentActivity:
                        "None yet",

                    updatedAt:
                        serverTimestamp()

                }

            );


            completedActivities =
                0;


            totalWellnessMinutes =
                0;


            if (
                activitiesCompletedElement
            ) {

                activitiesCompletedElement.textContent =
                    "0";

            }


            if (
                wellnessMinutesElement
            ) {

                wellnessMinutesElement.textContent =
                    "0";

            }


            if (
                recentActivityElement
            ) {

                recentActivityElement.textContent =
                    "None yet";

            }

        }

    }

    catch (error) {

        console.error(
            "FIRESTORE LOAD ERROR:",
            error
        );

        // Do not hide the Wellness page.
        // The activities can still be used.

    }

}


// ==========================================================
// COMPLETE AND SAVE ACTIVITY
// ==========================================================

async function completeActivity(
    activityName,
    minutes
) {

    if (!currentUser) {

        console.error(
            "Cannot save activity: no authenticated user."
        );

        showCompletionToast(
            "Please log in before saving an activity."
        );

        return;

    }


    const safeMinutes =
        Math.max(
            1,
            Math.round(
                Number(minutes) || 1
            )
        );


    try {

        console.log(
            "Saving wellness activity:",
            activityName,
            safeMinutes
        );


        const statsRef =
            doc(
                db,
                "users",
                currentUser.uid,
                "wellness",
                "stats"
            );


        // setDoc with merge:true means:
        //
        // - create document if missing
        // - update document if it exists
        //
        // increment() safely increases values.

        await setDoc(

            statsRef,

            {

                activitiesCompleted:
                    increment(1),

                wellnessMinutes:
                    increment(
                        safeMinutes
                    ),

                recentActivity:
                    activityName,

                updatedAt:
                    serverTimestamp()

            },

            {

                merge: true

            }

        );


        // ==================================================
        // READ UPDATED VALUES BACK FROM FIRESTORE
        // ==================================================

        const updatedSnapshot =
            await getDoc(
                statsRef
            );


        if (
            updatedSnapshot.exists()
        ) {

            const updatedData =
                updatedSnapshot.data();


            completedActivities =
                Number(
                    updatedData
                        .activitiesCompleted
                ) || 0;


            totalWellnessMinutes =
                Number(
                    updatedData
                        .wellnessMinutes
                ) || 0;


            // Update Wellness page

            if (
                activitiesCompletedElement
            ) {

                activitiesCompletedElement.textContent =
                    completedActivities;

            }


            if (
                wellnessMinutesElement
            ) {

                wellnessMinutesElement.textContent =
                    totalWellnessMinutes;

            }


            if (
                recentActivityElement
            ) {

                recentActivityElement.textContent =
                    updatedData
                        .recentActivity ||
                    activityName;

            }

        }


        showCompletionToast(

            `${activityName} completed. ${safeMinutes} wellness minute(s) added.`

        );


        console.log(

            "Activity successfully saved.",

            {
                activitiesCompleted:
                    completedActivities,

                wellnessMinutes:
                    totalWellnessMinutes
            }

        );

    }

    catch (error) {

        console.error(
            "FIRESTORE SAVE ERROR:",
            error
        );


        showCompletionToast(
            "Activity completed, but it could not be saved."
        );

    }

}


// ==========================================================
// COMPLETION TOAST
// ==========================================================

function showCompletionToast(
    message
) {

    if (
        !completionToast ||
        !completionText
    ) {

        return;

    }


    completionText.textContent =
        message;


    completionToast.classList.remove(
        "hidden"
    );


    setTimeout(

        () => {

            completionToast.classList.add(
                "hidden"
            );

        },

        4000

    );

}


// ==========================================================
// ACTIVITY TABS
// ==========================================================

const activityTabs =
    document.querySelectorAll(
        ".activity-tab"
    );


const activityPanels = {

    breathing:
        document.getElementById(
            "breathingActivity"
        ),

    walking:
        document.getElementById(
            "walkingActivity"
        ),

    stretch:
        document.getElementById(
            "stretchActivity"
        ),

    focus:
        document.getElementById(
            "focusActivity"
        ),

    sounds:
        document.getElementById(
            "soundsActivity"
        )

};


activityTabs.forEach(

    (tab) => {

        tab.addEventListener(

            "click",

            () => {

                const selected =
                    tab.dataset.activity;


                // Remove active tab

                activityTabs.forEach(

                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }

                );


                // Activate clicked tab

                tab.classList.add(
                    "active"
                );


                // Hide all activity panels

                Object.values(
                    activityPanels
                ).forEach(

                    (panel) => {

                        panel?.classList.add(
                            "hidden"
                        );

                    }

                );


                // Show selected activity

                activityPanels[
                    selected
                ]?.classList.remove(
                    "hidden"
                );

            }

        );

    }

);


// ==========================================================
// FORMAT TIME
// ==========================================================

function formatTime(
    seconds
) {

    const safeSeconds =
        Math.max(
            0,
            seconds
        );


    const minutes =
        Math.floor(
            safeSeconds / 60
        );


    const remainingSeconds =
        safeSeconds % 60;


    return (

        String(
            minutes
        ).padStart(
            2,
            "0"
        )

        +

        ":"

        +

        String(
            remainingSeconds
        ).padStart(
            2,
            "0"
        )

    );

}


// ==========================================================
// GUIDED BREATHING
// ==========================================================

const breathingCircle =
    document.getElementById(
        "breathingCircle"
    );


const breathingPhase =
    document.getElementById(
        "breathingPhase"
    );


const breathingCountdown =
    document.getElementById(
        "breathingCountdown"
    );


const breathingSessionTimer =
    document.getElementById(
        "breathingSessionTimer"
    );


const startBreathing =
    document.getElementById(
        "startBreathing"
    );


const stopBreathing =
    document.getElementById(
        "stopBreathing"
    );


const completeBreathing =
    document.getElementById(
        "completeBreathing"
    );


let breathingRunning =
    false;


let breathingSeconds =
    0;


let breathingTimeout =
    null;


let breathingTimerInterval =
    null;


// ==========================================================
// RUN BREATHING CYCLE
// ==========================================================

function runBreathingCycle() {

    if (
        !breathingRunning
    ) {

        return;

    }


    // INHALE

    breathingCircle.className =
        "breathing-circle inhale";


    breathingPhase.textContent =
        "Inhale";


    breathingCountdown.textContent =
        "Breathe in gently";


    breathingTimeout =
        setTimeout(

            () => {

                if (
                    !breathingRunning
                ) {

                    return;

                }


                // HOLD

                breathingCircle.className =
                    "breathing-circle hold";


                breathingPhase.textContent =
                    "Hold";


                breathingCountdown.textContent =
                    "Pause comfortably";


                breathingTimeout =
                    setTimeout(

                        () => {

                            if (
                                !breathingRunning
                            ) {

                                return;

                            }


                            // EXHALE

                            breathingCircle.className =
                                "breathing-circle exhale";


                            breathingPhase.textContent =
                                "Exhale";


                            breathingCountdown.textContent =
                                "Breathe out slowly";


                            breathingTimeout =
                                setTimeout(

                                    () => {

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
// START BREATHING
// ==========================================================

startBreathing?.addEventListener(

    "click",

    () => {

        if (
            breathingRunning
        ) {

            return;

        }


        breathingRunning =
            true;


        startBreathing.disabled =
            true;


        stopBreathing.disabled =
            false;


        completeBreathing.disabled =
            true;


        breathingTimerInterval =
            setInterval(

                () => {

                    breathingSeconds++;


                    breathingSessionTimer.textContent =
                        formatTime(
                            breathingSeconds
                        );

                },

                1000

            );


        runBreathingCycle();

    }

);


// ==========================================================
// STOP BREATHING
// ==========================================================

stopBreathing?.addEventListener(

    "click",

    () => {

        breathingRunning =
            false;


        clearTimeout(
            breathingTimeout
        );


        clearInterval(
            breathingTimerInterval
        );


        breathingTimeout =
            null;


        breathingTimerInterval =
            null;


        breathingCircle.className =
            "breathing-circle";


        breathingPhase.textContent =
            "Paused";


        breathingCountdown.textContent =
            "Complete when ready";


        startBreathing.disabled =
            false;


        stopBreathing.disabled =
            true;


        // Allow completion after 5 seconds for testing.

        if (
            breathingSeconds >= 5
        ) {

            completeBreathing.disabled =
                false;

        }

    }

);


// ==========================================================
// COMPLETE BREATHING
// ==========================================================

completeBreathing?.addEventListener(

    "click",

    async () => {

        if (
            breathingSeconds < 5
        ) {

            showCompletionToast(
                "Try breathing for a few seconds before completing."
            );

            return;

        }


        const minutes =
            Math.max(
                1,
                Math.ceil(
                    breathingSeconds /
                    60
                )
            );


        await completeActivity(

            "Guided Breathing",

            minutes

        );


        // Reset breathing session

        breathingSeconds =
            0;


        breathingSessionTimer.textContent =
            "00:00";


        breathingPhase.textContent =
            "Ready";


        breathingCountdown.textContent =
            "Start when comfortable";


        breathingCircle.className =
            "breathing-circle";


        completeBreathing.disabled =
            true;

    }

);


// ==========================================================
// MINDFUL WALK
// ==========================================================

const walker =
    document.getElementById(
        "walker"
    );


const walkingTimer =
    document.getElementById(
        "walkingTimer"
    );


const walkingProgress =
    document.getElementById(
        "walkingProgress"
    );


const walkPrompt =
    document.getElementById(
        "walkPrompt"
    );


const startWalking =
    document.getElementById(
        "startWalking"
    );


const stopWalking =
    document.getElementById(
        "stopWalking"
    );


const completeWalking =
    document.getElementById(
        "completeWalking"
    );


const WALK_DURATION =
    300;


let walkingRemaining =
    WALK_DURATION;


let walkingInterval =
    null;


const walkingPrompts = [

    "Notice your feet touching the ground.",

    "Notice the sounds around you.",

    "Relax your shoulders as you walk.",

    "Notice something in your surroundings.",

    "Walk at a comfortable pace."

];


// ==========================================================
// STOP WALK SESSION
// ==========================================================

function stopWalkingSession() {

    clearInterval(
        walkingInterval
    );


    walkingInterval =
        null;


    walker?.classList.remove(
        "walking"
    );


    if (
        startWalking
    ) {

        startWalking.disabled =
            false;

    }


    if (
        stopWalking
    ) {

        stopWalking.disabled =
            true;

    }

}


// ==========================================================
// START WALK
// ==========================================================

startWalking?.addEventListener(

    "click",

    () => {

        if (
            walkingInterval
        ) {

            return;

        }


        walker?.classList.add(
            "walking"
        );


        startWalking.disabled =
            true;


        stopWalking.disabled =
            false;


        completeWalking.disabled =
            true;


        walkingInterval =
            setInterval(

                () => {

                    walkingRemaining--;


                    walkingTimer.textContent =
                        formatTime(
                            walkingRemaining
                        );


                    const completed =
                        WALK_DURATION -
                        walkingRemaining;


                    const progress =
                        (
                            completed /
                            WALK_DURATION
                        ) * 100;


                    walkingProgress.style.width =
                        `${progress}%`;


                    if (

                        completed > 0 &&

                        completed % 30 === 0

                    ) {

                        const randomIndex =
                            Math.floor(

                                Math.random() *

                                walkingPrompts.length

                            );


                        walkPrompt.textContent =
                            walkingPrompts[
                                randomIndex
                            ];

                    }


                    if (
                        walkingRemaining <= 0
                    ) {

                        stopWalkingSession();


                        walkingTimer.textContent =
                            "00:00";


                        walkingProgress.style.width =
                            "100%";


                        walkPrompt.textContent =
                            "Walk complete.";


                        completeWalking.disabled =
                            false;

                    }

                },

                1000

            );

    }

);


// ==========================================================
// STOP WALK
// ==========================================================

stopWalking?.addEventListener(

    "click",

    () => {

        stopWalkingSession();


        const completedSeconds =
            WALK_DURATION -
            walkingRemaining;


        if (
            completedSeconds >= 5
        ) {

            completeWalking.disabled =
                false;

        }

    }

);


// ==========================================================
// COMPLETE WALK
// ==========================================================

completeWalking?.addEventListener(

    "click",

    async () => {

        const completedSeconds =
            WALK_DURATION -
            walkingRemaining;


        if (
            completedSeconds < 5
        ) {

            showCompletionToast(
                "Try walking for a few seconds before completing."
            );

            return;

        }


        const minutes =
            Math.max(
                1,
                Math.ceil(
                    completedSeconds /
                    60
                )
            );


        await completeActivity(

            "Mindful Walk",

            minutes

        );


        // Reset walk

        walkingRemaining =
            WALK_DURATION;


        walkingTimer.textContent =
            "05:00";


        walkingProgress.style.width =
            "0%";


        walkPrompt.textContent =
            "Ready for a short mindful walk?";


        completeWalking.disabled =
            true;

    }

);


// ==========================================================
// STRETCH & RELAX
// ==========================================================

const stretchSteps = [

    {

        title:
            "Shoulder Roll",

        description:
            "Gently roll your shoulders backward.",

        icon:
            "🙆"

    },

    {

        title:
            "Reach Up",

        description:
            "Raise your arms comfortably and reach upward.",

        icon:
            "🙌"

    },

    {

        title:
            "Gentle Side Stretch",

        description:
            "Lean slightly to one side, then the other.",

        icon:
            "🧘"

    },

    {

        title:
            "Relax",

        description:
            "Lower your arms and relax your shoulders.",

        icon:
            "🧘"

    }

];


const stretchFigure =
    document.getElementById(
        "stretchFigure"
    );


const stretchStepLabel =
    document.getElementById(
        "stretchStepLabel"
    );


const stretchTitle =
    document.getElementById(
        "stretchTitle"
    );


const stretchDescription =
    document.getElementById(
        "stretchDescription"
    );


const stretchTimer =
    document.getElementById(
        "stretchTimer"
    );


const stretchProgress =
    document.getElementById(
        "stretchProgress"
    );


const startStretch =
    document.getElementById(
        "startStretch"
    );


const nextStretch =
    document.getElementById(
        "nextStretch"
    );


const completeStretch =
    document.getElementById(
        "completeStretch"
    );


let currentStretchStep =
    0;


let stretchRemaining =
    20;


let stretchInterval =
    null;


// ==========================================================
// DISPLAY STRETCH STEP
// ==========================================================

function displayStretchStep() {

    const step =
        stretchSteps[
            currentStretchStep
        ];


    stretchFigure.textContent =
        step.icon;


    stretchStepLabel.textContent =
        `STEP ${currentStretchStep + 1} OF ${stretchSteps.length}`;


    stretchTitle.textContent =
        step.title;


    stretchDescription.textContent =
        step.description;


    stretchRemaining =
        20;


    stretchTimer.textContent =
        stretchRemaining;


    stretchProgress.style.width =
        `${
            (
                currentStretchStep /
                stretchSteps.length
            ) * 100
        }%`;

}


// ==========================================================
// RUN STRETCH TIMER
// ==========================================================

function runStretchTimer() {

    clearInterval(
        stretchInterval
    );


    stretchInterval =
        setInterval(

            () => {

                stretchRemaining--;


                stretchTimer.textContent =
                    stretchRemaining;


                if (
                    stretchRemaining <= 0
                ) {

                    clearInterval(
                        stretchInterval
                    );


                    stretchInterval =
                        null;


                    if (

                        currentStretchStep ===

                        stretchSteps.length - 1

                    ) {

                        completeStretch.disabled =
                            false;


                        nextStretch.disabled =
                            true;


                        stretchProgress.style.width =
                            "100%";

                    }

                    else {

                        nextStretch.disabled =
                            false;

                    }

                }

            },

            1000

        );

}


// ==========================================================
// START STRETCH
// ==========================================================

startStretch?.addEventListener(

    "click",

    () => {

        currentStretchStep =
            0;


        startStretch.disabled =
            true;


        nextStretch.disabled =
            true;


        completeStretch.disabled =
            true;


        displayStretchStep();


        runStretchTimer();

    }

);


// ==========================================================
// NEXT STRETCH
// ==========================================================

nextStretch?.addEventListener(

    "click",

    () => {

        if (

            currentStretchStep <

            stretchSteps.length - 1

        ) {

            currentStretchStep++;


            nextStretch.disabled =
                true;


            displayStretchStep();


            runStretchTimer();

        }

    }

);


// ==========================================================
// COMPLETE STRETCH
// ==========================================================

completeStretch?.addEventListener(

    "click",

    async () => {

        await completeActivity(

            "Stretch & Relax",

            2

        );


        completeStretch.disabled =
            true;


        startStretch.disabled =
            false;


        currentStretchStep =
            0;


        displayStretchStep();

    }

);


// ==========================================================
// FOCUS SESSION
// ==========================================================

const FOCUS_DURATION =
    300;


let focusRemaining =
    FOCUS_DURATION;


let focusInterval =
    null;


const focusTimer =
    document.getElementById(
        "focusTimer"
    );


const focusProgress =
    document.getElementById(
        "focusProgress"
    );


const focusMessage =
    document.getElementById(
        "focusMessage"
    );


const startFocus =
    document.getElementById(
        "startFocus"
    );


const stopFocus =
    document.getElementById(
        "stopFocus"
    );


const completeFocus =
    document.getElementById(
        "completeFocus"
    );


// ==========================================================
// STOP FOCUS SESSION
// ==========================================================

function stopFocusSession() {

    clearInterval(
        focusInterval
    );


    focusInterval =
        null;


    startFocus.disabled =
        false;


    stopFocus.disabled =
        true;

}


// ==========================================================
// START FOCUS
// ==========================================================

startFocus?.addEventListener(

    "click",

    () => {

        if (
            focusInterval
        ) {

            return;

        }


        startFocus.disabled =
            true;


        stopFocus.disabled =
            false;


        completeFocus.disabled =
            true;


        focusMessage.textContent =
            "Stay with one task. You can stop whenever needed.";


        focusInterval =
            setInterval(

                () => {

                    focusRemaining--;


                    focusTimer.textContent =
                        formatTime(
                            focusRemaining
                        );


                    const completed =
                        FOCUS_DURATION -
                        focusRemaining;


                    const progress =
                        (
                            completed /
                            FOCUS_DURATION
                        ) * 100;


                    focusProgress.style.width =
                        `${progress}%`;


                    if (
                        focusRemaining <= 0
                    ) {

                        stopFocusSession();


                        focusTimer.textContent =
                            "00:00";


                        focusProgress.style.width =
                            "100%";


                        focusMessage.textContent =
                            "Focus session complete.";


                        completeFocus.disabled =
                            false;

                    }

                },

                1000

            );

    }

);


// ==========================================================
// STOP FOCUS
// ==========================================================

stopFocus?.addEventListener(

    "click",

    () => {

        stopFocusSession();


        const completedSeconds =
            FOCUS_DURATION -
            focusRemaining;


        if (
            completedSeconds >= 5
        ) {

            completeFocus.disabled =
                false;

        }

    }

);


// ==========================================================
// COMPLETE FOCUS
// ==========================================================

completeFocus?.addEventListener(

    "click",

    async () => {

        const completedSeconds =
            FOCUS_DURATION -
            focusRemaining;


        if (
            completedSeconds < 5
        ) {

            showCompletionToast(
                "Try focusing for a few seconds before completing."
            );

            return;

        }


        const minutes =
            Math.max(
                1,
                Math.ceil(
                    completedSeconds /
                    60
                )
            );


        await completeActivity(

            "Focus Session",

            minutes

        );


        // Reset focus

        focusRemaining =
            FOCUS_DURATION;


        focusTimer.textContent =
            "05:00";


        focusProgress.style.width =
            "0%";


        focusMessage.textContent =
            "Remove distractions and start when ready.";


        completeFocus.disabled =
            true;

    }

);


// ==========================================================
// RELAXING SOUNDS
// ==========================================================

const relaxAudio =
    document.getElementById(
        "relaxAudio"
    );


const soundCards =
    document.querySelectorAll(
        ".sound-card"
    );


const currentSound =
    document.getElementById(
        "currentSound"
    );


const pauseSound =
    document.getElementById(
        "pauseSound"
    );


const stopSound =
    document.getElementById(
        "stopSound"
    );


const volumeSlider =
    document.getElementById(
        "volumeSlider"
    );


// ==========================================================
// AUDIO FILE PATHS
//
// Make sure these files exist:
//
// frontend/assets/audio/rain.mp3
// frontend/assets/audio/ocean.mp3
// frontend/assets/audio/forest.mp3
// frontend/assets/audio/calm-ambient.mp3
// ==========================================================

const soundFiles = {

    rain:
        "../assets/audio/rain.mp3",

    ocean:
        "../assets/audio/ocean.mp3",

    forest:
        "../assets/audio/forest.mp3",

    ambient:
        "../assets/audio/calm-ambient.mp3"

};


// ==========================================================
// SELECT SOUND
// ==========================================================

soundCards.forEach(

    (card) => {

        card.addEventListener(

            "click",

            async () => {

                const sound =
                    card.dataset.sound;


                const soundPath =
                    soundFiles[
                        sound
                    ];


                if (
                    !soundPath
                ) {

                    console.error(
                        "Unknown sound:",
                        sound
                    );

                    return;

                }


                soundCards.forEach(

                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }

                );


                card.classList.add(
                    "active"
                );


                relaxAudio.src =
                    soundPath;


                relaxAudio.volume =
                    Number(
                        volumeSlider.value
                    );


                const soundName =
                    card.querySelector(
                        "strong"
                    )?.textContent ||
                    sound;


                currentSound.textContent =
                    soundName;


                try {

                    await relaxAudio.play();


                    pauseSound.disabled =
                        false;


                    stopSound.disabled =
                        false;


                    pauseSound.textContent =
                        "Pause";

                }

                catch (error) {

                    console.error(
                        "Audio playback error:",
                        error
                    );


                    currentSound.textContent =
                        "Unable to play this sound";

                }

            }

        );

    }

);


// ==========================================================
// PAUSE / RESUME SOUND
// ==========================================================

pauseSound?.addEventListener(

    "click",

    async () => {

        if (
            !relaxAudio.src
        ) {

            return;

        }


        if (
            relaxAudio.paused
        ) {

            try {

                await relaxAudio.play();


                pauseSound.textContent =
                    "Pause";

            }

            catch (error) {

                console.error(
                    "Audio resume error:",
                    error
                );

            }

        }

        else {

            relaxAudio.pause();


            pauseSound.textContent =
                "Resume";

        }

    }

);


// ==========================================================
// STOP SOUND
// ==========================================================

stopSound?.addEventListener(

    "click",

    () => {

        relaxAudio.pause();


        relaxAudio.currentTime =
            0;


        pauseSound.disabled =
            true;


        stopSound.disabled =
            true;


        pauseSound.textContent =
            "Pause";


        currentSound.textContent =
            "No sound selected";


        soundCards.forEach(

            (card) => {

                card.classList.remove(
                    "active"
                );

            }

        );

    }

);


// ==========================================================
// SOUND VOLUME
// ==========================================================

volumeSlider?.addEventListener(

    "input",

    () => {

        relaxAudio.volume =
            Number(
                volumeSlider.value
            );

    }

);


// ==========================================================
// PAGE READY
// ==========================================================

console.log(
    "MindBridge Wellness JS loaded successfully."
);