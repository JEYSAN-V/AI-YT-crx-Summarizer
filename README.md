# YouTube Video Summarizer Chrome Extension

This is a Chrome extension that summarizes YouTube videos by extracting the transcript, generating summaries, providing a Q&A interface, and exporting the content as a PDF or TXT file. It uses Flask as the backend, Google Gemini API for generating summaries and answering questions, and YouTube Transcript API for extracting transcripts.

## 🚀 Features
- ✅ Extracts YouTube video transcripts.
- ✅ Generates overview and detailed summaries using Gemini API.
- ✅ Provides Q&A feature to ask questions based on the video content. (This feature is not available for this version)
- ✅ Exports the transcript, summary, and Q&A responses as PDF or TXT.
- ✅ Displays the thumbnail and title of the current YouTube video.
- ✅ Basic mind map generation (D3.js integration planned). (This feature is not available for this version)

## 🛠️ Tech Stack
### Frontend:
- HTML, CSS, JavaScript (Chrome Extension)
- D3.js (for Mind Map visualization – planned)

### Backend:
- Flask (Python)
- YouTube Transcript API
- Google Gemini API
- ReportLab (PDF generation)

## ⚙️ Installation Guide
1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/youtube-summarizer-extension.git
   cd youtube-summarizer-extension
   ```

2. **Backend Setup**
   - Create a virtual environment (optional but recommended):
     ```bash
     python -m venv venv
     source venv/bin/activate  # Linux/Mac
     venv\Scripts\activate      # Windows
     ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Add environment variables:
     - Create a `.env` file and add your Google Gemini API key.
       ```
       GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
       ```
   - Run the Flask server:
     ```bash
     python app.py
     ```
   - Backend will run on `http://127.0.0.1:5000`.

3. **Chrome Extension Setup**
   - Open Chrome → go to `chrome://extensions/`.
   - Toggle on Developer mode (top-right corner).
   - Click on Load unpacked.
   - Select the `/extension` folder.
   - The extension will now be available in your browser.

## 🚀 Usage Instructions
1. **Transcription**
   - Open a YouTube video.
   - Click on the "Start Transcription" button.
   - The transcript will be displayed.

2. **Summary**
   - Click the "Generate Summary" button.
   - An overview and detailed summary will be displayed.

3. **Q&A**
   - Enter a question in the Q&A tab.
   - Click on "Send Question".
   - The extension will display the answer based on the video transcript.

4. **Exporting**
   - Click "Export as PDF" or "Export as TXT".
   - The PDF or TXT file containing the transcript, summary, and Q&A will be downloaded.

## 🛡️ API Endpoints
- **POST /transcript** → Extracts YouTube transcript.
- **POST /summarize** → Generates summary (overview + detailed).
- **POST /ask** → Answers a question using the video content.
- **POST /export-pdf** → Exports content as PDF.

## 🐍 Environment Variables
Create a `.env` file in the backend folder and add:

GOOGLE_API_KEY=YOUR_GEMINI_API_KEY

## 🛠️ Dependencies
### Backend
- Flask → Server framework
- youtube-transcript-api → Extracts YouTube transcripts
- google-generativeai → Gemini API integration
- reportlab → Generates PDF reports

Install dependencies with:
```bash
pip install -r requirements.txt
```

### Frontend
- Chrome extension uses vanilla JavaScript.
- D3.js for future mind map visualization.

## ✅ Customization
- Modify `popup.js` and `app.py` to add custom logic or improve UI/UX.
- Update the CSS styles in `styles.css` for visual changes.
- Add more API routes or features in `app.py`.

## 🚀 Future Enhancements
- ✅ Mind map visualization with D3.js. (This feature is not available for this version)
- ✅ Support for multi-language transcripts.
- ✅ Improve the Q&A functionality using more advanced context retrieval. (This feature is not available for this version)
- ✅ UI improvements with better error handling and animations.

## 🛡️ License
This project is licensed under the MIT License.

## 🤝 Contributing
Contributions are welcome!
1. Fork the repo
2. Create a new branch (feature-xyz)
3. Commit your changes
4. Create a pull request

## 💬 Contact
For any issues or feature requests, feel free to create an issue or submit a pull request.

✅ Happy Summarizing! 🎥📄