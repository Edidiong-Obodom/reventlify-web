"use client";

import {
  startBroadcasting,
  stopBroadcasting,
  getBroadcastState,
  getCurrentBroadcastState,
  forceReconnect,
} from "@/lib/mediasoup/broadcast";
import React, { useRef, useState, useEffect, useCallback } from "react";

interface BroadcastState {
  state:
    | "idle"
    | "connecting"
    | "connected"
    | "streaming"
    | "error"
    | "reconnecting";
  isActive: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  error: string | null;
  producers: string[];
  reconnectAttempts: number;
  deviceLoaded: boolean;
  transportState: string;
}

interface StreamHealth {
  overallHealth: "healthy" | "degraded" | "unhealthy";
  videoHealth: "good" | "poor" | "failed" | "none";
  audioHealth: "good" | "poor" | "failed" | "none";
  lastHealthCheck: number;
}

export default function Broadcast({
  regimeId,
}: Readonly<{ regimeId: string }>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const [broadcastState, setBroadcastState] = useState<BroadcastState>({
    state: "idle",
    isActive: false,
    hasVideo: false,
    hasAudio: false,
    error: null,
    producers: [],
    reconnectAttempts: 0,
    deviceLoaded: false,
    transportState: "disconnected",
  });

  const [streamHealth, setStreamHealth] = useState<StreamHealth>({
    overallHealth: "unhealthy",
    videoHealth: "none",
    audioHealth: "none",
    lastHealthCheck: Date.now(),
  });

  // Enhanced state update function
  const updateBroadcastState = useCallback(() => {
    const state = getBroadcastState();
    const currentState = getCurrentBroadcastState();

    setBroadcastState((prev) => ({
      ...prev,
      state: currentState,
      isActive: state.isActive,
      hasVideo: state.producers.includes("video"),
      hasAudio: state.producers.includes("audio"),
      producers: state.producers,
      reconnectAttempts: state.reconnectAttempts,
      deviceLoaded: state.deviceLoaded,
      transportState: state.transportState,
    }));

    // Update stream health
    const videoDetails = state.producerDetails.find((p) => p.kind === "video");
    const audioDetails = state.producerDetails.find((p) => p.kind === "audio");

    const videoHealth: StreamHealth["videoHealth"] = !videoDetails
      ? "none"
      : videoDetails.isHealthy && videoDetails.trackReadyState === "live"
      ? "good"
      : videoDetails.trackReadyState === "live"
      ? "poor"
      : "failed";

    const audioHealth: StreamHealth["audioHealth"] = !audioDetails
      ? "none"
      : audioDetails.isHealthy && audioDetails.trackReadyState === "live"
      ? "good"
      : audioDetails.trackReadyState === "live"
      ? "poor"
      : "failed";

    const overallHealth: StreamHealth["overallHealth"] =
      (videoHealth === "good" || videoHealth === "none") &&
      (audioHealth === "good" || audioHealth === "none")
        ? "healthy"
        : videoHealth === "poor" || audioHealth === "poor"
        ? "degraded"
        : "unhealthy";

    setStreamHealth({
      overallHealth,
      videoHealth,
      audioHealth,
      lastHealthCheck: Date.now(),
    });
  }, []);

  // Periodic state updates
  useEffect(() => {
    const interval = setInterval(updateBroadcastState, 1000);
    return () => clearInterval(interval);
  }, [updateBroadcastState]);

  // Enhanced error handling
  const handleError = (error: string) => {
    console.error("❌ Broadcast error:", error);
    setBroadcastState((prev) => ({
      ...prev,
      error,
      state: "error",
    }));
  };

  const clearError = () => {
    setBroadcastState((prev) => ({ ...prev, error: null }));
  };

  // Start broadcasting with enhanced error handling
  const handleStart = async () => {
    if (isInitializing) return;

    try {
      setIsInitializing(true);
      clearError();

      setBroadcastState((prev) => ({
        ...prev,
        state: "connecting",
      }));

      // Create WebSocket connection
      const socket = new WebSocket(`${process.env.NEXT_PUBLIC_STREAMING_URL}`);
      socketRef.current = socket;

      // Enhanced WebSocket error handling
      socket.onerror = (e) => {
        console.error("❌ WebSocket error:", e);
        handleError("WebSocket connection failed");
        setIsInitializing(false);
      };

      socket.onclose = (event) => {
        console.log("🔌 WebSocket connection closed", event.code, event.reason);

        if (broadcastState.state === "streaming" && event.code !== 1000) {
          // Unexpected closure during streaming
          setBroadcastState((prev) => ({
            ...prev,
            state: "reconnecting",
          }));
        } else {
          setBroadcastState((prev) => ({
            ...prev,
            state: "idle",
            isActive: false,
            hasVideo: false,
            hasAudio: false,
          }));
        }
        setIsInitializing(false);
      };

      socket.onopen = async () => {
        try {
          console.log("✅ WebSocket connected");
          setBroadcastState((prev) => ({ ...prev, state: "connected" }));

          if (videoRef.current) {
            await startBroadcasting(socket, regimeId, videoRef.current);

            // Wait for producers to be created
            setTimeout(() => {
              const state = getBroadcastState();
              const stream = videoRef.current?.srcObject as MediaStream;

              setBroadcastState((prev) => ({
                ...prev,
                state: state.isActive ? "streaming" : "connected",
                isActive: state.isActive,
                hasVideo:
                  state.producers.includes("video") &&
                  stream?.getVideoTracks().length > 0,
                hasAudio:
                  state.producers.includes("audio") &&
                  stream?.getAudioTracks().length > 0,
              }));

              setIsInitializing(false);
            }, 3000);
          }
        } catch (error) {
          console.error("❌ Failed to start broadcasting:", error);
          handleError(
            `Failed to start broadcasting: ${(error as Error).message}`
          );
          setIsInitializing(false);
        }
      };
    } catch (error) {
      console.error("❌ Failed to create WebSocket:", error);
      handleError(`Failed to create connection: ${(error as Error).message}`);
      setIsInitializing(false);
    }
  };

  // Stop broadcasting with cleanup
  const handleStop = async () => {
    try {
      await stopBroadcasting();

      if (socketRef.current) {
        socketRef.current.close(1000, "Manual stop");
        socketRef.current = null;
      }

      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setBroadcastState({
        state: "idle",
        isActive: false,
        hasVideo: false,
        hasAudio: false,
        error: null,
        producers: [],
        reconnectAttempts: 0,
        deviceLoaded: false,
        transportState: "disconnected",
      });

      setStreamHealth({
        overallHealth: "unhealthy",
        videoHealth: "none",
        audioHealth: "none",
        lastHealthCheck: Date.now(),
      });
    } catch (error) {
      console.error("❌ Failed to stop broadcasting:", error);
      handleError(`Failed to stop broadcasting: ${(error as Error).message}`);
    }
  };

  // Force restart
  const handleRestart = async () => {
    if (!videoRef.current) return;

    clearError();
    setBroadcastState((prev) => ({ ...prev, state: "reconnecting" }));

    await handleStop();

    setTimeout(() => {
      forceReconnect(regimeId, videoRef.current || undefined);

      setTimeout(() => {
        updateBroadcastState();
      }, 2000);
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (broadcastState.isActive) {
        stopBroadcasting();
      }
    };
  }, []); // Only run on unmount

  // Get status colors and icons
  const getStateColor = () => {
    switch (broadcastState.state) {
      case "streaming":
        return "bg-green-800 text-green-200";
      case "connected":
        return "bg-blue-800 text-blue-200";
      case "connecting":
        return "bg-yellow-800 text-yellow-200";
      case "reconnecting":
        return "bg-orange-800 text-orange-200";
      case "error":
        return "bg-red-800 text-red-200";
      default:
        return "bg-gray-800 text-gray-200";
    }
  };

  const getStateIcon = () => {
    switch (broadcastState.state) {
      case "streaming":
        return "🟢";
      case "connected":
        return "🔵";
      case "connecting":
        return "🟡";
      case "reconnecting":
        return "🟠";
      case "error":
        return "🔴";
      default:
        return "⚫";
    }
  };

  const getHealthColor = () => {
    switch (streamHealth.overallHealth) {
      case "healthy":
        return "bg-green-800 text-green-200";
      case "degraded":
        return "bg-yellow-800 text-yellow-200";
      default:
        return "bg-red-800 text-red-200";
    }
  };

  const getHealthIcon = () => {
    switch (streamHealth.overallHealth) {
      case "healthy":
        return "💚";
      case "degraded":
        return "💛";
      default:
        return "❤️";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🎥 Live Broadcast Studio</h1>

      {/* Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Connection Status */}
        <div className={`px-4 py-3 rounded-lg ${getStateColor()}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{getStateIcon()}</span>
            <span className="font-semibold">Connection</span>
          </div>
          <div className="text-sm capitalize">{broadcastState.state}</div>
          {broadcastState.reconnectAttempts > 0 && (
            <div className="text-xs mt-1">
              Attempt: {broadcastState.reconnectAttempts}/5
            </div>
          )}
        </div>

        {/* Stream Health */}
        <div className={`px-4 py-3 rounded-lg ${getHealthColor()}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{getHealthIcon()}</span>
            <span className="font-semibold">Stream Health</span>
          </div>
          <div className="text-sm capitalize">{streamHealth.overallHealth}</div>
        </div>

        {/* Video Status */}
        <div
          className={`px-4 py-3 rounded-lg ${
            broadcastState.hasVideo
              ? "bg-purple-800 text-purple-200"
              : "bg-gray-800 text-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📹</span>
            <span className="font-semibold">Video</span>
          </div>
          <div className="text-sm">
            {broadcastState.hasVideo
              ? `Active (${streamHealth.videoHealth})`
              : "Inactive"}
          </div>
        </div>

        {/* Audio Status */}
        <div
          className={`px-4 py-3 rounded-lg ${
            broadcastState.hasAudio
              ? "bg-orange-800 text-orange-200"
              : "bg-gray-800 text-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎵</span>
            <span className="font-semibold">Audio</span>
          </div>
          <div className="text-sm">
            {broadcastState.hasAudio
              ? `Active (${streamHealth.audioHealth})`
              : "Inactive"}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {broadcastState.error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">⚠️</span>
                <strong>Error</strong>
              </div>
              <div className="text-sm">{broadcastState.error}</div>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Video Preview */}
      <div className="relative mb-6">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-w-4xl rounded-lg border border-gray-600 bg-gray-900 mx-auto"
          style={{ minHeight: "400px" }}
        />

        {/* Overlay when not streaming */}
        {!broadcastState.hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">📹</div>
              <div className="text-xl text-gray-400 mb-2">
                {broadcastState.state === "streaming"
                  ? "Starting video..."
                  : "Camera preview will appear here"}
              </div>
              {broadcastState.state === "idle" && (
                <div className="text-sm text-gray-500">
                  Click "Start Streaming" to begin
                </div>
              )}
            </div>
          </div>
        )}

        {/* Broadcasting Indicator */}
        {broadcastState.state === "streaming" && (
          <div className="absolute top-4 left-4">
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {!broadcastState.isActive ? (
          <button
            onClick={handleStart}
            disabled={isInitializing || broadcastState.state === "connecting"}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2"
          >
            {isInitializing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Starting...
              </>
            ) : (
              <>▶️ Start Streaming</>
            )}
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2"
          >
            ⏹️ Stop Streaming
          </button>
        )}

        {/* Restart Button */}
        <button
          onClick={handleRestart}
          disabled={broadcastState.state === "idle"}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2"
        >
          🔄 Restart Stream
        </button>

        {/* Clear Error Button */}
        {broadcastState.error && (
          <button
            onClick={clearError}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2"
          >
            ✨ Clear Error
          </button>
        )}
      </div>

      {/* Advanced Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Stats */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-300">
            📊 Technical Stats
          </h3>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-gray-400">Regime ID:</span>
              <span className="text-blue-300">{regimeId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transport State:</span>
              <span
                className={
                  broadcastState.transportState === "connected"
                    ? "text-green-300"
                    : broadcastState.transportState === "connecting"
                    ? "text-yellow-300"
                    : "text-red-300"
                }
              >
                {broadcastState.transportState}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Device Loaded:</span>
              <span
                className={
                  broadcastState.deviceLoaded
                    ? "text-green-300"
                    : "text-red-300"
                }
              >
                {broadcastState.deviceLoaded ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Producers:</span>
              <span className="text-green-300">
                {broadcastState.producers.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Health Check:</span>
              <span className="text-gray-300">
                {new Date(streamHealth.lastHealthCheck).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Stream Quality */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-300">
            🎯 Stream Quality
          </h3>
          <div className="space-y-3">
            {/* Video Quality */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">Video Quality</span>
                <span
                  className={`text-sm font-semibold ${
                    streamHealth.videoHealth === "good"
                      ? "text-green-300"
                      : streamHealth.videoHealth === "poor"
                      ? "text-yellow-300"
                      : streamHealth.videoHealth === "failed"
                      ? "text-red-300"
                      : "text-gray-400"
                  }`}
                >
                  {streamHealth.videoHealth === "none"
                    ? "Not Active"
                    : streamHealth.videoHealth.toUpperCase()}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    streamHealth.videoHealth === "good"
                      ? "bg-green-500 w-full"
                      : streamHealth.videoHealth === "poor"
                      ? "bg-yellow-500 w-2/3"
                      : streamHealth.videoHealth === "failed"
                      ? "bg-red-500 w-1/3"
                      : "bg-gray-600 w-0"
                  }`}
                ></div>
              </div>
            </div>

            {/* Audio Quality */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">Audio Quality</span>
                <span
                  className={`text-sm font-semibold ${
                    streamHealth.audioHealth === "good"
                      ? "text-green-300"
                      : streamHealth.audioHealth === "poor"
                      ? "text-yellow-300"
                      : streamHealth.audioHealth === "failed"
                      ? "text-red-300"
                      : "text-gray-400"
                  }`}
                >
                  {streamHealth.audioHealth === "none"
                    ? "Not Active"
                    : streamHealth.audioHealth.toUpperCase()}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    streamHealth.audioHealth === "good"
                      ? "bg-green-500 w-full"
                      : streamHealth.audioHealth === "poor"
                      ? "bg-yellow-500 w-2/3"
                      : streamHealth.audioHealth === "failed"
                      ? "bg-red-500 w-1/3"
                      : "bg-gray-600 w-0"
                  }`}
                ></div>
              </div>
            </div>

            {/* Overall Health */}
            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Overall Health</span>
                <span
                  className={`text-sm font-semibold ${
                    streamHealth.overallHealth === "healthy"
                      ? "text-green-300"
                      : streamHealth.overallHealth === "degraded"
                      ? "text-yellow-300"
                      : "text-red-300"
                  }`}
                >
                  {streamHealth.overallHealth.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Information */}
      <div className="mt-6 bg-gray-900 p-4 rounded-lg">
        <details className="cursor-pointer">
          <summary className="text-lg font-semibold text-gray-300 mb-3">
            🐛 Debug Information (Click to expand)
          </summary>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <div className="text-gray-400 mb-2">Connection Details:</div>
              <div className="space-y-1">
                <div>
                  WebSocket State:{" "}
                  <span className="text-blue-300">
                    {socketRef.current
                      ? ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][
                          socketRef.current.readyState
                        ]
                      : "Not Connected"}
                  </span>
                </div>
                <div>
                  Streaming URL:{" "}
                  <span className="text-blue-300 break-all">
                    {process.env.NEXT_PUBLIC_STREAMING_URL}
                  </span>
                </div>
                <div>
                  Broadcast State:{" "}
                  <span className="text-green-300">{broadcastState.state}</span>
                </div>
                <div>
                  Is Active:{" "}
                  <span
                    className={
                      broadcastState.isActive
                        ? "text-green-300"
                        : "text-red-300"
                    }
                  >
                    {broadcastState.isActive ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-gray-400 mb-2">Producer Details:</div>
              <div className="space-y-1">
                <div>
                  Video Producer:{" "}
                  <span
                    className={
                      broadcastState.hasVideo
                        ? "text-green-300"
                        : "text-red-300"
                    }
                  >
                    {broadcastState.hasVideo ? "✅ Active" : "❌ Inactive"}
                  </span>
                </div>
                <div>
                  Audio Producer:{" "}
                  <span
                    className={
                      broadcastState.hasAudio
                        ? "text-green-300"
                        : "text-red-300"
                    }
                  >
                    {broadcastState.hasAudio ? "✅ Active" : "❌ Inactive"}
                  </span>
                </div>
                <div>
                  Total Producers:{" "}
                  <span className="text-blue-300">
                    {broadcastState.producers.length}
                  </span>
                </div>
                <div>
                  Reconnect Attempts:{" "}
                  <span className="text-orange-300">
                    {broadcastState.reconnectAttempts}/5
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Media Stream Debug */}
          {videoRef.current?.srcObject && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-gray-400 mb-2">Media Stream Details:</div>
              <div className="text-xs space-y-1">
                <div>
                  Stream ID:{" "}
                  <span className="text-blue-300">
                    {(videoRef.current.srcObject as MediaStream).id}
                  </span>
                </div>
                <div>
                  Stream Active:{" "}
                  <span
                    className={
                      (videoRef.current.srcObject as MediaStream).active
                        ? "text-green-300"
                        : "text-red-300"
                    }
                  >
                    {(videoRef.current.srcObject as MediaStream).active
                      ? "Yes"
                      : "No"}
                  </span>
                </div>
                <div>
                  Total Tracks:{" "}
                  <span className="text-green-300">
                    {
                      (videoRef.current.srcObject as MediaStream).getTracks()
                        .length
                    }
                  </span>
                </div>
                {(videoRef.current.srcObject as MediaStream)
                  .getTracks()
                  .map((track, index) => (
                    <div key={track.id} className="ml-4">
                      Track {index + 1} ({track.kind}):{" "}
                      <span
                        className={
                          track.readyState === "live"
                            ? "text-green-300"
                            : "text-red-300"
                        }
                      >
                        {track.readyState} -{" "}
                        {track.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </details>
      </div>
    </div>
  );
}
