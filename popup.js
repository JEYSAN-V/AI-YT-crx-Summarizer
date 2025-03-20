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
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];

      if (currentTab && isYouTubeVideoUrl(currentTab.url)) {
          fetch("http://localhost:5000/transcript", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ link: currentTab.url }),  // Send actual YouTube URL
          })
          .then((response) => response.json())
          .then((data) => {
              document.getElementById("transcript-content").textContent = data.transcript || "No transcript available.";
          })
          .catch((err) => {
              console.error("Error:", err);
              document.getElementById("transcript-content").textContent = "Failed to fetch transcript.";
          });
      } else {
          alert("No YouTube video detected.");
      }
  });
}
document.getElementById("start-transcription").addEventListener("click", startTranscription);
// Function to generate the summary
function generateSummary() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];

      if (currentTab && isYouTubeVideoUrl(currentTab.url)) {
          fetch("http://localhost:5000/summarize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ link: currentTab.url }),
          })
          .then((response) => response.json())
          .then((data) => {
              document.getElementById("summary-content").innerHTML = `
                  <h3>Overview:</h3>
                  <p>${data.overview || "No overview available."}</p>
                  <h3>Detailed Summary:</h3>
                  <p>${data.detailed_summary || "No detailed summary available."}</p>
              `;
          })
          .catch((err) => {
              console.error("Error:", err);
              document.getElementById("summary-content").textContent = "Failed to fetch summary.";
          });
      } else {
          alert("No YouTube video detected.");
      }
  });
}

document.getElementById("generate-summary").addEventListener("click", generateSummary);

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


// Function to fetch and display Mind Map
function generateMindMap() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];

      if (currentTab && currentTab.url.includes("youtube.com")) {
          fetch("http://localhost:5000/mindmap", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ link: currentTab.url }),
          })
          .then((response) => response.json())
          .then((data) => {
              drawMindMap(data);
          })
          .catch((err) => {
              console.error("Error:", err);
              alert("Failed to generate mind map.");
          });
      } else {
          alert("No YouTube video detected.");
      }
  });
}

// Function to draw the Mind Map with D3.js
function drawMindMap(data) {
  const svg = d3.select("#mindmap-content").html("").append("svg")
      .attr("width", 500)
      .attr("height", 400);

  const g = svg.append("g").attr("transform", "translate(40,40)");

  const treeLayout = d3.tree().size([400, 300]);
  const root = d3.hierarchy(data);
  treeLayout(root);

  g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("line")
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
      .attr("stroke", "#555");

  g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 10)
      .attr("fill", "#28a745");
}

// PDF Export
function exportPDF() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];

      if (currentTab && currentTab.url.includes("youtube.com")) {
          fetch("http://localhost:5000/export-pdf", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ link: currentTab.url }),
          })
          .then((response) => response.blob())
          .then((blob) => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "youtube_summary.pdf";
              a.click();
              window.URL.revokeObjectURL(url);
          })
          .catch((err) => {
              console.error("Error:", err);
              alert("Failed to export PDF.");
          });
      } else {
          alert("No YouTube video detected.");
      }
  });
}

document.getElementById("generate-mindmap").addEventListener("click", generateMindMap);
document.getElementById("export-pdf").addEventListener("click", exportPDF);
