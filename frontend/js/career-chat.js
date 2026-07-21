// ==========================================================
// MINDBRIDGE - AI CAREER COUNSELOR
// File: frontend/JS/career-chat.js
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
// BACKEND API
// ==========================================================

import {
    API_BASE_URL
} from "./config.js";


const CAREER_API_URL =
    `${API_BASE_URL}/api/career-chat`;


// ==========================================================
// APPLICATION ELEMENTS
// ==========================================================

const authLoading =
    document.getElementById(
        "authLoading"
    );


const careerChatApp =
    document.getElementById(
        "careerChatApp"
    );


// ==========================================================
// SIDEBAR ELEMENTS
// ==========================================================

const sidebar =
    document.getElementById(
        "sidebar"
    );


const sidebarToggle =
    document.getElementById(
        "sidebarToggle"
    );


const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


// ==========================================================
// USER ELEMENTS
// ==========================================================

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


const headerFullName =
    document.getElementById(
        "headerFullName"
    );


const headerEmail =
    document.getElementById(
        "headerEmail"
    );


const headerAvatar =
    document.getElementById(
        "headerAvatar"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


// ==========================================================
// STAGE ELEMENTS
// ==========================================================

const stageSelection =
    document.getElementById(
        "stageSelection"
    );


const stageCards =
    document.querySelectorAll(
        ".stage-card"
    );


const stageError =
    document.getElementById(
        "stageError"
    );


const startCounselingBtn =
    document.getElementById(
        "startCounselingBtn"
    );


// ==========================================================
// CHAT ELEMENTS
// ==========================================================

const chatSection =
    document.getElementById(
        "chatSection"
    );


const chatMessages =
    document.getElementById(
        "chatMessages"
    );


const chatForm =
    document.getElementById(
        "chatForm"
    );


const messageInput =
    document.getElementById(
        "messageInput"
    );


const sendMessageBtn =
    document.getElementById(
        "sendMessageBtn"
    );


const typingIndicator =
    document.getElementById(
        "typingIndicator"
    );


const chatError =
    document.getElementById(
        "chatError"
    );


const currentStageBadge =
    document.getElementById(
        "currentStageBadge"
    );


const changeStageBtn =
    document.getElementById(
        "changeStageBtn"
    );


// ==========================================================
// APPLICATION STATE
// ==========================================================

let selectedStage =
    null;


let isSending =
    false;


let conversationHistory =
    [];


// ==========================================================
// CAREER STAGE INFORMATION
// ==========================================================

const stageInformation = {


    // ------------------------------------------------------
    // SCHOOL
    // ------------------------------------------------------

    school: {

        label:
            "School Student · Class 8–10",


        context:
            "The user is currently a school student in Class 8 to 10. "
            + "The counseling session should focus on understanding "
            + "their subjects, academic strengths, interests, aptitude "
            + "and activities before discussing possible streams or "
            + "career families.",


        greeting:
            "Hi! I’m your MindBridge AI Career Counselor. "
            + "I’ll help you explore your interests and strengths before "
            + "we discuss possible career or stream directions.\n\n"
            + "To begin, which class are you currently studying in, "
            + "and which subjects do you enjoy the most?"

    },


    // ------------------------------------------------------
    // SENIOR SECONDARY
    // ------------------------------------------------------

    "senior-secondary": {

        label:
            "Senior Secondary · Class 11–12",


        context:
            "The user is currently a senior secondary student in "
            + "Class 11 or Class 12. The counseling session should "
            + "understand their current stream, subjects, interests, "
            + "academic strengths and future goals before suggesting "
            + "courses or career directions.",


        greeting:
            "Hi! I’m your MindBridge AI Career Counselor. "
            + "I’ll help you explore courses and career directions "
            + "based on your current studies, strengths and interests.\n\n"
            + "To begin, are you currently in Class 11 or Class 12, "
            + "and which stream and subjects are you studying?"

    },


    // ------------------------------------------------------
    // COLLEGE
    // ------------------------------------------------------

    college: {

        label:
            "College Student",


        context:
            "The user is currently an undergraduate or college student. "
            + "The counseling session should understand their degree, "
            + "branch or specialization, current year, skills, projects, "
            + "internships, interests and career goals before suggesting "
            + "career paths.",


        greeting:
            "Hi! I’m your MindBridge AI Career Counselor. "
            + "I’ll help you analyse career paths based on your degree, "
            + "skills, interests and goals.\n\n"
            + "To begin, what degree or course are you studying, "
            + "which year are you currently in, and what areas interest "
            + "you the most?"

    },


    // ------------------------------------------------------
    // GRADUATE
    // ------------------------------------------------------

    graduate: {

        label:
            "Graduate",


        context:
            "The user has completed an undergraduate degree and is "
            + "exploring their next career or education step. "
            + "The counseling session should understand their degree, "
            + "specialization, skills, projects, internships, experience "
            + "and goals before suggesting jobs, career paths or higher "
            + "education options.",


        greeting:
            "Hi! I’m your MindBridge AI Career Counselor. "
            + "I’ll help you explore suitable job roles, career paths "
            + "or higher-study options based on your background.\n\n"
            + "To begin, what degree did you complete, and what kind "
            + "of career or education direction are you currently "
            + "considering?"

    },


    // ------------------------------------------------------
    // PROFESSIONAL
    // ------------------------------------------------------

    professional: {

        label:
            "Working Professional",


        context:
            "The user is currently a working professional exploring "
            + "career growth or a possible career transition. "
            + "The counseling session should understand their current "
            + "role, industry, experience, existing skills, transferable "
            + "skills and desired direction before suggesting realistic "
            + "career transitions.",


        greeting:
            "Hi! I’m your MindBridge AI Career Counselor. "
            + "I’ll help you explore realistic career growth or "
            + "transition opportunities based on your experience "
            + "and transferable skills.\n\n"
            + "To begin, what is your current role, and what kind "
            + "of career change or growth are you considering?"

    },


    // ------------------------------------------------------
    // UNSURE
    // ------------------------------------------------------

    unsure: {

        label:
            "Career Discovery",


        context:
            "The user is unsure about their current career direction "
            + "and wants help discovering suitable options. "
            + "The counseling session should first identify their "
            + "education stage and gradually understand their interests, "
            + "strengths, skills and goals.",


        greeting:
            "Hi! I’m your MindBridge AI Career Counselor. "
            + "We can start by understanding where you are right now "
            + "and what naturally interests you.\n\n"
            + "Are you currently in school, college, working, or "
            + "somewhere in between? Also, what subjects or activities "
            + "do you usually enjoy?"

    }

};


// ==========================================================
// GET USER DISPLAY NAME
// ==========================================================

function getDisplayName(
    user
) {

    if (
        user.displayName
    ) {

        return user.displayName;

    }


    if (
        user.email
    ) {

        const emailName =
            user.email
                .split("@")[0];


        return emailName

            .replace(
                /[._-]/g,
                " "
            )

            .replace(

                /\b\w/g,

                character =>
                    character
                        .toUpperCase()

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


        // --------------------------------------------------
        // NOT LOGGED IN
        // --------------------------------------------------

        if (
            !user
        ) {

            window.location.replace(
                "./login.html"
            );


            return;

        }


        // --------------------------------------------------
        // GET USER INFORMATION
        // --------------------------------------------------

        const name =
            getDisplayName(
                user
            );


        const firstName =
            name
                .split(" ")[0];


        const email =
            user.email || "";


        const initial =
            firstName

                .charAt(0)

                .toUpperCase();


        // --------------------------------------------------
        // SIDEBAR USER
        // --------------------------------------------------

        sidebarUserName.textContent =
            name;


        sidebarUserEmail.textContent =
            email;


        sidebarAvatar.textContent =
            initial;


        // --------------------------------------------------
        // HEADER USER
        // --------------------------------------------------

        headerFullName.textContent =
            name;


        headerEmail.textContent =
            email;


        headerAvatar.textContent =
            initial;


        // --------------------------------------------------
        // SHOW APPLICATION
        // --------------------------------------------------

        authLoading.style.display =
            "none";


        careerChatApp.classList.remove(
            "hidden"
        );


        console.log(
            "AI Career Counselor loaded for:",
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

        catch (
            error
        ) {

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
// OPEN MOBILE SIDEBAR
// ==========================================================

function openSidebar() {

    sidebar.classList.add(
        "mobile-open"
    );


    sidebarOverlay.classList.add(
        "active"
    );

}


// ==========================================================
// CLOSE MOBILE SIDEBAR
// ==========================================================

function closeSidebar() {

    sidebar.classList.remove(
        "mobile-open"
    );


    sidebarOverlay.classList.remove(
        "active"
    );

}


// ==========================================================
// SIDEBAR TOGGLE
// ==========================================================

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


// ==========================================================
// SIDEBAR OVERLAY
// ==========================================================

sidebarOverlay.addEventListener(

    "click",

    closeSidebar

);


// ==========================================================
// STAGE SELECTION
// ==========================================================

stageCards.forEach(

    (card) => {

        card.addEventListener(

            "click",

            () => {


                // ------------------------------------------
                // REMOVE PREVIOUS SELECTION
                // ------------------------------------------

                stageCards.forEach(

                    item =>

                        item.classList.remove(
                            "selected"
                        )

                );


                // ------------------------------------------
                // SELECT CURRENT CARD
                // ------------------------------------------

                card.classList.add(
                    "selected"
                );


                // ------------------------------------------
                // SAVE STAGE
                // ------------------------------------------

                selectedStage =
                    card.dataset.stage;


                // ------------------------------------------
                // ENABLE BUTTON
                // ------------------------------------------

                startCounselingBtn.disabled =
                    false;


                stageError.classList.add(
                    "hidden"
                );

            }

        );

    }

);


// ==========================================================
// START CAREER COUNSELING
// ==========================================================

startCounselingBtn.addEventListener(

    "click",

    () => {


        // --------------------------------------------------
        // VALIDATE STAGE
        // --------------------------------------------------

        if (
            !selectedStage
        ) {

            stageError.classList.remove(
                "hidden"
            );


            return;

        }


        // --------------------------------------------------
        // GET STAGE INFORMATION
        // --------------------------------------------------

        const stage =
            stageInformation[
                selectedStage
            ];


        if (
            !stage
        ) {

            stageError.textContent =
                "Invalid career stage selected.";


            stageError.classList.remove(
                "hidden"
            );


            return;

        }


        // --------------------------------------------------
        // RESET SESSION
        // --------------------------------------------------

        conversationHistory =
            [];


        chatMessages.innerHTML =
            "";


        hideChatError();


        // --------------------------------------------------
        // SET CURRENT STAGE BADGE
        // --------------------------------------------------

        currentStageBadge.textContent =
            stage.label;


        // --------------------------------------------------
        // HIDE STAGE SCREEN
        // --------------------------------------------------

        stageSelection.classList.add(
            "hidden"
        );


        // --------------------------------------------------
        // SHOW CHAT
        // --------------------------------------------------

        chatSection.classList.remove(
            "hidden"
        );


        // --------------------------------------------------
        // SHOW AI GREETING
        // --------------------------------------------------

        addMessage(

            "assistant",

            stage.greeting

        );


        // --------------------------------------------------
        // STORE STAGE CONTEXT
        //
        // This is passed to Gemini as conversation context.
        // It is NOT displayed as a user message.
        // --------------------------------------------------

        conversationHistory.push(

            {

                role:
                    "user",

                content:
                    stage.context

            }

        );


        // --------------------------------------------------
        // STORE AI GREETING
        // --------------------------------------------------

        conversationHistory.push(

            {

                role:
                    "assistant",

                content:
                    stage.greeting

            }

        );


        // --------------------------------------------------
        // SCROLL TO CHAT
        // --------------------------------------------------

        chatSection.scrollIntoView(

            {

                behavior:
                    "smooth",

                block:
                    "start"

            }

        );


        // --------------------------------------------------
        // FOCUS INPUT
        // --------------------------------------------------

        setTimeout(

            () => {

                messageInput.focus();

            },

            300

        );

    }

);


// ==========================================================
// CHANGE CAREER STAGE
// ==========================================================

changeStageBtn.addEventListener(

    "click",

    () => {


        // --------------------------------------------------
        // HIDE CHAT
        // --------------------------------------------------

        chatSection.classList.add(
            "hidden"
        );


        // --------------------------------------------------
        // SHOW STAGE SELECTION
        // --------------------------------------------------

        stageSelection.classList.remove(
            "hidden"
        );


        // --------------------------------------------------
        // RESET STATE
        // --------------------------------------------------

        selectedStage =
            null;


        conversationHistory =
            [];


        chatMessages.innerHTML =
            "";


        messageInput.value =
            "";


        hideChatError();


        // --------------------------------------------------
        // CLEAR SELECTED CARDS
        // --------------------------------------------------

        stageCards.forEach(

            card =>

                card.classList.remove(
                    "selected"
                )

        );


        // --------------------------------------------------
        // DISABLE START BUTTON
        // --------------------------------------------------

        startCounselingBtn.disabled =
            true;


        // --------------------------------------------------
        // SCROLL TO TOP
        // --------------------------------------------------

        stageSelection.scrollIntoView(

            {

                behavior:
                    "smooth",

                block:
                    "start"

            }

        );

    }

);


// ==========================================================
// ADD MESSAGE TO CHAT UI
// ==========================================================

function addMessage(

    role,

    content

) {


    // ------------------------------------------------------
    // CREATE MESSAGE ROW
    // ------------------------------------------------------

    const row =
        document.createElement(
            "div"
        );


    row.className =

        `message-row ${

            role === "user"

                ? "user"

                : "ai"

        }`;


    // ------------------------------------------------------
    // CREATE AVATAR
    // ------------------------------------------------------

    const avatar =
        document.createElement(
            "div"
        );


    avatar.className =

        `message-avatar ${

            role === "user"

                ? "user"

                : "ai"

        }`;


    avatar.textContent =

        role === "user"

            ? "U"

            : "✦";


    // ------------------------------------------------------
    // CREATE MESSAGE BUBBLE
    // ------------------------------------------------------

    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "message-bubble";


    // textContent is used intentionally.
    // This prevents generated AI text from injecting HTML.

    bubble.textContent =
        content;


    // ------------------------------------------------------
    // USER MESSAGE
    // ------------------------------------------------------

    if (
        role === "user"
    ) {

        row.appendChild(
            bubble
        );


        row.appendChild(
            avatar
        );

    }


    // ------------------------------------------------------
    // AI MESSAGE
    // ------------------------------------------------------

    else {

        row.appendChild(
            avatar
        );


        row.appendChild(
            bubble
        );

    }


    // ------------------------------------------------------
    // ADD TO CHAT
    // ------------------------------------------------------

    chatMessages.appendChild(
        row
    );


    scrollToBottom();

}


// ==========================================================
// SCROLL CHAT TO BOTTOM
// ==========================================================

function scrollToBottom() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// ==========================================================
// SHOW TYPING INDICATOR
// ==========================================================

function showTyping() {

    typingIndicator.classList.remove(
        "hidden"
    );

}


// ==========================================================
// HIDE TYPING INDICATOR
// ==========================================================

function hideTyping() {

    typingIndicator.classList.add(
        "hidden"
    );

}


// ==========================================================
// SHOW CHAT ERROR
// ==========================================================

function showChatError(
    message
) {

    chatError.textContent =
        message;


    chatError.classList.remove(
        "hidden"
    );

}


// ==========================================================
// HIDE CHAT ERROR
// ==========================================================

function hideChatError() {

    chatError.textContent =
        "";


    chatError.classList.add(
        "hidden"
    );

}


// ==========================================================
// SEND MESSAGE
// ==========================================================

chatForm.addEventListener(

    "submit",

    async (
        event
    ) => {


        // --------------------------------------------------
        // PREVENT PAGE REFRESH
        // --------------------------------------------------

        event.preventDefault();


        // --------------------------------------------------
        // PREVENT DOUBLE SEND
        // --------------------------------------------------

        if (
            isSending
        ) {

            return;

        }


        // --------------------------------------------------
        // GET MESSAGE
        // --------------------------------------------------

        const message =
            messageInput
                .value
                .trim();


        if (
            !message
        ) {

            return;

        }


        hideChatError();


        // --------------------------------------------------
        // COPY EXISTING HISTORY
        //
        // The current message is sent separately as
        // "message", so it is not included in this copy.
        // --------------------------------------------------

        const historyForRequest =
            [
                ...conversationHistory
            ];


        // --------------------------------------------------
        // SHOW USER MESSAGE
        // --------------------------------------------------

        addMessage(

            "user",

            message

        );


        // --------------------------------------------------
        // STORE USER MESSAGE LOCALLY
        // --------------------------------------------------

        conversationHistory.push(

            {

                role:
                    "user",

                content:
                    message

            }

        );


        // --------------------------------------------------
        // CLEAR INPUT
        // --------------------------------------------------

        messageInput.value =
            "";


        autoResizeTextarea();


        // --------------------------------------------------
        // LOCK INPUT
        // --------------------------------------------------

        isSending =
            true;


        sendMessageBtn.disabled =
            true;


        messageInput.disabled =
            true;


        // --------------------------------------------------
        // SHOW TYPING
        // --------------------------------------------------

        showTyping();


        try {


            // ==================================================
            // CALL FLASK BACKEND
            // ==================================================

            const response =
                await fetch(

                    CAREER_API_URL,

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
                                        message,


                                    history:
                                        historyForRequest

                                }

                            )

                    }

                );


            // ==================================================
            // READ JSON RESPONSE
            // ==================================================

            let result;


            try {

                result =
                    await response.json();

            }

            catch (
                error
            ) {

                throw new Error(

                    "The MindBridge backend returned an invalid response."

                );

            }


            // ==================================================
            // CHECK RESPONSE
            // ==================================================

            if (

                !response.ok

                ||

                !result.success

            ) {

                throw new Error(

                    result.error

                    ||

                    "Unable to get a response from the AI Career Counselor."

                );

            }


            // ==================================================
            // GET AI REPLY
            // ==================================================

            const reply =
                String(

                    result.reply
                    || ""

                ).trim();


            if (
                !reply
            ) {

                throw new Error(

                    "The AI Career Counselor returned an empty response."

                );

            }


            // ==================================================
            // DISPLAY AI REPLY
            // ==================================================

            addMessage(

                "assistant",

                reply

            );


            // ==================================================
            // SAVE AI REPLY TO HISTORY
            // ==================================================

            conversationHistory.push(

                {

                    role:
                        "assistant",

                    content:
                        reply

                }

            );

        }


        catch (
            error
        ) {

            console.error(

                "AI Career Counselor Error:",

                error

            );


            // --------------------------------------------------
            // REMOVE FAILED USER MESSAGE FROM HISTORY
            //
            // This allows the user to retry without the failed
            // message being duplicated in the conversation.
            // --------------------------------------------------

            if (

                conversationHistory.length > 0

                &&

                conversationHistory[
                    conversationHistory.length - 1
                ].role === "user"

                &&

                conversationHistory[
                    conversationHistory.length - 1
                ].content === message

            ) {

                conversationHistory.pop();

            }


            showChatError(

                error.message

                ||

                "Unable to connect to the MindBridge AI Career Counselor. "
                + "Make sure the Flask backend is running."

            );

        }


        finally {


            // --------------------------------------------------
            // HIDE TYPING
            // --------------------------------------------------

            hideTyping();


            // --------------------------------------------------
            // UNLOCK INPUT
            // --------------------------------------------------

            isSending =
                false;


            sendMessageBtn.disabled =
                false;


            messageInput.disabled =
                false;


            // --------------------------------------------------
            // FOCUS INPUT
            // --------------------------------------------------

            messageInput.focus();

        }

    }

);


// ==========================================================
// TEXTAREA AUTO RESIZE
// ==========================================================

function autoResizeTextarea() {

    messageInput.style.height =
        "auto";


    messageInput.style.height =

        `${

            Math.min(

                messageInput.scrollHeight,

                150

            )

        }px`;

}


// ==========================================================
// TEXTAREA INPUT EVENT
// ==========================================================

messageInput.addEventListener(

    "input",

    autoResizeTextarea

);


// ==========================================================
// ENTER TO SEND
//
// Enter = Send
// Shift + Enter = New line
// ==========================================================

messageInput.addEventListener(

    "keydown",

    (
        event
    ) => {


        if (

            event.key ===
                "Enter"

            &&

            !event.shiftKey

        ) {

            event.preventDefault();


            chatForm.requestSubmit();

        }

    }

);


// ==========================================================
// CLOSE MOBILE SIDEBAR AFTER NAVIGATION
// ==========================================================

const sidebarLinks =
    document.querySelectorAll(
        ".sidebar-link"
    );


sidebarLinks.forEach(

    (
        link
    ) => {

        link.addEventListener(

            "click",

            () => {

                if (
                    window.innerWidth <=
                    900
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
            window.innerWidth >
            900
        ) {

            closeSidebar();

        }

    }

);


// ==========================================================
// READY
// ==========================================================

console.log(

    "MindBridge AI Career Counselor UI loaded."

);