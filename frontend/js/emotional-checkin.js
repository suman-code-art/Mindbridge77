// ==========================================================
// MINDBRIDGE - EMOTIONAL CHECK-IN
// File: frontend/js/emotional-checkin.js
// ==========================================================


// ==========================================================
// FIREBASE
// ==========================================================

import {
    auth,
    db
} from "../firebase/firebase-config.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



// ==========================================================
// ELEMENTS
// ==========================================================

const moodButtons =
    document.querySelectorAll(
        ".mood-button"
    );


const intensityInput =
    document.getElementById(
        "intensity"
    );


const intensityValue =
    document.getElementById(
        "intensityValue"
    );


const noteInput =
    document.getElementById(
        "checkinNote"
    );


const saveButton =
    document.getElementById(
        "saveCheckinBtn"
    );


const messageElement =
    document.getElementById(
        "checkinMessage"
    );



// ==========================================================
// STATE
// ==========================================================

let currentUser = null;

let selectedMood = null;



// ==========================================================
// AUTHENTICATION CHECK
// ==========================================================

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            console.log(
                "User not authenticated."
            );


            window.location.replace(
                "./login.html"
            );


            return;

        }


        currentUser = user;


        console.log(
            "Emotional check-in user:",
            user.uid
        );

    }
);



// ==========================================================
// MOOD SELECTION
// ==========================================================

moodButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {


                // Remove previous selection

                moodButtons.forEach(
                    (moodButton) => {

                        moodButton.classList.remove(
                            "selected"
                        );

                    }
                );


                // Select current mood

                button.classList.add(
                    "selected"
                );


                selectedMood =
                    button.dataset.mood;


                console.log(
                    "Selected mood:",
                    selectedMood
                );

            }
        );

    }
);



// ==========================================================
// INTENSITY
// ==========================================================

intensityInput.addEventListener(
    "input",
    () => {

        intensityValue.textContent =
            intensityInput.value;

    }
);



// ==========================================================
// SAVE CHECK-IN
// ==========================================================

saveButton.addEventListener(
    "click",
    async () => {


        clearMessage();


        // ==============================================
        // CHECK USER
        // ==============================================

        if (!currentUser) {

            showMessage(
                "Please login before saving your check-in.",
                "error"
            );


            return;

        }



        // ==============================================
        // CHECK MOOD
        // ==============================================

        if (!selectedMood) {

            showMessage(
                "Please select how you're feeling.",
                "error"
            );


            return;

        }



        // ==============================================
        // GET DATA
        // ==============================================

        const intensity =
            Number(
                intensityInput.value
            );


        const note =
            noteInput.value.trim();



        // ==============================================
        // SAVE TO FIRESTORE
        // ==============================================

        try {


            saveButton.disabled =
                true;


            saveButton.textContent =
                "Saving...";



            /*
                Firestore structure:

                users
                    USER_UID
                        emotionalCheckins
                            AUTO_DOCUMENT_ID
            */


            await addDoc(

                collection(
                    db,
                    "users",
                    currentUser.uid,
                    "emotionalCheckins"
                ),

                {

                    mood:
                        selectedMood,

                    intensity:
                        intensity,

                    note:
                        note,

                    createdAt:
                        serverTimestamp()

                }

            );



            console.log(
                "Emotional check-in saved."
            );



            showMessage(
                "Your emotional check-in has been saved.",
                "success"
            );



            // ==========================================
            // RESET FORM
            // ==========================================

            selectedMood =
                null;


            moodButtons.forEach(
                (button) => {

                    button.classList.remove(
                        "selected"
                    );

                }
            );


            intensityInput.value =
                5;


            intensityValue.textContent =
                "5";


            noteInput.value =
                "";



            // ==========================================
            // RETURN TO DASHBOARD
            // ==========================================

            setTimeout(
                () => {

                    window.location.href =
                        "./dashboard.html";

                },
                1500
            );


        } catch (error) {


            console.error(
                "Error saving emotional check-in:",
                error
            );


            showMessage(
                "Unable to save your check-in. Please try again.",
                "error"
            );


        } finally {


            saveButton.disabled =
                false;


            saveButton.textContent =
                "Save Check-in";


        }


    }
);



// ==========================================================
// MESSAGE FUNCTIONS
// ==========================================================

function showMessage(
    message,
    type
) {

    messageElement.textContent =
        message;


    if (
        type === "success"
    ) {

        messageElement.className =
            "success-message";

    } else {

        messageElement.className =
            "error-message";

    }

}



function clearMessage() {

    messageElement.textContent =
        "";


    messageElement.className =
        "";

}