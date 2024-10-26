// import React, { useState, useEffect, useRef } from "react";
// import "./App.css"; // Import CSS file for styles

// const App = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [audioBlob, setAudioBlob] = useState(null); // New state for the audio blob
//   const [apiResponse, setApiResponse] = useState(""); // New state for API response
//   const chunks = useRef([]);

//   useEffect(() => {
//     // Cleanup on unmount
//     return () => {
//       if (mediaRecorder) {
//         mediaRecorder.stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, [mediaRecorder]);

//   const handleStartRecording = async () => {
//     setIsRecording(true);
//     chunks.current = []; // Clear chunks on start

//     // Request access to the microphone
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//     // Create a MediaRecorder instance
//     const recorder = new MediaRecorder(stream);

//     // Collect data chunks
//     recorder.ondataavailable = (e) => {
//       chunks.current.push(e.data);
//     };

//     // Function to convert audio blob to WAV buffer
//     const convertToWavBuffer = (audioBlob) => {
//       return new Promise((resolve) => {
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           const arrayBuffer = reader.result;
//           const buffer = new Uint8Array(arrayBuffer);
//           resolve(buffer);
//         };
//         reader.readAsArrayBuffer(audioBlob);
//       });
//     };

//     // Function to send audio data to the API
//     const sendAudioToApi = async (buffer) => {
//       try {
//         const response = await fetch(
//           "https://82c5-34-173-137-208.ngrok-free.app/transcribe",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/octet-stream", // Set content type for binary data
//             },
//             body: buffer, // Send the buffer directly
//           }
//         );

//         if (!response.ok) {
//           throw new Error("Network response was not ok");
//         }

//         const data = await response.json(); // Assume the API returns JSON
//         console.log("API response:", data);

//         // Store the response in state with a delay
//         setTimeout(() => {
//           setApiResponse(data.sentence); // Assuming the response has a 'sentence' property
//         }, 500); // Delay of 0.5 seconds
//       } catch (error) {
//         console.error("Error sending audio to API:", error);
//       }
//     };

//     // Process and send audio chunks every 2 seconds
//     const sendAudioData = async () => {
//       const blob = new Blob(chunks.current, { type: "audio/wav" });
//       setAudioBlob(blob); // Save the blob to the new state

//       // Convert the blob to a WAV buffer and send to the API
//       const buffer = await convertToWavBuffer(blob);
//       await sendAudioToApi(buffer);
//     };

//     // Start recording with 4-second intervals
//     recorder.start(4000); // Collect audio data every 4 seconds
//     setMediaRecorder(recorder);

//     // Send audio data every 4 seconds
//     const intervalId = setInterval(sendAudioData, 4000);

//     // Stop sending audio data when recording stops
//     recorder.onstop = () => {
//       sendAudioData(); // Send final audio data
//       clearInterval(intervalId); // Clear the interval
//       console.log("Recording stopped");
//     };
//   };

//   const handleStopRecording = () => {
//     setIsRecording(false);
//     if (mediaRecorder) {
//       mediaRecorder.stop(); // Stop the recording
//     }
//   };

//   // Function to play the recorded audio
//   const playAudio = () => {
//     if (audioBlob) {
//       const audioUrl = URL.createObjectURL(audioBlob);
//       const audio = new Audio(audioUrl);
//       audio.play();
//     }
//   };

//   // Function to handle downloading the audio file
//   const handleDownload = () => {
//     if (audioBlob) {
//       const url = URL.createObjectURL(audioBlob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "recorded_audio.wav"; // Specify the file name for download
//       document.body.appendChild(a);
//       a.click(); // Simulate a click to download
//       document.body.removeChild(a); // Remove the link from the document
//       URL.revokeObjectURL(url); // Clean up the URL object
//     }
//   };

//   return (
//     <div className="app-container">
//       <h1>Audio Recorder</h1>
//       <div className="button-container">
//         <button onClick={handleStartRecording} disabled={isRecording}>
//           Start Recording
//         </button>
//         <button onClick={handleStopRecording} disabled={!isRecording}>
//           Stop Recording
//         </button>
//         {audioBlob && ( // Show play button if audioBlob is available
//           <>
//             <button onClick={playAudio}>Play Recorded Audio</button>
//             <button onClick={handleDownload}>Download Audio</button>{" "}
//             {/* Download button */}
//           </>
//         )}
//       </div>
//       <div className="log">
//         <p>
//           {isRecording ? "Recording..." : "Click 'Start Recording' to begin."}
//         </p>
//       </div>
//       {apiResponse && ( // Render the API response after delay
//         <div className="api-response">
//           <p>{apiResponse}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;

// import React, { useState, useEffect, useRef } from "react";
// import "./App.css"; // Import CSS file for styles

// const App = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [audioBlob, setAudioBlob] = useState(null);
//   const [apiResponse, setApiResponse] = useState(""); // State to hold real-time transcription
//   const chunks = useRef([]);

//   useEffect(() => {
//     return () => {
//       if (mediaRecorder) {
//         mediaRecorder.stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, [mediaRecorder]);

//   // Function to convert audio blob to a buffer
//   const convertToWavBuffer = (audioBlob) => {
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const arrayBuffer = reader.result;
//         const buffer = new Uint8Array(arrayBuffer);
//         resolve(buffer);
//       };
//       reader.readAsArrayBuffer(audioBlob);
//     });
//   };

//   // Function to send audio to the API
//   const sendAudioToApi = async (buffer) => {
//     try {
//       // Step 1: Upload the audio file to AssemblyAI
//       const uploadResponse = await fetch(
//         "https://api.assemblyai.com/v2/upload",
//         {
//           method: "POST",
//           headers: {
//             Authorization: "3bd323637ef9464d9bdc1c33416ca934", // Replace with your AssemblyAI API key
//             "Content-Type": "application/octet-stream",
//           },
//           body: buffer,
//         }
//       );

//       if (!uploadResponse.ok) {
//         throw new Error("Failed to upload audio. Please check your API key.");
//       }

//       const uploadData = await uploadResponse.json();
//       const uploadUrl = uploadData.upload_url;

//       // Step 2: Request transcription
//       const transcriptResponse = await fetch(
//         "https://api.assemblyai.com/v2/transcript",
//         {
//           method: "POST",
//           headers: {
//             Authorization: "3bd323637ef9464d9bdc1c33416ca934", // Replace with your AssemblyAI API key
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ audio_url: uploadUrl }),
//         }
//       );

//       if (!transcriptResponse.ok) {
//         throw new Error("Error starting transcription.");
//       }

//       const transcriptData = await transcriptResponse.json();
//       const transcriptId = transcriptData.id;

//       // Step 3: Poll for the transcription result
//       const pollTranscription = async () => {
//         try {
//           const statusResponse = await fetch(
//             `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
//             {
//               headers: {
//                 Authorization: "3bd323637ef9464d9bdc1c33416ca934", // Replace with your AssemblyAI API key
//               },
//             }
//           );

//           const statusData = await statusResponse.json();

//           if (statusData.status === "completed") {
//             setApiResponse(statusData.text); // Set the transcribed text
//           } else if (statusData.status === "processing") {
//             setTimeout(pollTranscription, 1000); // Poll every second for real-time updates
//           } else {
//             console.error("Transcription failed:", statusData);
//           }
//         } catch (error) {
//           console.error("Error polling transcription status:", error);
//         }
//       };

//       // Start polling for real-time transcription
//       pollTranscription();
//     } catch (error) {
//       console.error("Error sending audio to API:", error);
//     }
//   };

//   const handleStartRecording = async () => {
//     setIsRecording(true);
//     chunks.current = [];

//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const recorder = new MediaRecorder(stream);

//     recorder.ondataavailable = (e) => {
//       chunks.current.push(e.data);
//     };

//     recorder.onstop = async () => {
//       const blob = new Blob(chunks.current, { type: "audio/wav" });
//       setAudioBlob(blob);

//       const buffer = await convertToWavBuffer(blob);
//       await sendAudioToApi(buffer); // Send the audio data to API
//     };

//     recorder.start();
//     setMediaRecorder(recorder);
//   };

//   const handleStopRecording = () => {
//     setIsRecording(false);
//     if (mediaRecorder) {
//       mediaRecorder.stop(); // Stop recording will trigger onstop event
//     }
//   };

//   const playAudio = () => {
//     if (audioBlob) {
//       const audioUrl = URL.createObjectURL(audioBlob);
//       const audio = new Audio(audioUrl);
//       audio.play();
//     }
//   };

//   const handleDownload = () => {
//     if (audioBlob) {
//       const url = URL.createObjectURL(audioBlob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "recorded_audio.wav";
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     }
//   };

//   return (
//     <div className="app-container">
//       <h1>Audio Recorder</h1>
//       <div className="button-container">
//         <button onClick={handleStartRecording} disabled={isRecording}>
//           Start Recording
//         </button>
//         <button onClick={handleStopRecording} disabled={!isRecording}>
//           Stop Recording
//         </button>
//         {audioBlob && (
//           <>
//             <button onClick={playAudio}>Play Recorded Audio</button>
//             <button onClick={handleDownload}>Download Audio</button>
//           </>
//         )}
//       </div>
//       <div className="log">
//         <p>
//           {isRecording ? "Recording..." : "Click 'Start Recording' to begin."}
//         </p>
//       </div>
//       {apiResponse && (
//         <div className="api-response">
//           <p style={{ color: "#000", fontSize: "20px", fontWeight: "bold" }}>
//             {apiResponse}
//           </p>{" "}
//           {/* Render the real-time transcription here */}
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;

import React, { useState, useEffect, useRef } from "react";
import "./App.css"; // Import CSS file for styles

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [apiResponse, setApiResponse] = useState(""); // State to hold real-time transcription
  const [transcriptId, setTranscriptId] = useState(null); // State to hold the transcript ID for polling
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

  // Function to send audio to the API
  const sendAudioToApi = async (buffer) => {
    try {
      // Step 1: Upload the audio file to AssemblyAI
      const uploadResponse = await fetch(
        "https://api.assemblyai.com/v2/upload",
        {
          method: "POST",
          headers: {
            Authorization: "3bd323637ef9464d9bdc1c33416ca934", // Replace with your AssemblyAI API key
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
      const transcriptResponse = await fetch(
        "https://api.assemblyai.com/v2/transcript",
        {
          method: "POST",
          headers: {
            Authorization: "3bd323637ef9464d9bdc1c33416ca934", // Replace with your AssemblyAI API key
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audio_url: uploadUrl }),
        }
      );

      if (!transcriptResponse.ok) {
        throw new Error("Error starting transcription.");
      }

      const transcriptData = await transcriptResponse.json();
      setTranscriptId(transcriptData.id); // Store the transcript ID for polling
      pollTranscription(transcriptData.id); // Start polling for real-time transcription
    } catch (error) {
      console.error("Error sending audio to API:", error);
    }
  };

  // Function to poll for transcription result
  const pollTranscription = (id) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await fetch(
          `https://api.assemblyai.com/v2/transcript/${id}`,
          {
            headers: {
              Authorization: "3bd323637ef9464d9bdc1c33416ca934", // Replace with your AssemblyAI API key
            },
          }
        );

        const statusData = await statusResponse.json();

        if (statusData.status === "completed") {
          clearInterval(interval); // Stop polling
          setApiResponse(statusData.text); // Set the transcribed text
        } else if (statusData.status === "failed") {
          clearInterval(interval); // Stop polling
          console.error("Transcription failed:", statusData);
        }
      } catch (error) {
        console.error("Error polling transcription status:", error);
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

      // Convert the chunk to a buffer and send it to the API
      const buffer = await convertToWavBuffer(e.data);
      await sendAudioToApi(buffer); // Send the audio data to API
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
      mediaRecorder.stop(); // Stop recording will trigger onstop event
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
      {apiResponse && (
        <div className="api-response">
          <h2>Transcription:</h2>
          <p>{apiResponse}</p> {/* Render the real-time transcription here */}
        </div>
      )}
    </div>
  );
};

export default App;
