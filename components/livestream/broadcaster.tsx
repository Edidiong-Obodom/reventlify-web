"use client";

import { startBroadcasting, stopBroadcasting } from "@/lib/mediasoup/broadcast";
import React, { useRef, useState } from "react";

export default function Broadcast() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleStart = async () => {
    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_STREAMING_URL}`
    );
    socket.onopen = async () => {
      if (videoRef.current) {
        await startBroadcasting(socket, videoRef.current);
        setIsStreaming(true);
      }
    };
  };

  const handleStop = async () => {
    await stopBroadcasting();
    setIsStreaming(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">🎥 Live Broadcast</h1>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full rounded border"
      />

      <div className="mt-4 flex gap-2">
        {!isStreaming ? (
          <button
            onClick={handleStart}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Start Streaming
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Stop Streaming
          </button>
        )}
      </div>
    </div>
  );
}
