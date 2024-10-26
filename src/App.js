import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [apiResponse, setApiResponse] = useState("");
  const [transcriptId, setTranscriptId] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const chunks = useRef([]);

  useEffect(() => {
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaRecorder]);

  // Function to convert audio blob to a buffer
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

  const sendAudioToApi = async (buffer) => {
    try {
      const uploadResponse = await fetch(
        "https://api.assemblyai.com/v2/upload",
        {
          method: "POST",
          headers: {
            Authorization: "3bd323637ef9464d9bdc1c33416ca934",
            "Content-Type": "application/octet-stream",
          },
          body: buffer,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload audio. Please check your API key.");
      }

      const uploadData = await uploadResponse.json();
      const uploadUrl = uploadData.upload_url;

      // Step 2: Request transcription
      setIsTranscribing(true);
      const transcriptResponse = await fetch(
        "https://api.assemblyai.com/v2/transcript",
        {
          method: "POST",
          headers: {
            Authorization: "3bd323637ef9464d9bdc1c33416ca934",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audio_url: uploadUrl }),
        }
      );

      if (!transcriptResponse.ok) {
        throw new Error("Error starting transcription.");
      }

      const transcriptData = await transcriptResponse.json();
      setTranscriptId(transcriptData.id);
      pollTranscription(transcriptData.id);
    } catch (error) {
      console.error("Error sending audio to API:", error);
      setIsTranscribing(false);
    }
  };

  const pollTranscription = (id) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await fetch(
          `https://api.assemblyai.com/v2/transcript/${id}`,
          {
            headers: {
              Authorization: "3bd323637ef9464d9bdc1c33416ca934",
            },
          }
        );

        const statusData = await statusResponse.json();

        if (statusData.status === "completed") {
          clearInterval(interval);
          setIsTranscribing(false);
          setApiResponse(statusData.text); // Set the transcribed text
        } else if (statusData.status === "failed") {
          clearInterval(interval); // Stop polling
          console.error("Transcription failed:", statusData);
          setIsTranscribing(false);
        }
      } catch (error) {
        console.error("Error polling transcription status:", error);
        setIsTranscribing(false); // Stop loading on error
      }
    }, 5000); // Poll every 5 seconds
  };

  const handleStartRecording = async () => {
    setIsRecording(true);
    chunks.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = async (e) => {
      chunks.current.push(e.data);

      const buffer = await convertToWavBuffer(e.data);
      await sendAudioToApi(buffer);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks.current, { type: "audio/wav" });
      setAudioBlob(blob);
    };

    recorder.start();
    setMediaRecorder(recorder);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  const playAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const handleDownload = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recorded_audio.wav";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
        {audioBlob && (
          <>
            <button onClick={playAudio}>Play Recorded Audio</button>
            <button onClick={handleDownload}>Download Audio</button>
          </>
        )}
      </div>
      <div className="log">
        <p>
          {isRecording ? "Recording..." : "Click 'Start Recording' to begin."}
        </p>
      </div>
      {isTranscribing && (
        <div className="loader">
          <p style={{ color: "#000", fontSize: "20px", fontWeight: "bold" }}>
            Transcribing...
          </p>{" "}
          {/* Loader for transcription */}
        </div>
      )}
      {apiResponse && (
        <div className="api-response">
          <h2>Transcription:</h2>
          <p style={{ color: "#000", fontSize: "16px" }}>{apiResponse}</p>{" "}
        </div>
      )}
    </div>
  );
};

export default App;
