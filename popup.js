// Function to check if a URL is a valid YouTube video URL
function isYouTubeVideoUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
}

// Function to extract video ID from YouTube URL
function getYouTubeVideoId(url) {
  const regExp = /[?&]v=([^&#]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// Function to update UI based on current video
function updateUIForVideo(url, title) {
  const videoTitle = document.getElementById("video-title");
  const videoThumbnail = document.getElementById("video-thumbnail");
  
  if (isYouTubeVideoUrl(url)) {
      if (videoTitle) videoTitle.textContent = title || "Current YouTube Video";
      if (videoThumbnail) {
          videoThumbnail.innerHTML = `<img src="https://img.youtube.com/vi/${getYouTubeVideoId(url)}/0.jpg" alt="Thumbnail">`;
      }
  } else {
      if (videoTitle) videoTitle.textContent = "No YouTube video detected";
      if (videoThumbnail) videoThumbnail.innerHTML = "";
  }
}

// Function to check current tab
function checkCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      if (currentTab && isYouTubeVideoUrl(currentTab.url)) {
          updateUIForVideo(currentTab.url, currentTab.title);
      }
  });
}

// Function to start transcription (mock function)
function startTranscription() {
  document.getElementById("transcript-content").textContent = "Transcription in progress... (Feature not implemented yet)";
}

// Function to generate the summary
function generateSummary() {
  const currentTabUrl = document.getElementById("video-title").textContent;
  
  if (!isYouTubeVideoUrl(currentTabUrl)) {
      alert("No YouTube video detected.");
      return;
  }

  fetch("http://localhost:5000/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link: currentTabUrl }),
  })
  .then((response) => response.json())
  .then((data) => {
      document.getElementById("summary-content").textContent = data.overview || "No summary available.";
  })
  .catch((err) => console.error("Error:", err));
}

// Function to handle Q&A with chat history
function askQuestion() {
  const questionInput = document.getElementById("question-input");
  const chatContainer = document.getElementById("chat-messages");
  const question = questionInput.value.trim();
  const currentTabUrl = document.getElementById("video-title").textContent;

  if (!isYouTubeVideoUrl(currentTabUrl)) {
      alert("No YouTube video detected.");
      return;
  }

  if (!question) {
      alert("Please enter a question.");
      return;
  }

  appendChatBubble(question, "user");

  fetch("http://localhost:5000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link: currentTabUrl, question }),
  })
  .then((response) => response.json())
  .then((data) => {
      appendChatBubble(data.answer || "No answer available.", "bot");
  })
  .catch((err) => {
      console.error("Error:", err);
      appendChatBubble("Failed to get response", "bot");
  });

  questionInput.value = "";
}

// Function to create and append a chat bubble
function appendChatBubble(text, sender) {
  const chatContainer = document.getElementById("chat-messages");

  const chatItem = document.createElement("div");
  chatItem.classList.add("chat-item", sender);
  chatItem.textContent = text;

  chatContainer.appendChild(chatItem);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  checkCurrentTab();

  document.getElementById("start-transcription").addEventListener("click", startTranscription);
  document.getElementById("generate-summary").addEventListener("click", generateSummary);
  document.getElementById("send-question").addEventListener("click", askQuestion);
});

// Tab switching logic
document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

      button.classList.add('active');
      const activeTab = document.getElementById(button.dataset.tab);
      if (activeTab) activeTab.classList.add('active');
  });
});
