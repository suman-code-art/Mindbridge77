// ==========================================================
// MINDBRIDGE EMOTIONAL CHECK-IN
// File: frontend/js/checkin.js
// ==========================================================


// FIREBASE

import {
    auth
} from "../../firebase/firebase-config.js";


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ELEMENTS

const authLoading =
    document.getElementById("authLoading");

const checkinApp =
    document.getElementById("checkinApp");

const checkinForm =
    document.getElementById("checkinForm");

const moodOptions =
    document.querySelectorAll(".mood-option");

const moodNote =
    document.getElementById("moodNote");

const characterCount =
    document.getElementById("characterCount");

const formError =
    document.getElementById("formError");

const resultCard =
    document.getElementById("resultCard");

const resultIcon =
    document.getElementById("resultIcon");

const resultTitle =
    document.getElementById("resultTitle");

const resultMessage =
    document.getElementById("resultMessage");

const recommendationText =
    document.getElementById("recommendationText");

const primaryAction =
    document.getElementById("primaryAction");

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


let selectedMood = null;


// ==========================================================
// AUTHENTICATION
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


        if (checkinApp) {

            checkinApp.classList.remove(
                "hidden"
            );
        }

    }
);


// ==========================================================
// MOOD SELECTION
// ==========================================================

moodOptions.forEach(

    (option) => {

        option.addEventListener(

            "click",

            () => {

                moodOptions.forEach(

                    (item) => {

                        item.classList.remove(
                            "selected"
                        );

                    }

                );


                option.classList.add(
                    "selected"
                );


                selectedMood =
                    option.dataset.mood;


                if (formError) {

                    formError.textContent =
                        "";
                }

            }

        );

    }

);


// ==========================================================
// CHARACTER COUNTER
// ==========================================================

if (moodNote) {

    moodNote.addEventListener(

        "input",

        () => {

            characterCount.textContent =
                moodNote.value.length;

        }

    );

}


// ==========================================================
// CHECK-IN SUBMIT
// ==========================================================

if (checkinForm) {

    checkinForm.addEventListener(

        "submit",

        (event) => {

            event.preventDefault();


            if (!selectedMood) {

                formError.textContent =
                    "Please select how you're feeling before completing your check-in.";

                return;
            }


            showRecommendation(
                selectedMood
            );

        }

    );

}


// ==========================================================
// RECOMMENDATIONS
// ==========================================================

function showRecommendation(
    mood
) {

    const recommendations = {

        great: {

            icon: "☀",

            title:
                "It's good to hear you're feeling great.",

            message:
                "Take a moment to notice what is contributing to this feeling. Recognizing positive moments can help you understand what supports your wellbeing.",

            recommendation:
                "Consider doing something meaningful today—continue a healthy routine, connect with someone you value, or spend time on an activity you enjoy.",

            actionText:
                "Explore Wellness Activities",

            actionLink:
                "wellness.html"

        },


        good: {

            icon: "♡",

            title:
                "You're doing well today.",

            message:
                "Checking in with yourself is a useful habit, even on good days.",

            recommendation:
                "A short walk, mindful break, music, or a few minutes away from screens could help you maintain this positive balance.",

            actionText:
                "Explore Wellness Activities",

            actionLink:
                "wellness.html"

        },


        okay: {

            icon: "◇",

            title:
                "It's okay to simply feel okay.",

            message:
                "Some days feel neutral or uncertain. You don't need to force yourself to feel differently.",

            recommendation:
                "Try a small reset: drink some water, stretch, take a few slow breaths, or choose one manageable task to focus on.",

            actionText:
                "Try a Wellness Activity",

            actionLink:
                "wellness.html"

        },


        low: {

            icon: "♡",

            title:
                "Thank you for checking in.",

            message:
                "A difficult day can take a lot of energy. Give yourself permission to take things one step at a time.",

            recommendation:
                "Consider trying a breathing or grounding exercise. You can also talk with MindBridge AI or reach out to someone you trust.",

            actionText:
                "Try Immediate Help",

            actionLink:
                "immediate-help.html"

        },


        "very-low": {

            icon: "◎",

            title:
                "We're glad you chose to check in.",

            message:
                "You may be going through a particularly difficult moment. Consider connecting with someone you trust rather than handling everything alone.",

            recommendation:
                "Try the Immediate Help tools for grounding and breathing support. If you feel unsafe or are in immediate danger, contact local emergency services or seek immediate help from a trusted person nearby.",

            actionText:
                "Open Immediate Help",

            actionLink:
                "immediate-help.html"

        }

    };


    const result =
        recommendations[mood];


    resultIcon.textContent =
        result.icon;


    resultTitle.textContent =
        result.title;


    resultMessage.textContent =
        result.message;


    recommendationText.textContent =
        result.recommendation;


    primaryAction.textContent =
        result.actionText;


    primaryAction.href =
        result.actionLink;


    resultCard.classList.remove(
        "hidden"
    );


    resultCard.scrollIntoView(
        {
            behavior:
                "smooth",

            block:
                "center"
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

                await signOut(
                    auth
                );


                window.location.replace(
                    "./login.html"
                );

            }

            catch (error) {

                console.error(
                    "Logout Error:",
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