import cv2
from deepface import DeepFace


# ----------------------------------------------------------
# IMAGE PATH
# Put a clear face photo named "test_face.jpg"
# inside your backend folder.
# ----------------------------------------------------------

IMAGE_PATH = "test_face.jpg"


# ----------------------------------------------------------
# READ IMAGE USING OPENCV
# ----------------------------------------------------------

image = cv2.imread(IMAGE_PATH)

if image is None:
    print("ERROR: Could not load the image.")
    print("Make sure test_face.jpg is inside the backend folder.")
    exit()


print("Image loaded successfully using OpenCV.")


# ----------------------------------------------------------
# ANALYZE FACIAL EXPRESSION USING DEEPFACE
# ----------------------------------------------------------

try:

    print("Analyzing facial expression...")

    result = DeepFace.analyze(
        img_path=image,
        actions=["emotion"],
        enforce_detection=True
    )


    # DeepFace normally returns a list
    analysis = result[0]


    dominant_emotion = analysis[
        "dominant_emotion"
    ]


    emotion_scores = analysis[
        "emotion"
    ]


    print("\n==============================")
    print("FACIAL EXPRESSION RESULT")
    print("==============================")

    print(
        "\nDominant Expression:",
        dominant_emotion
    )


    print("\nExpression Scores:")

    for emotion, score in emotion_scores.items():

        print(
            f"{emotion}: {score:.2f}%"
        )


    print("\n==============================")


except Exception as error:

    print("\nERROR DURING ANALYSIS:")

    print(error)