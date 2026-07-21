// ==========================================================
// MINDBRIDGE - EMERGENCY SUPPORT
// File: frontend/js/emergency.js
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

    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



// ==========================================================
// CURRENT USER
// ==========================================================

let currentUser =
    null;



// ==========================================================
// PAGE ELEMENTS
// ==========================================================

const authLoading =
    document.getElementById(
        "authLoading"
    );


const emergencyApp =
    document.getElementById(
        "emergencyApp"
    );



// ==========================================================
// USER ELEMENTS
// ==========================================================

const userName =
    document.getElementById(
        "userName"
    );


const userEmail =
    document.getElementById(
        "userEmail"
    );


const userAvatar =
    document.getElementById(
        "userAvatar"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );



// ==========================================================
// SIDEBAR
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
// GROUNDING
// ==========================================================

const groundingButton =
    document.getElementById(
        "groundingButton"
    );


const startGroundingBtn =
    document.getElementById(
        "startGroundingBtn"
    );


const groundingSection =
    document.getElementById(
        "groundingSection"
    );


const closeGroundingBtn =
    document.getElementById(
        "closeGroundingBtn"
    );



// ==========================================================
// TRUSTED CONTACTS
// ==========================================================

const showTrustedContactsBtn =
    document.getElementById(
        "showTrustedContactsBtn"
    );


const trustedContactsSection =
    document.getElementById(
        "trustedContactsSection"
    );


const trustedContactForm =
    document.getElementById(
        "trustedContactForm"
    );


const contactName =
    document.getElementById(
        "contactName"
    );


const contactPhone =
    document.getElementById(
        "contactPhone"
    );


const trustedContactsList =
    document.getElementById(
        "trustedContactsList"
    );



// ==========================================================
// GET DISPLAY NAME
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
                    character.toUpperCase()

            );

    }


    return "MindBridge User";

}



// ==========================================================
// AUTHENTICATION STATE
// ==========================================================

onAuthStateChanged(

    auth,

    async (
        user
    ) => {


        // ==================================================
        // NOT LOGGED IN
        // ==================================================

        if (
            !user
        ) {


            window.location.replace(
                "./login.html"
            );


            return;

        }



        // ==================================================
        // SAVE CURRENT USER
        // ==================================================

        currentUser =
            user;



        // ==================================================
        // USER INFORMATION
        // ==================================================

        const name =
            getDisplayName(
                user
            );


        const email =
            user.email ||
            "";


        const initial =
            name
                .charAt(0)
                .toUpperCase();



        // ==================================================
        // UPDATE UI
        // ==================================================

        if (
            userName
        ) {

            userName.textContent =
                name;

        }


        if (
            userEmail
        ) {

            userEmail.textContent =
                email;

        }


        if (
            userAvatar
        ) {

            userAvatar.textContent =
                initial;

        }



        // ==================================================
        // SHOW APPLICATION
        // ==================================================

        if (
            authLoading
        ) {

            authLoading.style.display =
                "none";

        }


        if (
            emergencyApp
        ) {

            emergencyApp.classList.remove(
                "hidden"
            );

        }



        // ==================================================
        // LOAD USER'S TRUSTED CONTACTS
        // ==================================================

        await loadTrustedContacts();


        console.log(
            "MindBridge Emergency Support loaded for:",
            user.uid
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


            logoutBtn.disabled =
                true;


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


            logoutBtn.disabled =
                false;


            alert(
                "Unable to log out. Please try again."
            );


        }


    }

);



// ==========================================================
// OPEN SIDEBAR
// ==========================================================

function openSidebar() {


    sidebar?.classList.add(
        "mobile-open"
    );


    sidebarOverlay?.classList.add(
        "active"
    );


}



// ==========================================================
// CLOSE SIDEBAR
// ==========================================================

function closeSidebar() {


    sidebar?.classList.remove(
        "mobile-open"
    );


    sidebarOverlay?.classList.remove(
        "active"
    );


}



// ==========================================================
// SIDEBAR TOGGLE
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
// CLOSE SIDEBAR ON MOBILE LINK CLICK
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
                    800

                ) {


                    closeSidebar();


                }


            }

        );


    }

);



// ==========================================================
// OPEN GROUNDING EXERCISE
// ==========================================================

function openGroundingExercise() {


    if (
        !groundingSection
    ) {

        return;

    }


    groundingSection.classList.remove(
        "hidden"
    );


    groundingSection.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });


}



// ==========================================================
// HERO GROUNDING BUTTON
// ==========================================================

groundingButton?.addEventListener(

    "click",

    openGroundingExercise

);



// ==========================================================
// SUPPORT CARD GROUNDING BUTTON
// ==========================================================

startGroundingBtn?.addEventListener(

    "click",

    openGroundingExercise

);



// ==========================================================
// CLOSE GROUNDING
// ==========================================================

closeGroundingBtn?.addEventListener(

    "click",

    () => {


        groundingSection?.classList.add(
            "hidden"
        );


    }

);



// ==========================================================
// VIEW TRUSTED CONTACTS
// ==========================================================

showTrustedContactsBtn?.addEventListener(

    "click",

    () => {


        trustedContactsSection
            ?.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });


    }

);



// ==========================================================
// TRUSTED CONTACTS FIRESTORE STRUCTURE
// ==========================================================
//
// users
//   └── USER_UID
//        └── trustedContacts
//             ├── CONTACT_DOCUMENT_ID
//             │      ├── name
//             │      ├── phone
//             │      └── createdAt
//             │
//             └── CONTACT_DOCUMENT_ID
//
//
// Each logged-in user therefore gets
// their own trusted contact collection.
//
// ==========================================================



// ==========================================================
// GET TRUSTED CONTACT COLLECTION
// ==========================================================

function getTrustedContactsCollection() {


    if (
        !currentUser
    ) {

        return null;

    }


    return collection(

        db,

        "users",

        currentUser.uid,

        "trustedContacts"

    );


}



// ==========================================================
// SAVE TRUSTED CONTACT
// ==========================================================

trustedContactForm?.addEventListener(

    "submit",

    async (
        event
    ) => {


        event.preventDefault();



        // ==================================================
        // CHECK USER
        // ==================================================

        if (
            !currentUser
        ) {


            alert(
                "Please log in before saving a trusted contact."
            );


            return;

        }



        // ==================================================
        // GET VALUES
        // ==================================================

        const name =
            contactName
                ?.value
                .trim();


        const phone =
            contactPhone
                ?.value
                .trim();



        // ==================================================
        // VALIDATION
        // ==================================================

        if (

            !name ||

            !phone

        ) {


            alert(
                "Please enter both a name and phone number."
            );


            return;

        }



        try {


            // ==============================================
            // SAVE TO FIRESTORE
            // ==============================================

            const contactsCollection =
                getTrustedContactsCollection();


            await addDoc(

                contactsCollection,

                {

                    name:
                        name,

                    phone:
                        phone,

                    createdAt:
                        serverTimestamp()

                }

            );



            // ==============================================
            // CLEAR FORM
            // ==============================================

            trustedContactForm.reset();



            // ==============================================
            // RELOAD CONTACT LIST
            // ==============================================

            await loadTrustedContacts();



            console.log(
                "Trusted contact saved."
            );


        }


        catch (
            error
        ) {


            console.error(

                "Error saving trusted contact:",

                error

            );


            alert(
                "Unable to save the trusted contact."
            );


        }


    }

);



// ==========================================================
// LOAD TRUSTED CONTACTS
// ==========================================================

async function loadTrustedContacts() {


    if (

        !currentUser ||

        !trustedContactsList

    ) {

        return;

    }



    try {


        // ==================================================
        // COLLECTION REFERENCE
        // ==================================================

        const contactsCollection =
            getTrustedContactsCollection();



        // ==================================================
        // QUERY
        // ==================================================

        const contactsQuery =
            query(

                contactsCollection,

                orderBy(
                    "createdAt",
                    "desc"
                )

            );



        // ==================================================
        // GET DOCUMENTS
        // ==================================================

        const snapshot =
            await getDocs(
                contactsQuery
            );



        // ==================================================
        // CLEAR LIST
        // ==================================================

        trustedContactsList.innerHTML =
            "";



        // ==================================================
        // NO CONTACTS
        // ==================================================

        if (
            snapshot.empty
        ) {


            trustedContactsList.innerHTML = `

                <p class="empty-contacts">

                    You have not saved any trusted contacts yet.

                </p>

            `;


            return;

        }



        // ==================================================
        // DISPLAY CONTACTS
        // ==================================================

        snapshot.forEach(

            (
                contactDocument
            ) => {


                const data =
                    contactDocument.data();


                const contactElement =
                    document.createElement(
                        "div"
                    );


                contactElement.className =
                    "contact-item";



                // ==========================================
                // CONTACT INFORMATION
                // ==========================================

                const infoElement =
                    document.createElement(
                        "div"
                    );


                infoElement.className =
                    "contact-info";


                const nameElement =
                    document.createElement(
                        "strong"
                    );


                nameElement.textContent =
                    data.name ||
                    "Trusted Contact";


                const phoneElement =
                    document.createElement(
                        "span"
                    );


                phoneElement.textContent =
                    data.phone ||
                    "";


                infoElement.appendChild(
                    nameElement
                );


                infoElement.appendChild(
                    phoneElement
                );



                // ==========================================
                // ACTIONS
                // ==========================================

                const actionsElement =
                    document.createElement(
                        "div"
                    );


                actionsElement.className =
                    "contact-actions";



                // ==========================================
                // CALL BUTTON
                // ==========================================

                const callLink =
                    document.createElement(
                        "a"
                    );


                callLink.className =
                    "contact-call";


                callLink.textContent =
                    "Call";


                callLink.href =
                    `tel:${data.phone}`;



                // ==========================================
                // DELETE BUTTON
                // ==========================================

                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.type =
                    "button";


                deleteButton.className =
                    "contact-delete";


                deleteButton.textContent =
                    "Delete";



                // ==========================================
                // DELETE EVENT
                // ==========================================

                deleteButton.addEventListener(

                    "click",

                    async () => {


                        await deleteTrustedContact(

                            contactDocument.id

                        );


                    }

                );



                // ==========================================
                // BUILD ACTIONS
                // ==========================================

                actionsElement.appendChild(
                    callLink
                );


                actionsElement.appendChild(
                    deleteButton
                );



                // ==========================================
                // BUILD CONTACT
                // ==========================================

                contactElement.appendChild(
                    infoElement
                );


                contactElement.appendChild(
                    actionsElement
                );



                // ==========================================
                // ADD TO PAGE
                // ==========================================

                trustedContactsList.appendChild(
                    contactElement
                );


            }

        );


    }


    catch (
        error
    ) {


        console.error(

            "Error loading trusted contacts:",

            error

        );


        trustedContactsList.innerHTML = `

            <p class="empty-contacts">

                Unable to load trusted contacts.

            </p>

        `;


    }


}



// ==========================================================
// DELETE TRUSTED CONTACT
// ==========================================================

async function deleteTrustedContact(
    contactId
) {


    if (
        !currentUser
    ) {

        return;

    }



    const shouldDelete =
        window.confirm(

            "Remove this trusted contact?"

        );



    if (
        !shouldDelete
    ) {

        return;

    }



    try {


        // ==================================================
        // DOCUMENT REFERENCE
        // ==================================================

        const contactRef =
            doc(

                db,

                "users",

                currentUser.uid,

                "trustedContacts",

                contactId

            );



        // ==================================================
        // DELETE
        // ==================================================

        await deleteDoc(
            contactRef
        );



        // ==================================================
        // REFRESH CONTACT LIST
        // ==================================================

        await loadTrustedContacts();



        console.log(
            "Trusted contact deleted."
        );


    }


    catch (
        error
    ) {


        console.error(

            "Error deleting trusted contact:",

            error

        );


        alert(
            "Unable to delete the trusted contact."
        );


    }


}



// ==========================================================
// WINDOW RESIZE
// ==========================================================

window.addEventListener(

    "resize",

    () => {


        if (

            window.innerWidth >
            800

        ) {


            closeSidebar();


        }


    }

);



// ==========================================================
// PAGE READY
// ==========================================================

console.log(
    "MindBridge Emergency Support JS loaded."
);