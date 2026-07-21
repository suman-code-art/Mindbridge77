// ==========================================================
// MINDBRIDGE - MAIN APPLICATION JAVASCRIPT
// File: frontend/js/app.js
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    // ======================================================
    // GET HTML ELEMENTS
    // ======================================================

    const menuButton = document.getElementById("menuButton");
    const navLinks = document.getElementById("navLinks");

    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const getStartedBtn = document.getElementById("getStartedBtn");
    const ctaSignupBtn = document.getElementById("ctaSignupBtn");

    const currentYear = document.getElementById("currentYear");


    // ======================================================
    // CURRENT YEAR
    // ======================================================

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    // ======================================================
    // MOBILE NAVIGATION
    // ======================================================

    if (menuButton && navLinks) {

        menuButton.addEventListener("click", () => {

            navLinks.classList.toggle("mobile-open");

        });


        // Close mobile menu after clicking a navigation link
        const navigationLinks = navLinks.querySelectorAll("a");

        navigationLinks.forEach((link) => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("mobile-open");

            });

        });

    }


    // ======================================================
    // LOGIN BUTTON
    // ======================================================

    if (loginBtn) {

        loginBtn.addEventListener("click", () => {

            window.location.href = "pages/login.html";

        });

    }


    // ======================================================
    // CREATE ACCOUNT BUTTON
    // ======================================================

    if (signupBtn) {

        signupBtn.addEventListener("click", () => {

            window.location.href = "pages/signup.html";

        });

    }


    // ======================================================
    // GET STARTED BUTTON
    // ======================================================

    if (getStartedBtn) {

        getStartedBtn.addEventListener("click", () => {

            window.location.href = "pages/signup.html";

        });

    }


    // ======================================================
    // BOTTOM CREATE ACCOUNT BUTTON
    // ======================================================

    if (ctaSignupBtn) {

        ctaSignupBtn.addEventListener("click", () => {

            window.location.href = "pages/signup.html";

        });

    }


    // ======================================================
    // CAREER EXPLORER BUTTONS
    // ======================================================
    // These buttons will later open career-details.html
    // with information about the selected career.
    //
    // For now, they redirect users to the Career Explorer
    // page if that page has already been created.
    // ======================================================

    const careerButtons = document.querySelectorAll(".text-button");

    careerButtons.forEach((button) => {

        button.addEventListener("click", () => {

            window.location.href =
                "pages/career-explorer.html";

        });

    });


    // ======================================================
    // FLASK BACKEND HEALTH CHECK
    // ======================================================
    //
    // This checks whether:
    //
    // Frontend
    //    ↓
    // Flask Backend
    //    ↓
    // /api/health
    //
    // is working correctly.
    //
    // The result will appear in the browser console.
    // ======================================================

    async function checkBackendHealth() {

        try {

            console.log(
                "Checking MindBridge backend connection..."
            );


            // Make sure CONFIG exists
            if (
                typeof CONFIG === "undefined" ||
                !CONFIG.API_BASE_URL
            ) {

                console.error(
                    "MindBridge configuration error: " +
                    "API_BASE_URL is not defined."
                );

                return;

            }


            // Send request to Flask
            const response = await fetch(
                `${CONFIG.API_BASE_URL}/api/health`
            );


            // Check HTTP response
            if (!response.ok) {

                throw new Error(
                    `Backend returned HTTP status ${response.status}`
                );

            }


            // Convert JSON response
            const data = await response.json();


            // Display success response
            console.log(
                "MindBridge Backend Response:",
                data
            );


            if (data.success) {

                console.log(
                    "Frontend → Flask connection is working."
                );

            }


            // Check Gemini configuration if the backend
            // already includes this property.
            if (
                Object.prototype.hasOwnProperty.call(
                    data,
                    "gemini_configured"
                )
            ) {

                if (data.gemini_configured) {

                    console.log(
                        "Gemini API configuration detected."
                    );

                } else {

                    console.warn(
                        "Gemini API key is not configured yet."
                    );

                }

            }

        } catch (error) {

            console.error(
                "Unable to connect to the MindBridge backend."
            );

            console.error(
                "Error details:",
                error
            );


            console.info(
                "Make sure Flask is running with: python app.py"
            );

        }

    }


    // ======================================================
    // RUN BACKEND CONNECTION TEST
    // ======================================================

    checkBackendHealth();

});