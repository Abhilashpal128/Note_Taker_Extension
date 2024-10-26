import React, { useState, useEffect, useRef } from "react";
import "./App.css"; // Import CSS file for styles

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null); // New state for the audio blob
  const [apiResponse, setApiResponse] = useState(""); // New state for API response
  const chunks = useRef([]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaRecorder]);

  const handleStartRecording = async () => {
    setIsRecording(true);
    chunks.current = []; // Clear chunks on start

    // Request access to the microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Create a MediaRecorder instance
    const recorder = new MediaRecorder(stream);

    // Collect data chunks
    recorder.ondataavailable = (e) => {
      chunks.current.push(e.data);
    };

    // Function to convert audio blob to WAV buffer
    const convertToWavBuffer = (audioBlob) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const arrayBuffer = reader.result;
          const buffer = new Uint8Array(arrayBuffer);
          resolve(buffer);
        };
        reader.readAsArrayBuffer(audioBlob);
      });
    };

    // Function to send audio data to the API
    const sendAudioToApi = async (buffer) => {
      try {
        const response = await fetch(
          "https://82c5-34-173-137-208.ngrok-free.app/transcribe",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream", // Set content type for binary data
            },
            body: buffer, // Send the buffer directly
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json(); // Assume the API returns JSON
        console.log("API response:", data);

        // Store the response in state with a delay
        setTimeout(() => {
          setApiResponse(data.sentence); // Assuming the response has a 'sentence' property
        }, 500); // Delay of 0.5 seconds
      } catch (error) {
        console.error("Error sending audio to API:", error);
      }
    };

    // Process and send audio chunks every 2 seconds
    const sendAudioData = async () => {
      const blob = new Blob(chunks.current, { type: "audio/wav" });
      setAudioBlob(blob); // Save the blob to the new state

      // Convert the blob to a WAV buffer and send to the API
      const buffer = await convertToWavBuffer(blob);
      await sendAudioToApi(buffer);
    };

    // Start recording with 4-second intervals
    recorder.start(4000); // Collect audio data every 4 seconds
    setMediaRecorder(recorder);

    // Send audio data every 4 seconds
    const intervalId = setInterval(sendAudioData, 4000);

    // Stop sending audio data when recording stops
    recorder.onstop = () => {
      sendAudioData(); // Send final audio data
      clearInterval(intervalId); // Clear the interval
      console.log("Recording stopped");
    };
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (mediaRecorder) {
      mediaRecorder.stop(); // Stop the recording
    }
  };

  // Function to play the recorded audio
  const playAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  // Function to handle downloading the audio file
  const handleDownload = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recorded_audio.wav"; // Specify the file name for download
      document.body.appendChild(a);
      a.click(); // Simulate a click to download
      document.body.removeChild(a); // Remove the link from the document
      URL.revokeObjectURL(url); // Clean up the URL object
    }
  };

  return (
    <div className="app-container">
      <h1>Audio Recorder</h1>
      <div className="button-container">
        <button onClick={handleStartRecording} disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={handleStopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
        {audioBlob && ( // Show play button if audioBlob is available
          <>
            <button onClick={playAudio}>Play Recorded Audio</button>
            <button onClick={handleDownload}>Download Audio</button>{" "}
            {/* Download button */}
          </>
        )}
      </div>
      <div className="log">
        <p>
          {isRecording ? "Recording..." : "Click 'Start Recording' to begin."}
        </p>
      </div>
      {apiResponse && ( // Render the API response after delay
        <div className="api-response">
          <p>{apiResponse}</p>
        </div>
      )}
    </div>
  );
};

export default App;
