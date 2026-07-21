// ==========================================================
// MINDBRIDGE - FRONTEND CONFIGURATION
// File: frontend/js/config.js
// ==========================================================
//
// This file manages the Flask backend URL.
//
// LOCAL:
// http://127.0.0.1:5000
//
// DEPLOYMENT:
// https://mindbridge77-3.onrender.com
//
// IMPORTANT:
// Never place Gemini API keys in this file.
// ==========================================================


// ==========================================================
// DEPLOYED BACKEND URL
// ==========================================================

const DEPLOYED_API_URL =
    "https://mindbridge77-3.onrender.com";


// ==========================================================
// DETECT LOCAL DEVELOPMENT
// ==========================================================

const isLocalDevelopment =

    window.location.hostname === "127.0.0.1" ||

    window.location.hostname === "localhost";


// ==========================================================
// BACKEND API BASE URL
// ==========================================================

export const API_BASE_URL =

    isLocalDevelopment

        ? "http://127.0.0.1:5000"

        : DEPLOYED_API_URL;


// ==========================================================
// API ENDPOINTS
// ==========================================================

export const API_ENDPOINTS = {


    // Backend health check

    health:
        `${API_BASE_URL}/api/health`,


    // Gemini support chat

    chat:
        `${API_BASE_URL}/api/chat`,


    // Gemini stress question generation

    generateStressQuestions:
        `${API_BASE_URL}/api/generate-stress-questions`,


    // Stress questionnaire analysis

    analyzeStress:
        `${API_BASE_URL}/api/analyze-stress`


};


// ==========================================================
// DEBUG
// ==========================================================

console.log(
    "MindBridge API:",
    API_BASE_URL
);