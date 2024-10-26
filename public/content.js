let mediaRecorder;
let audioChunks = [];

function startRecording(stream) {
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    audioChunks = [];

    console.log("Audio Recorded:", audioBlob);

    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    audio.play();
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "start") {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        startRecording(stream);
        sendResponse({ message: "Recording started" });
      })
      .catch((err) => {
        console.error("Error accessing microphone", err);
        sendResponse({ message: "Failed to start recording" });
      });
  } else if (request.command === "stop") {
    if (mediaRecorder) {
      mediaRecorder.stop();
      sendResponse({ message: "Recording stopped" });
    } else {
      sendResponse({ message: "No recording in progress" });
    }
  }
  return true;
});
