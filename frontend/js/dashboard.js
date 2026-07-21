// ==========================================================
// MINDBRIDGE - DASHBOARD
// File: frontend/js/dashboard.js
// ==========================================================


// ==========================================================
// FIREBASE CONFIG
// ==========================================================

import {
    auth,
    db
} from "../../firebase/firebase-config.js";


// ==========================================================
// FIREBASE AUTHENTICATION
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
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



// ==========================================================
// MAIN PAGE ELEMENTS
// ==========================================================

const authLoading =
    document.getElementById(
        "authLoading"
    );


const dashboardApp =
    document.getElementById(
        "dashboardApp"
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
// USER INFORMATION ELEMENTS
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


const headerUserName =
    document.getElementById(
        "headerUserName"
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



// ==========================================================
// LOGOUT BUTTON
// ==========================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );



// ==========================================================
// DASHBOARD STATISTICS ELEMENTS
// ==========================================================

const latestMood =
    document.getElementById(
        "latestMood"
    );


const activitiesCompleted =
    document.getElementById(
        "activitiesCompleted"
    );


const wellnessMinutes =
    document.getElementById(
        "wellnessMinutes"
    );



// ==========================================================
// DEFAULT DASHBOARD VALUES
// ==========================================================

if (
    latestMood
) {

    latestMood.textContent =
        "Not checked in";

}


if (
    activitiesCompleted
) {

    activitiesCompleted.textContent =
        "0";

}


if (
    wellnessMinutes
) {

    wellnessMinutes.textContent =
        "0";

}



// ==========================================================
// GET DISPLAY NAME
// ==========================================================
//
// Firebase normally provides displayName.
//
// If displayName is unavailable,
// create a readable name from the email.
//
// Example:
//
// suman.tripathi@gmail.com
//
// becomes:
//
// Suman Tripathi
//
// ==========================================================

function getDisplayName(
    user
) {


    // ======================================================
    // FIREBASE DISPLAY NAME
    // ======================================================

    if (
        user.displayName
    ) {

        return user.displayName;

    }



    // ======================================================
    // CREATE NAME FROM EMAIL
    // ======================================================

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



    // ======================================================
    // FALLBACK NAME
    // ======================================================

    return "MindBridge User";

}



// ==========================================================
// LOAD DASHBOARD WELLNESS STATISTICS
// ==========================================================
//
// FIRESTORE STRUCTURE:
//
// users
//   └── USER_UID
//        └── wellness
//             └── stats
//                  ├── activitiesCompleted
//                  ├── wellnessMinutes
//                  ├── recentActivity
//                  └── updatedAt
//
//
// IMPORTANT:
//
// Every Firebase user has a unique UID.
//
// User A:
//
// users/USER_A_UID/wellness/stats
//
//
// User B:
//
// users/USER_B_UID/wellness/stats
//
//
// Therefore each user's wellness statistics
// remain separate.
//
// This version uses CUMULATIVE statistics.
//
// The values DO NOT automatically reset daily.
//
// ==========================================================

async function loadDashboardWellnessStats(
    user
) {


    // ======================================================
    // CHECK AUTHENTICATED USER
    // ======================================================

    if (
        !user
    ) {


        console.warn(
            "Cannot load wellness statistics: no authenticated user."
        );


        return;

    }



    try {


        console.log(
            "Loading MindBridge wellness statistics."
        );


        console.log(
            "Firebase UID:",
            user.uid
        );



        // ==================================================
        // CREATE FIRESTORE REFERENCE
        // ==================================================
        //
        // users/{uid}/wellness/stats
        //
        // ==================================================

        const wellnessRef =
            doc(

                db,

                "users",

                user.uid,

                "wellness",

                "stats"

            );



        // ==================================================
        // READ FIRESTORE DOCUMENT
        // ==================================================

        const wellnessSnapshot =
            await getDoc(
                wellnessRef
            );



        // ==================================================
        // WELLNESS DATA EXISTS
        // ==================================================

        if (
            wellnessSnapshot.exists()
        ) {


            const data =
                wellnessSnapshot.data();



            // ==============================================
            // ACTIVITIES COMPLETED
            // ==============================================

            const totalActivities =
                Number(
                    data.activitiesCompleted
                ) ||
                0;



            // ==============================================
            // WELLNESS MINUTES
            // ==============================================

            const totalMinutes =
                Number(
                    data.wellnessMinutes
                ) ||
                0;



            // ==============================================
            // UPDATE ACTIVITIES UI
            // ==============================================

            if (
                activitiesCompleted
            ) {

                activitiesCompleted.textContent =
                    totalActivities;

            }



            // ==============================================
            // UPDATE WELLNESS MINUTES UI
            // ==============================================

            if (
                wellnessMinutes
            ) {

                wellnessMinutes.textContent =
                    totalMinutes;

            }



            // ==============================================
            // DEBUG INFORMATION
            // ==============================================

            console.log(

                "Dashboard wellness statistics loaded:",

                {

                    activitiesCompleted:
                        totalActivities,

                    wellnessMinutes:
                        totalMinutes,

                    recentActivity:
                        data.recentActivity ||
                        null

                }

            );


        }



        // ==================================================
        // NO WELLNESS DATA
        // ==================================================
        //
        // This usually means the user has never completed
        // a wellness activity.
        //
        // ==================================================

        else {


            console.log(
                "No wellness statistics found for this user."
            );



            // ==============================================
            // ACTIVITIES → 0
            // ==============================================

            if (
                activitiesCompleted
            ) {

                activitiesCompleted.textContent =
                    "0";

            }



            // ==============================================
            // WELLNESS MINUTES → 0
            // ==============================================

            if (
                wellnessMinutes
            ) {

                wellnessMinutes.textContent =
                    "0";

            }


        }


    }



    // ======================================================
    // FIRESTORE ERROR
    // ======================================================

    catch (
        error
    ) {


        console.error(

            "Error loading dashboard wellness statistics:",

            error

        );



        // ==================================================
        // SAFE FALLBACK
        // ==================================================
        //
        // Firestore errors should never stop the dashboard
        // from loading.
        //
        // ==================================================

        if (
            activitiesCompleted
        ) {

            activitiesCompleted.textContent =
                "0";

        }


        if (
            wellnessMinutes
        ) {

            wellnessMinutes.textContent =
                "0";

        }


    }

}



// ==========================================================
// FIREBASE AUTHENTICATION STATE
// ==========================================================
//
// This checks whether the user is logged in.
//
// Logged in:
//
// Firebase User
//      ↓
// Get UID
//      ↓
// Personalize dashboard
//      ↓
// Load user's Firestore wellness statistics
//
//
// Not logged in:
//
// Redirect → login.html
//
// ==========================================================

onAuthStateChanged(

    auth,

    async (
        user
    ) => {



        // ==================================================
        // USER NOT LOGGED IN
        // ==================================================

        if (
            !user
        ) {


            console.log(
                "No authenticated user. Redirecting to login."
            );


            window.location.replace(
                "./login.html"
            );


            return;

        }



        // ==================================================
        // USER LOGGED IN
        // ==================================================

        console.log(
            "MindBridge authenticated user:",
            user.uid
        );



        // ==================================================
        // GET USER DISPLAY INFORMATION
        // ==================================================

        const name =
            getDisplayName(
                user
            );


        const firstName =
            name
                .split(" ")[0];


        const email =
            user.email ||
            "";


        const initial =
            firstName

                .charAt(0)

                .toUpperCase();



        // ==================================================
        // SIDEBAR USER NAME
        // ==================================================

        if (
            sidebarUserName
        ) {

            sidebarUserName.textContent =
                name;

        }



        // ==================================================
        // SIDEBAR USER EMAIL
        // ==================================================

        if (
            sidebarUserEmail
        ) {

            sidebarUserEmail.textContent =
                email;

        }



        // ==================================================
        // SIDEBAR USER AVATAR
        // ==================================================

        if (
            sidebarAvatar
        ) {

            sidebarAvatar.textContent =
                initial;

        }



        // ==================================================
        // HEADER FIRST NAME
        // ==================================================

        if (
            headerUserName
        ) {

            headerUserName.textContent =
                firstName;

        }



        // ==================================================
        // HEADER FULL NAME
        // ==================================================

        if (
            headerFullName
        ) {

            headerFullName.textContent =
                name;

        }



        // ==================================================
        // HEADER EMAIL
        // ==================================================

        if (
            headerEmail
        ) {

            headerEmail.textContent =
                email;

        }



        // ==================================================
        // HEADER AVATAR
        // ==================================================

        if (
            headerAvatar
        ) {

            headerAvatar.textContent =
                initial;

        }



        // ==================================================
        // SHOW DASHBOARD
        // ==================================================
        //
        // IMPORTANT:
        //
        // Show the dashboard BEFORE Firestore loading.
        //
        // This ensures a Firestore problem does not block
        // the dashboard interface.
        //
        // ==================================================

        if (
            authLoading
        ) {

            authLoading.style.display =
                "none";

        }


        if (
            dashboardApp
        ) {

            dashboardApp.classList.remove(
                "hidden"
            );

        }



        console.log(
            "MindBridge dashboard loaded successfully."
        );



        // ==================================================
        // LOAD USER'S WELLNESS STATISTICS
        // ==================================================

        await loadDashboardWellnessStats(
            user
        );


    }

);



// ==========================================================
// LOGOUT
// ==========================================================

logoutBtn?.addEventListener(

    "click",

    async () => {


        try {


            console.log(
                "Logging out of MindBridge..."
            );



            // ==============================================
            // DISABLE BUTTON
            // ==============================================

            logoutBtn.disabled =
                true;



            // ==============================================
            // FIREBASE SIGN OUT
            // ==============================================

            await signOut(
                auth
            );



            console.log(
                "MindBridge logout successful."
            );



            // ==============================================
            // REDIRECT TO LOGIN
            // ==============================================

            window.location.replace(
                "./login.html"
            );


        }



        catch (
            error
        ) {


            console.error(

                "MindBridge logout error:",

                error

            );



            // ==============================================
            // ENABLE BUTTON AGAIN
            // ==============================================

            logoutBtn.disabled =
                false;



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


    if (
        sidebar
    ) {

        sidebar.classList.add(
            "mobile-open"
        );

    }



    if (
        sidebarOverlay
    ) {

        sidebarOverlay.classList.add(
            "active"
        );

    }


}



// ==========================================================
// CLOSE MOBILE SIDEBAR
// ==========================================================

function closeSidebar() {


    if (
        sidebar
    ) {

        sidebar.classList.remove(
            "mobile-open"
        );

    }



    if (
        sidebarOverlay
    ) {

        sidebarOverlay.classList.remove(
            "active"
        );

    }


}



// ==========================================================
// SIDEBAR TOGGLE BUTTON
// ==========================================================

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



// ==========================================================
// SIDEBAR OVERLAY
// ==========================================================

sidebarOverlay?.addEventListener(

    "click",

    closeSidebar

);



// ==========================================================
// SIDEBAR NAVIGATION LINKS
// ==========================================================
//
// Close sidebar automatically when a link
// is selected on mobile.
//
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
//
// If the browser changes from mobile to desktop,
// remove the mobile sidebar state.
//
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
// DASHBOARD READY
// ==========================================================

console.log(
    "MindBridge Dashboard JS loaded successfully."
);