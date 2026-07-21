// ==========================================================
// MINDBRIDGE - AUTHENTICATION
// File: frontend/js/auth.js
// ==========================================================
//
// Features:
//
// 1. Firebase Email/Password Signup
// 2. Firebase Email/Password Login
// 3. Firebase Authentication Persistence
// 4. Firebase User Display Name
// 5. Firestore User Profile Creation
// 6. Password Show/Hide
// 7. Firebase Error Handling
// 8. Dashboard Redirect
//
// ==========================================================



// ==========================================================
// IMPORT FIREBASE SERVICES
// ==========================================================

import {
    auth,
    db
} from "../firebase/firebase-config.js";



// ==========================================================
// IMPORT FIREBASE AUTH FUNCTIONS
// ==========================================================

import {

    createUserWithEmailAndPassword,

    signInWithEmailAndPassword,

    updateProfile,

    setPersistence,

    browserLocalPersistence,

    browserSessionPersistence

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";



// ==========================================================
// IMPORT FIRESTORE FUNCTIONS
// ==========================================================

import {

    doc,

    setDoc,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



// ==========================================================
// WAIT FOR PAGE TO LOAD
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        console.log(
            "MindBridge auth.js loaded successfully."
        );



        // ==================================================
        // PASSWORD SHOW / HIDE
        // ==================================================

        const passwordToggles =
            document.querySelectorAll(
                ".password-toggle"
            );


        passwordToggles.forEach(
            (button) => {


                button.addEventListener(
                    "click",
                    () => {


                        const targetId =
                            button.dataset.target;


                        const passwordInput =
                            document.getElementById(
                                targetId
                            );


                        if (!passwordInput) {

                            console.error(
                                "Password input not found:",
                                targetId
                            );

                            return;

                        }


                        if (
                            passwordInput.type ===
                            "password"
                        ) {


                            passwordInput.type =
                                "text";


                            button.textContent =
                                "Hide";


                        } else {


                            passwordInput.type =
                                "password";


                            button.textContent =
                                "Show";


                        }


                    }
                );


            }
        );



        // ==================================================
        // SIGNUP
        // ==================================================

        const signupForm =
            document.getElementById(
                "signupForm"
            );


        if (signupForm) {


            console.log(
                "MindBridge signup form detected."
            );


            signupForm.addEventListener(
                "submit",
                async (event) => {


                    // Prevent page refresh

                    event.preventDefault();



                    // ======================================
                    // GET FORM ELEMENTS
                    // ======================================

                    const nameInput =
                        document.getElementById(
                            "signupName"
                        );


                    const emailInput =
                        document.getElementById(
                            "signupEmail"
                        );


                    const passwordInput =
                        document.getElementById(
                            "signupPassword"
                        );


                    const confirmPasswordInput =
                        document.getElementById(
                            "confirmPassword"
                        );


                    const termsInput =
                        document.getElementById(
                            "acceptTerms"
                        );


                    const messageElement =
                        document.getElementById(
                            "signupMessage"
                        );


                    const submitButton =
                        document.getElementById(
                            "signupSubmitBtn"
                        );



                    // ======================================
                    // CHECK REQUIRED HTML ELEMENTS
                    // ======================================

                    if (
                        !nameInput ||
                        !emailInput ||
                        !passwordInput ||
                        !confirmPasswordInput
                    ) {


                        console.error(
                            "Signup form elements are missing."
                        );


                        showMessage(
                            messageElement,
                            "Signup form configuration error.",
                            "error"
                        );


                        return;


                    }



                    // ======================================
                    // GET USER INPUT
                    // ======================================

                    const name =
                        nameInput.value.trim();


                    const email =
                        emailInput.value
                            .trim()
                            .toLowerCase();


                    const password =
                        passwordInput.value;


                    const confirmPassword =
                        confirmPasswordInput.value;



                    // Clear previous messages

                    clearMessage(
                        messageElement
                    );



                    // ======================================
                    // VALIDATE NAME
                    // ======================================

                    if (!name) {


                        showMessage(
                            messageElement,
                            "Please enter your full name.",
                            "error"
                        );


                        return;


                    }



                    // ======================================
                    // VALIDATE EMAIL
                    // ======================================

                    if (!email) {


                        showMessage(
                            messageElement,
                            "Please enter your email address.",
                            "error"
                        );


                        return;


                    }



                    // ======================================
                    // VALIDATE PASSWORD
                    // ======================================

                    if (
                        password.length < 6
                    ) {


                        showMessage(
                            messageElement,
                            "Password must contain at least 6 characters.",
                            "error"
                        );


                        return;


                    }



                    // ======================================
                    // CHECK PASSWORD MATCH
                    // ======================================

                    if (
                        password !==
                        confirmPassword
                    ) {


                        showMessage(
                            messageElement,
                            "Passwords do not match.",
                            "error"
                        );


                        return;


                    }



                    // ======================================
                    // CHECK TERMS
                    // ======================================

                    if (
                        termsInput &&
                        !termsInput.checked
                    ) {


                        showMessage(
                            messageElement,
                            "Please accept the MindBridge usage terms.",
                            "error"
                        );


                        return;


                    }



                    // ======================================
                    // CREATE ACCOUNT
                    // ======================================

                    try {


                        console.log(
                            "Creating MindBridge account..."
                        );


                        setButtonLoading(
                            submitButton,
                            true,
                            "Creating Account..."
                        );



                        // ==================================
                        // STEP 1:
                        // CREATE FIREBASE AUTH USER
                        // ==================================

                        const userCredential =
                            await createUserWithEmailAndPassword(
                                auth,
                                email,
                                password
                            );



                        const user =
                            userCredential.user;



                        console.log(
                            "Firebase Authentication account created."
                        );


                        console.log(
                            "Firebase UID:",
                            user.uid
                        );



                        // ==================================
                        // STEP 2:
                        // UPDATE FIREBASE DISPLAY NAME
                        // ==================================

                        await updateProfile(
                            user,
                            {
                                displayName:
                                    name
                            }
                        );



                        console.log(
                            "Firebase display name updated."
                        );



                        // ==================================
                        // STEP 3:
                        // CREATE FIRESTORE USER PROFILE
                        // ==================================
                        //
                        // Collection:
                        //
                        // users
                        //
                        // Document ID:
                        //
                        // Firebase UID
                        //
                        // ==================================

                        await setDoc(

                            doc(
                                db,
                                "users",
                                user.uid
                            ),

                            {

                                uid:
                                    user.uid,

                                name:
                                    name,

                                email:
                                    user.email,

                                createdAt:
                                    serverTimestamp(),

                                updatedAt:
                                    serverTimestamp()

                            }

                        );



                        console.log(
                            "Firestore user profile created."
                        );



                        // ==================================
                        // SUCCESS
                        // ==================================

                        showMessage(
                            messageElement,
                            "Account created successfully! Opening your dashboard...",
                            "success"
                        );



                        console.log(
                            "Redirecting to dashboard..."
                        );



                        // ==================================
                        // REDIRECT
                        // ==================================

                        window.location.replace("./login.html");


                    } catch (error) {


                        console.error(
                            "MindBridge Signup Error:",
                            error
                        );


                        console.error(
                            "Firebase Error Code:",
                            error.code
                        );


                        console.error(
                            "Firebase Error Message:",
                            error.message
                        );



                        showMessage(
                            messageElement,
                            getFirebaseErrorMessage(
                                error.code
                            ),
                            "error"
                        );


                        // Existing account:
                        // show the error, then redirect to Login.
                        if (
                            error.code ===
                            "auth/email-already-in-use"
                        ) {

                            setButtonLoading(
                                submitButton,
                                false,
                                "Create Account"
                            );

                            setTimeout(
                                () => {
                                    window.location.replace(
                                        "./login.html"
                                    );
                                },
                                1800
                            );

                            return;
                        }



                        setButtonLoading(
                            submitButton,
                            false,
                            "Create Account"
                        );


                    }


                }
            );


        }



        // ==================================================
        // LOGIN
        // ==================================================

        const loginForm =
            document.getElementById(
                "loginForm"
            );


        if (loginForm) {


            console.log(
                "MindBridge login form detected."
            );


            loginForm.addEventListener(
                "submit",
                async (event) => {


                    // Prevent page refresh

                    event.preventDefault();



                    // ======================================
                    // GET FORM ELEMENTS
                    // ======================================

                    const emailInput =
                        document.getElementById(
                            "loginEmail"
                        );


                    const passwordInput =
                        document.getElementById(
                            "loginPassword"
                        );


                    const rememberInput =
                        document.getElementById(
                            "rememberMe"
                        );


                    const messageElement =
                        document.getElementById(
                            "loginMessage"
                        );


                    const submitButton =
                        document.getElementById(
                            "loginSubmitBtn"
                        );



                    // ======================================
                    // CHECK REQUIRED ELEMENTS
                    // ======================================

                    if (
                        !emailInput ||
                        !passwordInput
                    ) {


                        console.error(
                            "Login form elements are missing."
                        );


                        showMessage(
                            messageElement,
                            "Login form configuration error.",
                            "error"
                        );


                        return;


                    }



                    // ======================================
                    // GET USER INPUT
                    // ======================================

                    const email =
                        emailInput.value
                            .trim()
                            .toLowerCase();


                    const password =
                        passwordInput.value;



                    clearMessage(
                        messageElement
                    );



                    // ======================================
                    // VALIDATE EMAIL
                    // ======================================

                    if (!email) {


                        showMessage(
                            messageElement,
                            "Please enter your email address.",
                            "error"
                        );


                        return;


                    }



                    // ======================================
                    // VALIDATE PASSWORD
                    // ======================================

                    if (!password) {


                        showMessage(
                            messageElement,
                            "Please enter your password.",
                            "error"
                        );


                        return;


                    }



                    // ======================================
                    // FIREBASE LOGIN
                    // ======================================

                    try {


                        console.log(
                            "Attempting MindBridge login..."
                        );


                        setButtonLoading(
                            submitButton,
                            true,
                            "Logging In..."
                        );



                        // ==================================
                        // SET AUTH PERSISTENCE
                        // ==================================

                        if (
                            rememberInput &&
                            rememberInput.checked
                        ) {


                            await setPersistence(
                                auth,
                                browserLocalPersistence
                            );


                            console.log(
                                "Login persistence: Local"
                            );


                        } else {


                            await setPersistence(
                                auth,
                                browserSessionPersistence
                            );


                            console.log(
                                "Login persistence: Session"
                            );


                        }



                        // ==================================
                        // LOGIN WITH FIREBASE
                        // ==================================

                        const userCredential =
                            await signInWithEmailAndPassword(
                                auth,
                                email,
                                password
                            );



                        const user =
                            userCredential.user;



                        // ==================================
                        // LOGIN SUCCESSFUL
                        // ==================================

                        console.log(
                            "MindBridge login successful."
                        );


                        console.log(
                            "Firebase UID:",
                            user.uid
                        );


                        console.log(
                            "Firebase Email:",
                            user.email
                        );



                        showMessage(
                            messageElement,
                            "Login successful! Opening your dashboard...",
                            "success"
                        );



                        console.log(
                            "Redirecting to dashboard..."
                        );



                        // ==================================
                        // REDIRECT TO DASHBOARD
                        // ==================================

                        window.location.replace("./dashboard.html");


                    } catch (error) {


                        console.error(
                            "Firebase Login Error:",
                            error
                        );


                        console.error(
                            "Firebase Error Code:",
                            error.code
                        );


                        console.error(
                            "Firebase Error Message:",
                            error.message
                        );



                        showMessage(
                            messageElement,
                            getFirebaseErrorMessage(
                                error.code
                            ),
                            "error"
                        );



                        setButtonLoading(
                            submitButton,
                            false,
                            "Login"
                        );


                    }


                }
            );


        }



        // ==================================================
        // SHOW MESSAGE
        // ==================================================

        function showMessage(
            element,
            text,
            type
        ) {


            if (!element) {


                console.warn(
                    "Message element was not found."
                );


                return;


            }


            element.textContent =
                text;


            element.className =
                `form-message ${type}`;


        }



        // ==================================================
        // CLEAR MESSAGE
        // ==================================================

        function clearMessage(
            element
        ) {


            if (!element) {
                return;
            }


            element.textContent =
                "";


            element.className =
                "form-message";


        }



        // ==================================================
        // BUTTON LOADING
        // ==================================================

        function setButtonLoading(
            button,
            loading,
            text
        ) {


            if (!button) {
                return;
            }


            button.disabled =
                loading;


            button.textContent =
                text;


        }



        // ==================================================
        // FIREBASE ERROR MESSAGES
        // ==================================================

        function getFirebaseErrorMessage(
            errorCode
        ) {


            switch (
                errorCode
            ) {


                case "auth/email-already-in-use":

                    return (
                        "An account already exists with this email address. Please login instead."
                    );



                case "auth/invalid-email":

                    return (
                        "Please enter a valid email address."
                    );



                case "auth/weak-password":

                    return (
                        "Your password is too weak. Please use a stronger password."
                    );



                case "auth/operation-not-allowed":

                    return (
                        "Email/password authentication is not enabled in Firebase."
                    );



                case "auth/user-not-found":

                    return (
                        "No MindBridge account was found with this email address."
                    );



                case "auth/wrong-password":

                    return (
                        "The password you entered is incorrect."
                    );



                case "auth/invalid-credential":

                    return (
                        "The email or password you entered is incorrect."
                    );



                case "auth/user-disabled":

                    return (
                        "This MindBridge account has been disabled."
                    );



                case "auth/too-many-requests":

                    return (
                        "Too many login attempts. Please wait and try again."
                    );



                case "auth/network-request-failed":

                    return (
                        "Network error. Please check your internet connection."
                    );



                case "permission-denied":

                case "firestore/permission-denied":

                    return (
                        "Your account was created, but MindBridge could not create your database profile because of Firestore permissions."
                    );



                default:


                    console.warn(
                        "Unhandled Firebase error:",
                        errorCode
                    );


                    return (
                        "Something went wrong. Please check the browser console for details."
                    );


            }


        }


    }
);