from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__)

MODEL_NAME = "gemini-1.5-flash-latest"

# Prompt template
SUMMARY_PROMPT = """
You are a YouTube video summarizer. You will be taking the transcript text
and generating two types of summaries:
1. **Overview:** A concise bullet-point summary with the key highlights (max 200 words).
2. **Detailed Summary:** A thorough, paragraph-style summary explaining the entire video content in detail (max 400 words).
"""

QA_PROMPT = """
You are an expert on video content. Answer questions about the video content 
based on the provided transcript. Be concise and accurate.
"""

# Extract transcript
def extract_transcript(youtube_url):
    try:
        video_id = youtube_url.split("=")[1]
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        text = " ".join(i["text"] for i in transcript)
        return text
    except Exception as e:
        return str(e)

# Generate summary
def generate_summary(transcript_text):
    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content(SUMMARY_PROMPT + transcript_text)

    parts = response.text.split("**Detailed Summary:**")
    overview = parts[0].strip() if len(parts) > 1 else response.text
    detailed_summary = parts[1].strip() if len(parts) > 1 else ""

    return {
        "overview": overview,
        "detailed_summary": detailed_summary
    }

# Q&A generation
def generate_answer(transcript_text, question):
    model = genai.GenerativeModel(MODEL_NAME)
    qa_prompt = f"{QA_PROMPT}\nTranscript: {transcript_text}\nQuestion: {question}"
    response = model.generate_content(qa_prompt)

    return {
        "answer": response.text
    }

# Summary endpoint
@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    youtube_link = data.get("link")

    transcript = extract_transcript(youtube_link)
    if transcript:
        summary = generate_summary(transcript)
        return jsonify(summary)
    else:
        return jsonify({"error": "Failed to fetch transcript"}), 500

# Q&A endpoint
@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    youtube_link = data.get("link")
    question = data.get("question")

    transcript = extract_transcript(youtube_link)
    if transcript:
        answer = generate_answer(transcript, question)
        return jsonify(answer)
    else:
        return jsonify({"error": "Failed to fetch transcript"}), 500

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000)
