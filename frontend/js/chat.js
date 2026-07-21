// ==========================================================
// MINDBRIDGE AI SUPPORT CHAT
// File: frontend/js/chat.js
// ==========================================================
//
// CURRENT FEATURES:
//
// 1. Firebase authentication protection
// 2. User information display
// 3. Flask backend communication
// 4. Gemini AI support chat
// 5. Suggested prompts
// 6. Chat loading indicator
// 7. Enter-to-send
// 8. Shift+Enter for new line
// 9. Auto-resizing textarea
// 10. Logout
// 11. Mobile sidebar
//
// Conversation saving will be added in the next phase.
//
// ==========================================================


// ==========================================================
// FIREBASE CONFIGURATION
// ==========================================================

import {
    auth
} from "../firebase/firebase-config.js";


// ==========================================================
// FIREBASE AUTHENTICATION FUNCTIONS
// ==========================================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================================
// MINDBRIDGE API CONFIGURATION
// ==========================================================

import {
    API_ENDPOINTS
} from "./config.js";


// ==========================================================
// HTML ELEMENTS
// ==========================================================

const authLoading =
    document.getElementById(
        "authLoading"
    );

const chatApp =
    document.getElementById(
        "chatApp"
    );

const chatForm =
    document.getElementById(
        "chatForm"
    );

const messageInput =
    document.getElementById(
        "messageInput"
    );

const sendButton =
    document.getElementById(
        "sendButton"
    );

const chatMessages =
    document.getElementById(
        "chatMessages"
    );

const typingIndicator =
    document.getElementById(
        "typingIndicator"
    );

const chatError =
    document.getElementById(
        "chatError"
    );

const suggestedPrompts =
    document.querySelectorAll(
        ".suggested-prompt"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const sidebarToggle =
    document.getElementById(
        "sidebarToggle"
    );

const chatSidebar =
    document.getElementById(
        "chatSidebar"
    );

const sidebarUserName =
    document.getElementById(
        "sidebarUserName"
    );

const sidebarUserEmail =
    document.getElementById(
        "sidebarUserEmail"
    );

const sidebarAvatar =
    document.getElementById(
        "sidebarAvatar"
    );


// ==========================================================
// CURRENT AUTHENTICATED USER
// ==========================================================

let currentUser = null;


// ==========================================================
// FIREBASE AUTHENTICATION PROTECTION
// ==========================================================
//
// This checks whether the user is logged in.
//
// Logged in:
// Show the chat.
//
// Not logged in:
// Redirect to login.html.
//
// ==========================================================

onAuthStateChanged(

    auth,

    (user) => {

        // ==================================================
        // USER NOT LOGGED IN
        // ==================================================

        if (!user) {

            console.log(
                "No authenticated MindBridge user."
            );

            window.location.replace(
                "./login.html"
            );

            return;
        }


        // ==================================================
        // USER IS LOGGED IN
        // ==================================================

        currentUser = user;

        console.log(
            "MindBridge authenticated user:",
            user.uid
        );


        // ==================================================
        // GET USER DISPLAY NAME
        // ==================================================

        const displayName =
            user.displayName ||
            "MindBridge User";


        // ==================================================
        // DISPLAY USER NAME
        // ==================================================

        if (sidebarUserName) {

            sidebarUserName.textContent =
                displayName;
        }


        // ==================================================
        // DISPLAY USER EMAIL
        // ==================================================

        if (sidebarUserEmail) {

            sidebarUserEmail.textContent =
                user.email || "";
        }


        // ==================================================
        // DISPLAY USER AVATAR INITIAL
        // ==================================================

        if (sidebarAvatar) {

            sidebarAvatar.textContent =
                displayName
                    .charAt(0)
                    .toUpperCase();
        }


        // ==================================================
        // HIDE AUTH LOADING SCREEN
        // ==================================================

        if (authLoading) {

            authLoading.style.display =
                "none";
        }


        // ==================================================
        // SHOW CHAT APPLICATION
        // ==================================================

        if (chatApp) {

            chatApp.classList.remove(
                "hidden"
            );
        }

    }

);


// ==========================================================
// CHAT FORM
// ==========================================================

if (chatForm) {

    chatForm.addEventListener(

        "submit",

        async (event) => {

            // Prevent normal form submission

            event.preventDefault();


            // Get message

            const message =
                messageInput.value
                    .trim();


            // Ignore empty messages

            if (!message) {

                return;
            }


            // Send message

            await sendMessage(
                message
            );

        }

    );

}


// ==========================================================
// SEND MESSAGE
// ==========================================================

async function sendMessage(
    message
) {

    // ======================================================
    // CHECK AUTHENTICATION
    // ======================================================

    if (!currentUser) {

        showError(
            "You must be logged in to use MindBridge AI."
        );

        return;
    }


    // ======================================================
    // CLEAR PREVIOUS ERROR
    // ======================================================

    showError(
        ""
    );


    // ======================================================
    // ADD USER MESSAGE TO SCREEN
    // ======================================================

    addUserMessage(
        message
    );


    // ======================================================
    // CLEAR TEXTAREA
    // ======================================================

    messageInput.value =
        "";

    autoResizeTextarea();


    // ======================================================
    // ENABLE LOADING STATE
    // ======================================================

    setChatLoading(
        true
    );


    // ======================================================
    // HIDE SUGGESTED PROMPTS
    // ======================================================

    const promptContainer =
        document.getElementById(
            "suggestedPrompts"
        );

    if (promptContainer) {

        promptContainer.style.display =
            "none";
    }


    try {

        console.log(
            "Sending message to MindBridge Flask API..."
        );


        console.log(
            "API endpoint:",
            API_ENDPOINTS.chat
        );


        // ==================================================
        // SEND MESSAGE TO FLASK
        // ==================================================

        const response =
            await fetch(

                API_ENDPOINTS.chat,

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            {

                                message:
                                    message

                            }
                        )

                }

            );


        // ==================================================
        // READ FLASK RESPONSE
        // ==================================================

        const data =
            await response.json();


        console.log(
            "MindBridge API response:",
            data
        );


        // ==================================================
        // HANDLE HTTP ERROR
        // ==================================================

        if (!response.ok) {

            throw new Error(

                data.error ||

                "MindBridge AI could not process your message."

            );
        }


        // ==================================================
        // VALIDATE RESPONSE
        // ==================================================

        if (
            !data.success ||
            !data.reply
        ) {

            throw new Error(
                "MindBridge AI returned an invalid response."
            );
        }


        // ==================================================
        // DISPLAY GEMINI RESPONSE
        // ==================================================

        addAIMessage(
            data.reply
        );

    }

    catch (error) {

        console.error(
            "MindBridge Chat Error:",
            error
        );


        // ==================================================
        // DISPLAY ERROR
        // ==================================================

        showError(

            error.message ||

            "Unable to connect to MindBridge AI."

        );


        // ==================================================
        // FRIENDLY CHAT MESSAGE
        // ==================================================

        addAIMessage(
            "I'm having trouble connecting right now. Please try again in a moment."
        );

    }

    finally {

        // ==================================================
        // DISABLE LOADING STATE
        // ==================================================

        setChatLoading(
            false
        );


        // Return focus to message box

        if (messageInput) {

            messageInput.focus();
        }

    }

}


// ==========================================================
// ADD USER MESSAGE
// ==========================================================

function addUserMessage(
    message
) {

    // Create row

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "message-row user-message-row";


    // ======================================================
    // USER AVATAR
    // ======================================================

    const avatar =
        document.createElement(
            "div"
        );

    avatar.className =
        "message-avatar user-message-avatar";


    avatar.textContent =

        currentUser &&
        currentUser.displayName

            ? currentUser
                .displayName
                .charAt(0)
                .toUpperCase()

            : "U";


    // ======================================================
    // MESSAGE CONTENT
    // ======================================================

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "message-content";


    // ======================================================
    // SENDER NAME
    // ======================================================

    const sender =
        document.createElement(
            "div"
        );

    sender.className =
        "message-sender";

    sender.textContent =
        "You";


    // ======================================================
    // MESSAGE BUBBLE
    // ======================================================

    const bubble =
        document.createElement(
            "div"
        );

    bubble.className =
        "message-bubble user-bubble";


    // textContent prevents HTML injection

    bubble.textContent =
        message;


    // ======================================================
    // BUILD MESSAGE
    // ======================================================

    content.appendChild(
        sender
    );

    content.appendChild(
        bubble
    );

    row.appendChild(
        avatar
    );

    row.appendChild(
        content
    );

    chatMessages.appendChild(
        row
    );


    // Scroll down

    scrollToBottom();

}


// ==========================================================
// ADD AI MESSAGE
// ==========================================================

function addAIMessage(
    message
) {

    // Create row

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "message-row ai-message-row";


    // ======================================================
    // AI AVATAR
    // ======================================================

    const avatar =
        document.createElement(
            "div"
        );

    avatar.className =
        "message-avatar ai-message-avatar";

    avatar.textContent =
        "✦";


    // ======================================================
    // MESSAGE CONTENT
    // ======================================================

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "message-content";


    // ======================================================
    // SENDER
    // ======================================================

    const sender =
        document.createElement(
            "div"
        );

    sender.className =
        "message-sender";

    sender.textContent =
        "MindBridge AI";


    // ======================================================
    // AI MESSAGE BUBBLE
    // ======================================================

    const bubble =
        document.createElement(
            "div"
        );

    bubble.className =
        "message-bubble ai-bubble";


    // Use textContent for security

    bubble.textContent =
        message;


    // ======================================================
    // BUILD MESSAGE
    // ======================================================

    content.appendChild(
        sender
    );

    content.appendChild(
        bubble
    );

    row.appendChild(
        avatar
    );

    row.appendChild(
        content
    );

    chatMessages.appendChild(
        row
    );


    // Scroll down

    scrollToBottom();

}


// ==========================================================
// CHAT LOADING STATE
// ==========================================================

function setChatLoading(
    loading
) {

    // ======================================================
    // SEND BUTTON
    // ======================================================

    if (sendButton) {

        sendButton.disabled =
            loading;

        sendButton.textContent =

            loading

                ? "Thinking..."

                : "Send";
    }


    // ======================================================
    // MESSAGE INPUT
    // ======================================================

    if (messageInput) {

        messageInput.disabled =
            loading;
    }


    // ======================================================
    // TYPING INDICATOR
    // ======================================================

    if (typingIndicator) {

        if (loading) {

            typingIndicator
                .classList
                .remove(
                    "hidden"
                );

        } else {

            typingIndicator
                .classList
                .add(
                    "hidden"
                );

        }

    }


    // Scroll down

    scrollToBottom();

}


// ==========================================================
// SHOW CHAT ERROR
// ==========================================================

function showError(
    message
) {

    if (chatError) {

        chatError.textContent =
            message;
    }

}


// ==========================================================
// SUGGESTED PROMPTS
// ==========================================================

suggestedPrompts.forEach(

    (button) => {

        button.addEventListener(

            "click",

            async () => {

                const message =
                    button.dataset.message;


                if (message) {

                    await sendMessage(
                        message
                    );

                }

            }

        );

    }

);


// ==========================================================
// KEYBOARD SUPPORT
// ==========================================================
//
// ENTER:
// Send message.
//
// SHIFT + ENTER:
// Add a new line.
//
// ==========================================================

if (messageInput) {

    messageInput.addEventListener(

        "keydown",

        (event) => {

            if (

                event.key ===
                "Enter"

                &&

                !event.shiftKey

            ) {

                event.preventDefault();


                if (chatForm) {

                    chatForm.requestSubmit();

                }

            }

        }

    );

}


// ==========================================================
// AUTO RESIZE TEXTAREA
// ==========================================================

if (messageInput) {

    messageInput.addEventListener(

        "input",

        autoResizeTextarea

    );

}


function autoResizeTextarea() {

    if (!messageInput) {

        return;
    }


    // Reset height

    messageInput.style.height =
        "auto";


    // Set new height

    messageInput.style.height =
        `${Math.min(
            messageInput.scrollHeight,
            150
        )}px`;

}


// ==========================================================
// SCROLL TO LATEST MESSAGE
// ==========================================================

function scrollToBottom() {

    window.requestAnimationFrame(

        () => {

            window.scrollTo(

                {

                    top:
                        document.documentElement.scrollHeight,

                    behavior:
                        "smooth"

                }

            );

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

                console.log(
                    "Logging out MindBridge user..."
                );


                // Firebase logout

                await signOut(
                    auth
                );


                // Redirect

                window.location.replace(
                    "./login.html"
                );

            }

            catch (error) {

                console.error(
                    "MindBridge Logout Error:",
                    error
                );


                showError(
                    "Unable to log out. Please try again."
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
    chatSidebar
) {

    sidebarToggle.addEventListener(

        "click",

        () => {

            chatSidebar
                .classList
                .toggle(
                    "mobile-open"
                );

        }

    );

}


// ==========================================================
// INITIALIZATION LOG
// ==========================================================

console.log(
    "MindBridge chat.js loaded."
);

console.log(
    "MindBridge Chat API:",
    API_ENDPOINTS.chat
);