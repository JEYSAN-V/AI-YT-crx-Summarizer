from flask import Flask, request, jsonify, send_file
from dotenv import load_dotenv
import os
import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
import json
import re
import requests
from bs4 import BeautifulSoup

# ================================
# 🔥 Load Environment Variables
# ================================
load_dotenv()

# ================================
# 🌐 Flask App Initialization
# ================================
app = Flask(__name__)

# ================================
# ✅ API Configuration
# ================================
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
MODEL_NAME = "gemini-1.5-flash-latest"

# ================================
# 🚀 Helper Functions
# ================================

# 1. YouTube ID Extractor
def extract_youtube_id(url):
    """Extract YouTube ID from various URL formats."""
    regex = (
        r'(?:https?://)?(?:www\.)?'
        r'(?:youtube\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)'
        r'([^"&?/ ]{11})'
    )
    match = re.search(regex, url)
    return match.group(1) if match else None

# 2. Transcript Extraction
def extract_transcript(youtube_url):
    """Extracts transcript from YouTube video."""
    try:
        video_id = extract_youtube_id(youtube_url)
        if not video_id:
            return "Invalid YouTube URL or no ID found."
        
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        text = " ".join(i["text"] for i in transcript)
        return text
    except Exception as e:
        return str(e)

# 3. Summary Generation
def generate_summary(transcript_text):
    """Generates overview and detailed summary using Gemini."""
    SUMMARY_PROMPT = """
    You are a YouTube video summarizer. Generate two summaries:
    1. **Overview:** A brief bullet-point summary with key highlights (max 200 words).
    2. **Detailed Summary:** A thorough, paragraph-style summary explaining the entire video (max 400 words).
    """

    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content(SUMMARY_PROMPT + transcript_text)

    parts = response.text.split("**Detailed Summary:**")
    overview = parts[0].replace("**Overview:**", "").strip() if len(parts) > 1 else response.text
    detailed_summary = parts[1].strip() if len(parts) > 1 else "Detailed summary not available."

    return {
        "overview": overview,
        "detailed_summary": detailed_summary
    }

# 4. Q&A Generation
def generate_answer(transcript_text, question):
    """Generates an answer for the given question using transcript data."""
    QA_PROMPT = """
    You are an expert on video content. Answer the question based on the provided transcript.
    """

    model = genai.GenerativeModel(MODEL_NAME)
    qa_prompt = f"{QA_PROMPT}\nTranscript: {transcript_text}\nQuestion: {question}"
    response = model.generate_content(qa_prompt)

    return {
        "answer": response.text
    }

# 5. Export PDF
def export_pdf_content(transcript, summary, qa):
    """Generates a PDF with transcript, summary, and QA."""
    buffer = BytesIO()
    pdf = SimpleDocTemplate(buffer)
    styles = getSampleStyleSheet()

    content = []

    # Transcript Section
    content.append(Paragraph("YouTube Video Transcript", styles['Title']))
    content.append(Spacer(1, 12))
    content.append(Paragraph(transcript, styles['Normal']))
    
    # Summary Section
    content.append(Spacer(1, 20))
    content.append(Paragraph("Summary", styles['Heading1']))
    content.append(Paragraph(f"Overview: {summary['overview']}", styles['Normal']))
    content.append(Spacer(1, 12))
    content.append(Paragraph(f"Detailed Summary: {summary['detailed_summary']}", styles['Normal']))

    # QA Section
    content.append(Spacer(1, 20))
    content.append(Paragraph("Q&A", styles['Heading1']))
    content.append(Paragraph(f"{qa['answer']}", styles['Normal']))

    pdf.build(content)
    buffer.seek(0)

    return buffer

# ================================
# 🌐 Flask Routes
# ================================

# 1. Extract Transcript
@app.route('/transcript', methods=['POST'])
def get_transcript():
    """Returns the transcript for the given YouTube URL."""
    data = request.get_json()
    youtube_link = data.get("link")

    transcript = extract_transcript(youtube_link)
    if transcript:
        return jsonify({"transcript": transcript})
    else:
        return jsonify({"error": "Failed to fetch transcript"}), 500

# 2. Generate Summary
@app.route('/summarize', methods=['POST'])
def summarize():
    """Generates summary for the video."""
    data = request.get_json()
    youtube_link = data.get("link")

    transcript = extract_transcript(youtube_link)
    if transcript:
        summary = generate_summary(transcript)
        return jsonify(summary)
    else:
        return jsonify({"error": "Failed to fetch transcript"}), 500

# 3. Q&A
@app.route('/ask', methods=['POST'])
def ask():
    """Generates an answer for the given question."""
    data = request.get_json()
    youtube_link = data.get("link")
    question = data.get("question")

    transcript = extract_transcript(youtube_link)
    if transcript:
        answer = generate_answer(transcript, question)
        return jsonify(answer)
    else:
        return jsonify({"error": "Failed to fetch transcript"}), 500

# 4. Export PDF
@app.route('/export-pdf', methods=['POST'])
def export_pdf():
    """Exports the YouTube transcript, summary, and QA as a PDF."""
    data = request.get_json()
    youtube_link = data.get("link")
    question = data.get("question")

    transcript = extract_transcript(youtube_link)
    if not transcript:
        return jsonify({"error": "Failed to fetch transcript"}), 500

    summary = generate_summary(transcript)
    qa = generate_answer(transcript, question)

    pdf_buffer = export_pdf_content(transcript, summary, qa)

    return send_file(pdf_buffer, as_attachment=True, download_name='youtube_summary.pdf', mimetype='application/pdf')

# ================================
# 🔥 Run the App
# ================================
if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000)
