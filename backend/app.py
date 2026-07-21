# ==========================================================
# MINDBRIDGE - COMPLETE FLASK BACKEND
# File: backend/app.py
# ==========================================================

import os
import traceback
import base64
import json

import cv2
import numpy as np
from deepface import DeepFace

import joblib
import pandas as pd

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai


# ==========================================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================================

load_dotenv()


# ==========================================================
# CREATE FLASK APPLICATION
# ==========================================================

app = Flask(__name__)


# ==========================================================
# ENABLE CORS
# ==========================================================

CORS(app)


# ==========================================================
# GEMINI CONFIGURATION
# ==========================================================

gemini_api_key = os.getenv("GEMINI_API_KEY")

gemini_client = None


if gemini_api_key:

    try:

        gemini_client = genai.Client(
            api_key=gemini_api_key
        )

        print(
            "Gemini client configured successfully."
        )

    except Exception as error:

        print(
            "Gemini configuration error:",
            str(error)
        )

else:

    print(
        "WARNING: GEMINI_API_KEY was not found."
    )


# ==========================================================
# STREAM MODEL CONFIGURATION
# ==========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


STREAM_MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "stream_model.joblib"
)


stream_model = None


try:

    if os.path.exists(
        STREAM_MODEL_PATH
    ):

        stream_model = joblib.load(
            STREAM_MODEL_PATH
        )

        print(
            "Stream recommendation model loaded successfully."
        )

    else:

        print(
            "WARNING: Stream model was not found at:"
        )

        print(
            STREAM_MODEL_PATH
        )


except Exception as error:

    print(
        "Stream model loading error:",
        str(error)
    )


# ==========================================================
# STREAM MODEL FEATURES
# ==========================================================
#
# IMPORTANT:
#
# These must match the EXACT features and order used when
# training your stream_model.joblib model.
#
# Based on the dataset/model we created earlier, the model
# uses these 15 input features.
#
# ==========================================================

STREAM_FEATURES = [

    "math_score",

    "science_score",

    "english_score",

    "social_science_score",

    "math_interest",

    "biology_interest",

    "technology_interest",

    "business_interest",

    "finance_interest",

    "humanities_interest",

    "logical_reasoning",

    "problem_solving",

    "creativity",

    "communication",

    "research_interest"

]


# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health_check():

    return jsonify(
        {
            "success": True,

            "message":
                "MindBridge backend is running.",

            "gemini_available":
                gemini_client is not None,

            "stream_model_available":
                stream_model is not None
        }
    ), 200


# ==========================================================
# MENTAL WELLNESS AI CHAT
# ==========================================================

@app.route(
    "/api/chat",
    methods=["POST"]
)
def chat():

    try:

        # --------------------------------------------------
        # Check Gemini
        # --------------------------------------------------

        if gemini_client is None:

            return jsonify(
                {
                    "success": False,
                    "error":
                        "Gemini API is not configured."
                }
            ), 500


        # --------------------------------------------------
        # Read request
        # --------------------------------------------------

        data = request.get_json(
            silent=True
        )


        if not data:

            return jsonify(
                {
                    "success": False,
                    "error":
                        "Request body must contain JSON."
                }
            ), 400


        # --------------------------------------------------
        # Get message
        # --------------------------------------------------

        message = str(
            data.get(
                "message",
                ""
            )
        ).strip()


        if not message:

            return jsonify(
                {
                    "success": False,
                    "error":
                        "Please enter a message."
                }
            ), 400


        if len(message) > 5000:

            return jsonify(
                {
                    "success": False,
                    "error":
                        "Message is too long."
                }
            ), 400


        # --------------------------------------------------
        # Wellness prompt
        # --------------------------------------------------

        prompt = f"""
You are MindBridge AI, a supportive AI assistant inside the
MindBridge career and mental wellness application.

Your role in this endpoint is general emotional wellness
support.

Guidelines:

- Respond with empathy, respect and practical suggestions.

- Keep responses clear and conversational.

- Do not claim to be a doctor or therapist.

- Do not diagnose medical or mental health conditions.

- Do not present wellness suggestions as medical treatment.

- If the user appears to be in immediate danger or considering
  self-harm, encourage them to contact local emergency services
  or an appropriate crisis support service and reach out to a
  trusted person nearby.

- Do not pretend that AI support replaces professional care.

- Career guidance is handled by a separate MindBridge feature.


User message:

{message}
"""


        # --------------------------------------------------
        # Gemini request
        # --------------------------------------------------

        response = (
            gemini_client
            .models
            .generate_content(

                model=
                    "gemini-3.5-flash",

                contents=
                    prompt

            )
        )


        reply = response.text


        if not reply:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "Gemini returned an empty response."
                }
            ), 502


        return jsonify(
            {
                "success": True,
                "reply": reply
            }
        ), 200


    except Exception as error:

        print(
            "Gemini Wellness Chat Error:",
            str(error)
        )


        traceback.print_exc()


        return jsonify(
            {
                "success": False,

                "error":
                    "MindBridge AI is temporarily unavailable. "
                    "Please try again."
            }
        ), 500


# ==========================================================
# AI CAREER COUNSELOR
# ==========================================================
#
# This endpoint supports:
#
# - School students
# - Class 10 students
# - Class 11-12 students
# - College students
# - Graduates
# - Postgraduates
# - Working professionals
# - Career changers
#
# ==========================================================

@app.route(
    "/api/career-chat",
    methods=["POST"]
)
def career_chat():

    try:

        # ==================================================
        # CHECK GEMINI
        # ==================================================

        if gemini_client is None:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "Gemini API is not configured."
                }
            ), 500


        # ==================================================
        # READ REQUEST
        # ==================================================

        data = request.get_json(
            silent=True
        )


        if not data:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "Request body must contain JSON."
                }
            ), 400


        # ==================================================
        # GET CURRENT MESSAGE
        # ==================================================

        message = str(
            data.get(
                "message",
                ""
            )
        ).strip()


        if not message:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "Please enter a message."
                }
            ), 400


        if len(message) > 5000:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "Message is too long."
                }
            ), 400


        # ==================================================
        # GET CONVERSATION HISTORY
        # ==================================================

        history = data.get(
            "history",
            []
        )


        if not isinstance(
            history,
            list
        ):

            history = []


        # Only use recent messages to prevent
        # unnecessarily large prompts.

        history = history[-20:]


        # ==================================================
        # FORMAT HISTORY
        # ==================================================

        conversation_text = ""


        for item in history:

            if not isinstance(
                item,
                dict
            ):

                continue


            role = str(
                item.get(
                    "role",
                    ""
                )
            ).strip()


            content = str(
                item.get(
                    "content",
                    ""
                )
            ).strip()


            if role not in [

                "user",

                "assistant"

            ]:

                continue


            if not content:

                continue


            # Protect against extremely large
            # individual history messages.

            content = content[:3000]


            if role == "user":

                conversation_text += (
                    f"\nSTUDENT: {content}\n"
                )


            elif role == "assistant":

                conversation_text += (
                    f"\nCOUNSELOR: {content}\n"
                )


        # ==================================================
        # CAREER COUNSELOR PROMPT
        # ==================================================

        prompt = f"""
You are MindBridge AI Career Counselor.

You are an AI career guidance assistant inside MindBridge,
a career guidance and student wellness platform.

Your job is to help users explore career and education
directions through thoughtful conversation and structured
analysis.


============================================================
WHO YOU CAN HELP
============================================================

You can support:

1. School students in Classes 8-10

2. Senior secondary students in Classes 11-12

3. Undergraduate or college students

4. Graduates

5. Postgraduate students

6. Working professionals

7. People considering career changes

8. People who are completely unsure about their career


============================================================
MOST IMPORTANT RULE
============================================================

DO NOT immediately recommend a specific career when there is
not enough information.

First understand the user's situation.

A recommendation should be based on analysis of relevant
information the user actually provides.


============================================================
CAREER ANALYSIS FRAMEWORK
============================================================

Depending on the person's educational or professional stage,
consider relevant factors such as:

ACADEMIC BACKGROUND

- Current education level
- Class or year
- Stream
- Subjects
- Degree
- Specialization
- Academic performance


INTERESTS

- Subjects they enjoy
- Subjects they dislike
- Technical interests
- Creative interests
- Business interests
- Research interests
- Social or people-oriented interests


SKILLS

- Technical skills
- Communication
- Problem solving
- Logical reasoning
- Creativity
- Leadership
- Teamwork


EXPERIENCE

- Projects
- Internships
- Competitions
- Clubs
- Volunteering
- Work experience


WORK PREFERENCES

- Technical work
- Creative work
- Research
- Working with people
- Independent work
- Team environments
- Leadership
- Entrepreneurship


CAREER GOALS

- Desired career direction
- Higher education
- Employment
- Entrepreneurship
- Research
- Career transition


CONSTRAINTS

Only when relevant and voluntarily provided, consider:

- Financial constraints
- Geographic preferences
- Educational access
- Time constraints

Never pressure users to disclose sensitive information.


============================================================
COUNSELING METHOD
============================================================

Act like an interactive career counselor.

If important information is missing, ask follow-up questions.

Ask only ONE or TWO focused questions at a time.

Do not send a huge questionnaire.

Do not repeatedly ask for information already provided.

Build an understanding of the user's profile gradually.

If the user asks a simple factual career question, answer it
directly when possible.

If the user asks:

"What career should I choose?"

or a similar personal recommendation question, collect enough
information before recommending.


============================================================
CLASS 8-10 STUDENTS
============================================================

Focus on:

- Subjects they enjoy
- Academic strengths
- Interests
- Aptitudes
- Activities
- Preferred learning style

If the student needs help choosing between:

- Science PCM
- Science PCB
- Commerce
- Arts / Humanities

Tell them that MindBridge also provides a dedicated
ML-powered Stream Assessment.

The AI Counselor can discuss options, but the structured
Stream Assessment should be recommended for deeper stream
analysis.


============================================================
CLASS 11-12 STUDENTS
============================================================

Focus on:

- Current stream
- Subjects
- Academic strengths
- Interests
- Career interests
- Entrance examination preferences
- Course preferences
- Higher education goals

Help explore:

- Undergraduate courses
- Career families
- Entrance pathways
- Alternative education pathways


============================================================
COLLEGE / UNDERGRADUATE STUDENTS
============================================================

Focus on:

- Degree
- Branch or specialization
- Current year
- Skills
- Projects
- Internships
- Areas of interest
- Preferred type of work
- Career goals
- Higher studies preferences

Help identify:

- Suitable job roles
- Career paths
- Internship directions
- Skill gaps
- Project recommendations
- Learning roadmap
- Higher education possibilities


============================================================
GRADUATES
============================================================

Focus on:

- Degree
- Specialization
- Skills
- Projects
- Internships
- Work experience
- Career interests
- Current employment situation
- Higher education goals

Help identify:

- Suitable job roles
- Career paths
- Skill gaps
- Learning areas
- Portfolio improvements
- Higher study options


============================================================
WORKING PROFESSIONALS
============================================================

Focus on:

- Current role
- Industry
- Work experience
- Existing skills
- Transferable skills
- Desired career direction
- Reason for exploring change

Suggest realistic transition pathways.

Do not encourage someone to immediately leave their job.

Explain skills or experience they may need before transitioning.


============================================================
WHEN ENOUGH INFORMATION IS AVAILABLE
============================================================

When enough useful information has been collected, provide a
structured analysis.

Use this format when appropriate:


CAREER PROFILE ANALYSIS

Summarize the important information the user actually provided.


STRENGTHS OBSERVED

List strengths supported by the conversation.


INTEREST PATTERN

Explain the major interests that appear relevant.


TOP CAREER MATCHES

Suggest approximately 3 to 5 suitable career directions.

For each option explain:

- Why it may fit
- Which interests support it
- Which skills support it
- Possible challenges
- Skills that may need development


BEST-FIT DIRECTION

If enough evidence exists, explain which direction currently
appears to have the strongest alignment.

Never claim it is the user's guaranteed or only correct career.


SKILL GAP ANALYSIS

Explain:

- Skills the user already appears to have
- Skills they may need to develop


NEXT STEPS

Give practical actions such as:

- Skills to learn
- Projects to build
- Internships to explore
- Courses or subject areas to investigate
- Portfolio development
- Higher education research


ALTERNATIVE PATHS

Provide reasonable alternatives where appropriate.


============================================================
EVIDENCE RULES
============================================================

Recommendations MUST be grounded in information provided by
the user.

Clearly distinguish between:

1. Facts stated by the user

2. Reasonable interpretations based on those facts

3. Suggestions that the user may want to explore


NEVER invent:

- Academic marks
- Degrees
- Qualifications
- Skills
- Interests
- Projects
- Internships
- Work experience
- Achievements


If important information is missing, ask before making a
strong recommendation.


============================================================
MATCH SCORES
============================================================

Do not invent precise match percentages.

For example, do NOT say:

"AI Engineer - 97% match"

unless the percentage comes from an actual ML or scoring
system supplied by MindBridge.

Instead use descriptions such as:

- Strong alignment
- Good potential fit
- Worth exploring
- Possible alternative


============================================================
RESPONSIBLE CAREER GUIDANCE
============================================================

Career recommendations are guidance, not guarantees.

Do not pressure users into one career.

When appropriate, provide multiple paths.

Encourage users to consider:

- Personal interests
- Educational requirements
- Financial realities
- Career opportunities
- Personal circumstances

before making major decisions.


============================================================
CURRENT INFORMATION
============================================================

Do not fabricate current:

- Salaries
- College rankings
- Admission cutoffs
- Entrance examination dates
- Job market statistics

If a question depends on current information, tell the user
that the latest details should be verified from appropriate
official sources.


============================================================
COMMUNICATION STYLE
============================================================

Be practical, supportive and clear.

Avoid generic motivational speeches.

Normal conversation should be reasonably concise.

Ask focused questions during profile discovery.

A final career analysis may be more detailed.

The user may communicate in English, informal English,
Hindi-English or Hinglish.

Understand the user's meaning and respond naturally.

Do not overuse emojis.


============================================================
PREVIOUS COUNSELING CONVERSATION
============================================================

{conversation_text}


============================================================
CURRENT USER MESSAGE
============================================================

STUDENT:

{message}


Respond now as the MindBridge AI Career Counselor.
"""


        # ==================================================
        # CALL GEMINI
        # ==================================================

        response = (
            gemini_client
            .models
            .generate_content(

                model=
                    "gemini-3.5-flash",

                contents=
                    prompt

            )
        )


        # ==================================================
        # GET RESPONSE TEXT
        # ==================================================

        reply = response.text


        if not reply:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "The AI Career Counselor returned "
                        "an empty response."
                }
            ), 502


        # ==================================================
        # RETURN RESPONSE
        # ==================================================

        return jsonify(
            {
                "success": True,

                "reply":
                    reply
            }
        ), 200


    except Exception as error:

        print(
            "AI Career Counselor Error:",
            str(error)
        )


        traceback.print_exc()


        return jsonify(
            {
                "success": False,

                "error":
                    "The AI Career Counselor is temporarily "
                    "unavailable. Please try again."
            }
        ), 500


# ==========================================================
# STREAM RECOMMENDATION ML API
# ==========================================================

@app.route(
    "/api/predict-stream",
    methods=["POST"]
)
def predict_stream():

    try:

        # ==================================================
        # CHECK MODEL
        # ==================================================

        if stream_model is None:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "Stream recommendation model "
                        "is not available."
                }
            ), 500


        # ==================================================
        # READ REQUEST
        # ==================================================

        data = request.get_json(
            silent=True
        )


        if not data:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "Request body must contain JSON."
                }
            ), 400


        # ==================================================
        # CHECK REQUIRED FEATURES
        # ==================================================

        missing_features = [

            feature

            for feature
            in STREAM_FEATURES

            if feature
            not in data

        ]


        if missing_features:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "Missing required assessment fields.",

                    "missing_fields":
                        missing_features
                }
            ), 400


        # ==================================================
        # VALIDATE AND BUILD INPUT
        # ==================================================

        model_input = {}


        for feature in STREAM_FEATURES:

            try:

                value = float(
                    data[
                        feature
                    ]
                )


            except (
                TypeError,
                ValueError
            ):

                return jsonify(
                    {
                        "success": False,

                        "error":
                            f"Invalid value for {feature}."
                    }
                ), 400


            # ------------------------------------------------
            # Score validation
            # ------------------------------------------------

            if feature in [

                "math_score",

                "science_score",

                "english_score",

                "social_science_score"

            ]:

                if (
                    value < 0
                    or
                    value > 100
                ):

                    return jsonify(
                        {
                            "success": False,

                            "error":
                                f"{feature} must be "
                                "between 0 and 100."
                        }
                    ), 400


            # ------------------------------------------------
            # Rating validation
            # ------------------------------------------------

            else:

                if (
                    value < 1
                    or
                    value > 5
                ):

                    return jsonify(
                        {
                            "success": False,

                            "error":
                                f"{feature} must be "
                                "between 1 and 5."
                        }
                    ), 400


            model_input[
                feature
            ] = value


        # ==================================================
        # CREATE DATAFRAME
        # ==================================================

        input_dataframe = pd.DataFrame(

            [
                model_input
            ],

            columns=
                STREAM_FEATURES

        )


        # ==================================================
        # MAKE PREDICTION
        # ==================================================

        prediction = stream_model.predict(
            input_dataframe
        )


        recommended_stream = str(
            prediction[0]
        )


        # ==================================================
        # GET PROBABILITIES
        # ==================================================

        probabilities = {}


        confidence = None


        if hasattr(
            stream_model,
            "predict_proba"
        ):

            prediction_probabilities = (
                stream_model.predict_proba(
                    input_dataframe
                )[0]
            )


            model_classes = (
                stream_model.classes_
            )


            for (
                stream_class,
                probability
            ) in zip(

                model_classes,

                prediction_probabilities

            ):

                probabilities[
                    str(
                        stream_class
                    )
                ] = round(

                    float(
                        probability
                    )
                    * 100,

                    2

                )


            confidence = round(

                max(
                    probabilities.values()
                ),

                2

            )


        # ==================================================
        # RETURN PREDICTION
        # ==================================================

        return jsonify(
            {
                "success": True,

                "recommended_stream":
                    recommended_stream,

                "confidence":
                    confidence,

                "probabilities":
                    probabilities
            }
        ), 200


    except Exception as error:

        print(
            "Stream Prediction Error:",
            str(error)
        )


        traceback.print_exc()


        return jsonify(
            {
                "success": False,

                "error":
                    "Unable to generate a stream "
                    "recommendation. Please try again."
            }
        ), 500



# ==========================================================
# LIVE CAMERA FACIAL EXPRESSION ANALYSIS
# ==========================================================

@app.route("/api/analyze-expression", methods=["POST"])
def analyze_expression():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"success": False, "face_detected": False, "error": "Request body must contain JSON."}), 400

        image_data = str(data.get("image", "")).strip()
        if not image_data:
            return jsonify({"success": False, "face_detected": False, "error": "No camera frame was provided."}), 400

        if "," in image_data:
            image_data = image_data.split(",", 1)[1]

        try:
            image_bytes = base64.b64decode(image_data, validate=True)
        except Exception:
            return jsonify({"success": False, "face_detected": False, "error": "Invalid camera image data."}), 400

        numpy_array = np.frombuffer(image_bytes, dtype=np.uint8)
        frame = cv2.imdecode(numpy_array, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"success": False, "face_detected": False, "error": "Unable to decode the camera frame."}), 400

        height, width = frame.shape[:2]
        if width > 640:
            scale = 640 / width
            frame = cv2.resize(frame, (640, int(height * scale)))

        try:
            result = DeepFace.analyze(
                img_path=frame,
                actions=["emotion"],
                detector_backend="opencv",
                enforce_detection=True,
                silent=True
            )
        except Exception as deepface_error:
            print("DeepFace Analysis Error:", str(deepface_error))
            return jsonify({
                "success": False,
                "face_detected": False,
                "error": "No clear face was detected. Please look toward the camera and ensure there is enough lighting."
            }), 422

        analysis = result[0] if isinstance(result, list) and result else result
        if not analysis:
            return jsonify({"success": False, "face_detected": False, "error": "No face was detected."}), 422

        dominant_emotion = str(analysis.get("dominant_emotion", "unknown")).lower()
        emotion_scores = {}
        for emotion, score in analysis.get("emotion", {}).items():
            try:
                emotion_scores[str(emotion)] = round(float(score), 2)
            except (TypeError, ValueError):
                pass

        region = analysis.get("region", {})
        face_region = {
            "x": int(region.get("x", 0)),
            "y": int(region.get("y", 0)),
            "width": int(region.get("w", 0)),
            "height": int(region.get("h", 0))
        }

        print("Expression Observation:", dominant_emotion)

        return jsonify({
            "success": True,
            "face_detected": True,
            "dominant_emotion": dominant_emotion,
            "emotion_scores": emotion_scores,
            "face_region": face_region,
            "message": "Camera frame analyzed successfully."
        }), 200

    except Exception as error:
        print("Expression Analysis Error:", str(error))
        traceback.print_exc()
        return jsonify({
            "success": False,
            "face_detected": False,
            "error": "Unable to analyze the camera frame. Please try again."
        }), 500



# ==========================================================
# GEMINI JSON HELPER
# ==========================================================

def clean_gemini_json(text):
    if not text:
        return ""
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()


# ==========================================================
# GEMINI-GENERATED STRESS QUESTIONS
# ==========================================================

@app.route("/api/generate-stress-questions", methods=["POST"])
def generate_stress_questions():
    try:
        if gemini_client is None:
            return jsonify({"success": False, "error": "Gemini API is not configured."}), 500

        data = request.get_json(silent=True) or {}
        context = str(data.get("context", "")).strip()[:500]

        prompt = f"""
Generate exactly 7 short general-wellness stress self-reflection questions for MindBridge.

All questions must be about recent experiences and answerable from 1 to 5:
1 = Not at all
2 = A little
3 = Sometimes
4 = Often
5 = Very much

Higher numbers must always indicate greater stress or difficulty.
Cover themes such as feeling overwhelmed, difficulty relaxing, workload,
concentration, sleep, irritability or tension, mental exhaustion, and coping.
Ask only one idea per question. Do not diagnose any condition. Do not claim
the questionnaire is clinically validated. Do not mention cameras or facial expressions.

Optional context:
{context if context else "No additional context provided."}

Return ONLY valid JSON:
{{
  "questions": [
    {{"id": 1, "question": "Question text"}}
  ]
}}
The questions array must contain exactly 7 objects.
"""

        response = gemini_client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt
        )
        response_text = (response.text or "").strip()

        if not response_text:
            return jsonify({"success": False, "error": "Gemini returned an empty question response."}), 502

        try:
            parsed = json.loads(clean_gemini_json(response_text))
        except json.JSONDecodeError:
            print("Invalid Gemini Question JSON:", response_text)
            return jsonify({"success": False, "error": "Gemini generated an invalid questionnaire."}), 502

        questions = parsed.get("questions")
        if not isinstance(questions, list) or len(questions) != 7:
            return jsonify({"success": False, "error": "Gemini must generate exactly 7 questions."}), 502

        validated = []
        for index, item in enumerate(questions, start=1):
            if isinstance(item, dict):
                question = str(item.get("question", "")).strip()
                if question:
                    validated.append({"id": index, "question": question})

        if len(validated) != 7:
            return jsonify({"success": False, "error": "Some generated questions were invalid."}), 502

        return jsonify({
            "success": True,
            "questions": validated,
            "scale": {
                "1": "Not at all",
                "2": "A little",
                "3": "Sometimes",
                "4": "Often",
                "5": "Very much"
            }
        }), 200

    except Exception as error:
        print("Generate Stress Questions Error:", str(error))
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": "Unable to generate stress questions right now. Please try again."
        }), 500


# ==========================================================
# STRESS REFLECTION
# ==========================================================

@app.route("/api/stress-reflection", methods=["POST"])
def stress_reflection():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"success": False, "error": "Request body must contain JSON."}), 400

        answers = data.get("answers", [])
        camera_used = bool(data.get("camera_used", False))
        observations = data.get("expression_observations", [])

        if not isinstance(answers, list) or len(answers) != 7:
            return jsonify({"success": False, "error": "Exactly 7 answers are required."}), 400

        validated_answers = []
        scores = []

        for answer in answers:
            if not isinstance(answer, dict):
                return jsonify({"success": False, "error": "Invalid answer format."}), 400

            question = str(answer.get("question", "")).strip()
            try:
                score = int(answer.get("score"))
            except (TypeError, ValueError):
                return jsonify({"success": False, "error": "Every answer must contain a numeric score."}), 400

            if not question or score < 1 or score > 5:
                return jsonify({
                    "success": False,
                    "error": "Each answer needs a question and a score between 1 and 5."
                }), 400

            validated_answers.append({"question": question, "score": score})
            scores.append(score)

        total_score = sum(scores)
        maximum_score = 35
        average_score = round(total_score / 7, 2)

        if total_score <= 13:
            level = "Lower stress indicators"
        elif total_score <= 20:
            level = "Mild stress indicators"
        elif total_score <= 27:
            level = "Moderate stress indicators"
        else:
            level = "Elevated stress indicators"

        allowed = {"angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"}
        cleaned = []
        if isinstance(observations, list):
            cleaned = [
                str(x).strip().lower()
                for x in observations[:50]
                if str(x).strip().lower() in allowed
            ]

        camera_summary = None
        if camera_used and cleaned:
            counts = {}
            for emotion in cleaned:
                counts[emotion] = counts.get(emotion, 0) + 1
            camera_summary = {
                "total_observations": len(cleaned),
                "most_observed_expression": max(counts, key=counts.get),
                "expression_counts": counts
            }

        reflection = (
            "Your responses provide a general picture of how much pressure "
            "or difficulty you may have been experiencing recently."
        )
        suggestions = [
            "Break large tasks into smaller, manageable steps.",
            "Take short breaks during focused work.",
            "Try a brief breathing or grounding exercise.",
            "Protect time for sleep and recovery.",
            "Consider talking with someone you trust if you feel overwhelmed."
        ]

        if gemini_client is not None:
            prompt = f"""
You are MindBridge AI, a supportive general-wellness assistant.

Questionnaire answers:
{json.dumps(validated_answers, ensure_ascii=False)}

Deterministic score: {total_score} out of {maximum_score}
Calculated reflection level: {level}

Optional experimental camera context:
{json.dumps(camera_summary) if camera_summary else "No camera observations were used."}

Do not change the calculated score or reflection level.
Base the reflection primarily on questionnaire answers.
Do not diagnose any medical or mental-health condition.
Do not treat facial expressions as proof or measurement of stress.
Camera information is experimental context only.
Give practical, concise general-wellness suggestions.

Return ONLY valid JSON:
{{
  "reflection": "Concise personalized reflection.",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4"]
}}
"""
            try:
                gemini_response = gemini_client.models.generate_content(
                    model="gemini-3.5-flash",
                    contents=prompt
                )
                result = json.loads(clean_gemini_json(gemini_response.text or ""))
                generated_reflection = str(result.get("reflection", "")).strip()
                generated_suggestions = result.get("suggestions", [])

                if generated_reflection:
                    reflection = generated_reflection
                if isinstance(generated_suggestions, list):
                    valid = [str(x).strip() for x in generated_suggestions if str(x).strip()][:5]
                    if valid:
                        suggestions = valid
            except Exception as gemini_error:
                print("Gemini Stress Reflection Error:", str(gemini_error))

        return jsonify({
            "success": True,
            "questionnaire": {
                "score": total_score,
                "maximum_score": maximum_score,
                "average_score": average_score,
                "reflection_level": level
            },
            "camera_used": camera_used,
            "camera_summary": camera_summary,
            "reflection": reflection,
            "suggestions": suggestions,
            "disclaimer": (
                "This is a general wellness self-reflection and is not "
                "a medical or mental-health diagnosis."
            )
        }), 200

    except Exception as error:
        print("Stress Reflection Error:", str(error))
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": "Unable to generate your stress reflection right now. Please try again."
        }), 500


# ==========================================================
# 404 ERROR HANDLER
# ==========================================================

@app.errorhandler(404)
def not_found(
    error
):

    return jsonify(
        {
            "success": False,

            "error":
                "The requested MindBridge API "
                "endpoint was not found."
        }
    ), 404


# ==========================================================
# 405 ERROR HANDLER
# ==========================================================

@app.errorhandler(405)
def method_not_allowed(
    error
):

    return jsonify(
        {
            "success": False,

            "error":
                "This HTTP method is not allowed "
                "for the requested endpoint."
        }
    ), 405


# ==========================================================
# RUN FLASK APPLICATION
# ==========================================================

if __name__ == "__main__":

    print(
        "\n"
        "============================================"
    )

    print(
        "MINDBRIDGE BACKEND"
    )

    print(
        "============================================"
    )

    print(
        "Health Check:"
    )

    print(
        "http://127.0.0.1:5000/api/health"
    )

    print(
        "\nAvailable APIs:"
    )

    print(
        "POST /api/chat"
    )

    print(
        "POST /api/career-chat"
    )

    print(
        "POST /api/predict-stream"
    )

    print(
        "============================================"
        "\n"
    )


    app.run(

        host=
            "127.0.0.1",

        port=
            5000,

        debug=
            True

    )