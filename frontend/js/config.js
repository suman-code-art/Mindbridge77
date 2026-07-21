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
// Replace DEPLOYED_API_URL with your real backend URL
// after we deploy Flask.
//
// IMPORTANT:
// Never place Gemini API keys in this file.
// ==========================================================


// ==========================================================
// DEPLOYED BACKEND URL
// ==========================================================
//
// We will replace this after deploying the backend.
//
// Example:
// https://mindbridge-backend.onrender.com
//
// ==========================================================

const DEPLOYED_API_URL = "https://mindbridge77-3.onrender.com";


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


    // Stress analysis

    analyzeStress:
        `${API_BASE_URL}/api/analyze-stress`,


    // Camera expression analysis

    analyzeExpression:
        `${API_BASE_URL}/api/analyze-expression`


};


// ==========================================================
// DEBUG
// ==========================================================

console.log(
    "MindBridge API:",
    API_BASE_URL
);