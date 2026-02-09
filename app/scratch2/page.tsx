"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function CameraTestPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebug = (msg: string) => {
    console.log(msg);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const handleCamera = async () => {
    addDebug("Camera button clicked");
    try {
      addDebug("Requesting camera access...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user", // Try front camera first for testing
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      addDebug(`Got media stream with ${mediaStream.getVideoTracks().length} video tracks`);
      
      setStream(mediaStream);
      setShowCamera(true);
      
      // Wait a moment for React to render the video element
      setTimeout(() => {
        if (videoRef.current) {
          addDebug("Attaching stream to video element");
          videoRef.current.srcObject = mediaStream;
          
          videoRef.current.onloadedmetadata = () => {
            addDebug(`Video metadata loaded: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`);
          };
          
          videoRef.current.onplay = () => {
            addDebug("Video started playing");
          };
          
          videoRef.current.play()
            .then(() => addDebug("Video play() succeeded"))
            .catch(err => addDebug(`Video play() failed: ${err.message}`));
        } else {
          addDebug("ERROR: videoRef.current is null!");
        }
      }, 200);
    } catch (error) {
      const err = error as Error;
      addDebug(`ERROR: ${err.name} - ${err.message}`);
      alert("Could not access camera: " + err.message);
    }
  };

  const capturePhoto = () => {
    addDebug("Capture button clicked");
    
    if (!videoRef.current) {
      addDebug("ERROR: No video element");
      alert("No video element");
      return;
    }

    const video = videoRef.current;
    addDebug(`Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
    addDebug(`Video readyState: ${video.readyState}`);
    addDebug(`Video paused: ${video.paused}`);

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      addDebug("ERROR: Video dimensions are 0");
      alert("Video not ready yet. Please wait a moment and try again.");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      addDebug(`Canvas created: ${canvas.width}x${canvas.height}`);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        addDebug("ERROR: Could not get canvas context");
        alert("Failed to create canvas context");
        return;
      }

      ctx.drawImage(video, 0, 0);
      addDebug("Drew image to canvas");

      const base64 = canvas.toDataURL("image/jpeg", 0.9);
      addDebug(`Created base64 image, length: ${base64.length}`);
      
      setCapturedImage(base64);
      addDebug("Image captured successfully!");
    } catch (error) {
      const err = error as Error;
      addDebug(`ERROR during capture: ${err.message}`);
      alert("Error capturing: " + err.message);
    }
  };

  const closeCamera = () => {
    addDebug("Closing camera");
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        addDebug(`Stopped track: ${track.kind}`);
      });
      setStream(null);
    }
    setShowCamera(false);
  };

  const clearImage = () => {
    setCapturedImage(null);
    addDebug("Cleared captured image");
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Camera Capture Debug Test</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Controls</h2>
          <div className="flex gap-2">
            <button
              onClick={handleCamera}
              disabled={showCamera}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 px-4 py-2 rounded text-white"
            >
              Start Camera
            </button>
            <button
              onClick={capturePhoto}
              disabled={!showCamera}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 px-4 py-2 rounded text-white"
            >
              Capture Photo
            </button>
            <button
              onClick={closeCamera}
              disabled={!showCamera}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 px-4 py-2 rounded text-white"
            >
              Close Camera
            </button>
            <button
              onClick={clearImage}
              disabled={!capturedImage}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 px-4 py-2 rounded text-white"
            >
              Clear Image
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Camera View */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Camera View</h2>
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
              {showCamera ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  Click "Start Camera" to begin
                </div>
              )}
            </div>
          </div>

          {/* Captured Image */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Captured Image</h2>
            <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
              {capturedImage ? (
                <Image
                  src={capturedImage}
                  alt="Captured"
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No image captured yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Debug Log */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Debug Log</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {debugInfo.length === 0 ? (
              <div className="text-gray-500">No debug messages yet...</div>
            ) : (
              debugInfo.map((msg, idx) => (
                <div key={idx} className="mb-1">
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6">
          <a href="/" className="text-blue-600 underline">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
