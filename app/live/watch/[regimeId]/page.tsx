"use client";

import { useEffect, useRef, useState } from "react";
import {
  startViewing,
  stopViewing,
  getViewerState,
  getConnectionState,
  forceReconnect,
} from "@/lib/mediasoup/viewer";
import { useParams } from "next/navigation";

interface VideoState {
  isPlaying: boolean;
  isMuted: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  isBuffering: boolean;
  dimensions: { width: number; height: number } | null;
}

interface ConnectionInfo {
  state: string;
  consumers: number;
  trackCount: number;
  transportState: string;
  lastUpdate: number;
}

export default function WatchPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { regimeId } = useParams() as { regimeId: string };
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    isMuted: true,
    hasVideo: false,
    hasAudio: false,
    isBuffering: false,
    dimensions: null,
  });

  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    state: "idle",
    consumers: 0,
    trackCount: 0,
    transportState: "disconnected",
    lastUpdate: Date.now(),
  });

  // Enhanced video state tracking
  const updateVideoState = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const stream = video.srcObject as MediaStream;

    const newState: VideoState = {
      isPlaying: !video.paused && !video.ended && video.readyState > 2,
      isMuted: video.muted,
      hasVideo: stream ? stream.getVideoTracks().length > 0 : false,
      hasAudio: stream ? stream.getAudioTracks().length > 0 : false,
      isBuffering: video.readyState < 3 && !video.paused,
      dimensions:
        video.videoWidth > 0
          ? {
              width: video.videoWidth,
              height: video.videoHeight,
            }
          : null,
    };

    setVideoState(newState);
  };

  // Connection state tracking
  const updateConnectionInfo = () => {
    const state = getViewerState();
    const connectionState = getConnectionState();

    setConnectionInfo({
      state: connectionState,
      consumers: state.consumers.length,
      trackCount: state.trackCount,
      transportState: state.transportState,
      lastUpdate: Date.now(),
    });
  };

  // Setup video element event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      console.log("📍 Video load start");
      updateVideoState();
    };

    const handleLoadedMetadata = () => {
      console.log("✅ Metadata loaded");
      console.log("📐 Video dimensions:", {
        width: video.videoWidth,
        height: video.videoHeight,
      });
      updateVideoState();
    };

    const handleLoadedData = () => {
      console.log("📊 Video data loaded");
      updateVideoState();
    };

    const handleCanPlay = () => {
      console.log("✅ Video can play");
      updateVideoState();
    };

    const handlePlaying = () => {
      console.log("🎥 Video is playing");
      setError(null); // Clear error when video starts playing
      updateVideoState();
    };

    const handlePlay = () => {
      console.log("▶️ Play event triggered");
      updateVideoState();
    };

    const handlePause = () => {
      console.log("⏸️ Video paused");
      updateVideoState();
    };

    const handleWaiting = () => {
      console.log("⏳ Video waiting/buffering");
      updateVideoState();
    };

    const handleTimeUpdate = () => {
      // Only update state if buffering state might have changed
      if (videoState.isBuffering !== (video.readyState < 3 && !video.paused)) {
        updateVideoState();
      }
    };

    const handleVolumeChange = () => {
      console.log("🔊 Volume changed, muted:", video.muted);
      updateVideoState();
    };

    const handleError = (e: Event) => {
      const errorMsg = `Video playback error: ${
        video.error?.message || "Unknown error"
      }`;
      console.error("❌ Video error:", errorMsg);
      setError(errorMsg);
      updateVideoState();
    };

    const handleStalled = () => {
      console.warn("⚠️ Video playback stalled");
      updateVideoState();
    };

    const handleEmptied = () => {
      console.log("🗑️ Video emptied");
      updateVideoState();
    };

    // Add all event listeners
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("error", handleError);
    video.addEventListener("stalled", handleStalled);
    video.addEventListener("emptied", handleEmptied);

    // Cleanup
    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("error", handleError);
      video.removeEventListener("stalled", handleStalled);
      video.removeEventListener("emptied", handleEmptied);
    };
  }, [videoState.isBuffering]); // Include dependency to avoid stale closure

  // Start viewing when component mounts or regimeId changes
  useEffect(() => {
    if (videoRef.current && regimeId && !isInitialized) {
      console.log("🎯 Starting viewer for regime:", regimeId);
      setError(null);
      setIsInitialized(true);

      startViewing(videoRef.current, regimeId).catch((error) => {
        console.error("❌ Failed to start viewing:", error);
        setError(`Failed to start viewing: ${error.message}`);
        setIsInitialized(false);
      });
    }

    return () => {
      if (isInitialized) {
        console.log("🧹 Cleaning up viewer");
        stopViewing();
        setIsInitialized(false);
      }
    };
  }, [regimeId]); // Remove isInitialized from deps to avoid re-initialization

  // Periodic state updates
  useEffect(() => {
    const interval = setInterval(() => {
      updateVideoState();
      updateConnectionInfo();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle user interactions
  const handleUnmute = async () => {
    if (!videoRef.current) return;

    try {
      // First ensure all tracks are enabled
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getAudioTracks().forEach(track => {
          track.enabled = true;
          console.log("🔊 Enabled audio track:", track.id);
        });
        stream.getVideoTracks().forEach(track => {
          track.enabled = true;
          console.log("📹 Enabled video track:", track.id);
        });
      }

      // Then unmute the video element and play
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0; // Ensure volume is at max
      await videoRef.current.play();
      console.log("🔊 Video unmuted and playing");
      setError(null);
    } catch (err) {
      const errorMsg = `Failed to unmute and play: ${
        err instanceof Error ? err.message : "Unknown error"
      }`;
      console.warn("⚠️", errorMsg);
      setError(errorMsg);
    }
    updateVideoState();
  };

  const handleManualPlay = async () => {
    console.log("I clicked");

    if (!videoRef.current) return;
    console.log("It proceeded");

    try {
      // Ensure tracks are enabled before playing
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => {
          track.enabled = true;
          console.log(`✅ Enabled ${track.kind} track:`, track.id);
        });
      }

      videoRef.current.volume = 1.0; // Ensure volume is set
      await videoRef.current.play();
      console.log("▶️ Manual play successful");
      setError(null);
    } catch (err) {
      const errorMsg = `Manual play failed: ${
        err instanceof Error ? err.message : "Unknown error"
      }`;
      console.error("❌", errorMsg);
      setError(errorMsg);
    }
    updateVideoState();
  };

  const inspectStream = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const streamInfo = {
        id: stream.id,
        active: stream.active,
        tracks: stream.getTracks().map((track) => ({
          kind: track.kind,
          id: track.id,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          settings: track.getSettings(),
        })),
      };

      console.log("📦 Stream inspection:", streamInfo);

      // Also log viewer state
      const viewerState = getViewerState();
      console.log("👁️ Viewer state:", viewerState);
    } else {
      console.log("📦 No stream object found");
    }
  };

  const handleRefresh = () => {
    if (!videoRef.current) return;

    console.log("🔄 Refreshing connection");
    setError(null);
    setIsInitialized(false);

    forceReconnect(videoRef.current);

    // Reset state after a delay
    setTimeout(() => {
      updateVideoState();
      updateConnectionInfo();
      setIsInitialized(true);
    }, 1000);
  };

  const clearError = () => {
    setError(null);
  };

  // Status indicators
  const getConnectionStatusColor = () => {
    switch (connectionInfo.state) {
      case "connected":
        return "bg-green-800";
      case "connecting":
        return "bg-yellow-800";
      case "failed":
        return "bg-red-800";
      default:
        return "bg-gray-800";
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionInfo.state) {
      case "connected":
        return "🟢";
      case "connecting":
        return "🟡";
      case "failed":
        return "🔴";
      default:
        return "⚫";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            🎬 Live Stream: {regimeId}
          </h1>

          {/* Connection Status Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${getConnectionStatusColor()}`}
            >
              <span>{getConnectionStatusIcon()}</span>
              <span className="capitalize">{connectionInfo.state}</span>
            </div>

            <div
              className={`px-3 py-1 rounded text-sm ${
                connectionInfo.consumers > 0 ? "bg-blue-800" : "bg-gray-800"
              }`}
            >
              📡 {connectionInfo.consumers} Consumers
            </div>

            <div
              className={`px-3 py-1 rounded text-sm ${
                videoState.hasVideo ? "bg-purple-800" : "bg-gray-800"
              }`}
            >
              📹 {videoState.hasVideo ? "Video" : "No Video"}
            </div>

            <div
              className={`px-3 py-1 rounded text-sm ${
                videoState.hasAudio ? "bg-orange-800" : "bg-gray-800"
              }`}
            >
              🎵 {videoState.hasAudio ? "Audio" : "No Audio"}
            </div>

            <div
              className={`px-3 py-1 rounded text-sm ${
                videoState.isPlaying ? "bg-green-800" : "bg-gray-800"
              }`}
            >
              {videoState.isPlaying ? "▶️ Playing" : "⏸️ Paused"}
            </div>

            {videoState.isBuffering && (
              <div className="px-3 py-1 rounded text-sm bg-yellow-800">
                ⏳ Buffering
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <strong>⚠️ Error:</strong> {error}
                </div>
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-300 ml-2 text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Player */}
        <div className="relative mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted // Start muted for autoplay
            className="w-full max-w-4xl rounded-lg border border-gray-700 mx-auto bg-gray-900"
            style={{
              minHeight: "400px",
              aspectRatio: videoState.dimensions
                ? `${videoState.dimensions.width}/${videoState.dimensions.height}`
                : "16/9",
            }}
          />

          {/* Video Overlay */}
          {!videoState.hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">📺</div>
                <div className="text-xl text-gray-400 mb-2">
                  {connectionInfo.state === "connecting"
                    ? "Connecting to stream..."
                    : "Waiting for video stream..."}
                </div>
                {connectionInfo.state === "connected" &&
                  connectionInfo.consumers === 0 && (
                    <div className="text-sm text-gray-500">
                      No active broadcast found for this regime
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Buffering Overlay */}
          {videoState.isBuffering && videoState.hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-2">⏳</div>
                <div className="text-white">Buffering...</div>
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
            onClick={handleUnmute}
            disabled={!videoState.hasAudio}
          >
            🔊 Unmute & Play
          </button>

          <button
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
            onClick={handleManualPlay}
            disabled={!videoState.hasVideo}
          >
            ▶️ Play Video
          </button>

          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
            onClick={inspectStream}
          >
            🔍 Inspect Stream
          </button>

          <button
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
            onClick={handleRefresh}
          >
            🔄 Refresh
          </button>

          <button
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
            onClick={() => {
              const stream = videoRef.current?.srcObject as MediaStream;
              if (stream) {
                stream.getTracks().forEach(track => {
                  console.log(`🔍 ${track.kind} track:`, {
                    id: track.id,
                    enabled: track.enabled,
                    muted: track.muted,
                    readyState: track.readyState
                  });
                });
                console.log("🎛️ Video element:", {
                  muted: videoRef.current?.muted,
                  volume: videoRef.current?.volume,
                  paused: videoRef.current?.paused
                });
              }
            }}
          >
            🔍 Debug Tracks
          </button>

          <button
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
            onClick={() => {
              const stream = videoRef.current?.srcObject as MediaStream;
              if (stream) {
                // Force enable all tracks
                stream.getTracks().forEach(track => {
                  track.enabled = true;
                  console.log(`🔧 Force enabled ${track.kind} track:`, track.id);
                });
                
                // Try recreating the stream object
                const newStream = new MediaStream(stream.getTracks());
                if (videoRef.current) {
                  videoRef.current.srcObject = newStream;
                  videoRef.current.play().catch(console.error);
                }
                console.log("🔄 Recreated stream with enabled tracks");
              }
            }}
          >
            🔧 Force Fix
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">
              📊 Connection
            </h3>
            <div className="space-y-1 text-sm font-mono">
              <div>
                State:{" "}
                <span className="text-blue-300">{connectionInfo.state}</span>
              </div>
              <div>
                Transport:{" "}
                <span className="text-blue-300">
                  {connectionInfo.transportState}
                </span>
              </div>
              <div>
                Consumers:{" "}
                <span className="text-green-300">
                  {connectionInfo.consumers}
                </span>
              </div>
              <div>
                Tracks:{" "}
                <span className="text-green-300">
                  {connectionInfo.trackCount}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">
              🎥 Video
            </h3>
            <div className="space-y-1 text-sm font-mono">
              <div>
                Has Video:{" "}
                <span
                  className={
                    videoState.hasVideo ? "text-green-300" : "text-red-300"
                  }
                >
                  {videoState.hasVideo ? "Yes" : "No"}
                </span>
              </div>
              <div>
                Playing:{" "}
                <span
                  className={
                    videoState.isPlaying ? "text-green-300" : "text-red-300"
                  }
                >
                  {videoState.isPlaying ? "Yes" : "No"}
                </span>
              </div>
              <div>
                Buffering:{" "}
                <span
                  className={
                    videoState.isBuffering
                      ? "text-yellow-300"
                      : "text-green-300"
                  }
                >
                  {videoState.isBuffering ? "Yes" : "No"}
                </span>
              </div>
              {videoState.dimensions && (
                <div>
                  Size:{" "}
                  <span className="text-blue-300">
                    {videoState.dimensions.width}×{videoState.dimensions.height}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">
              🔊 Audio
            </h3>
            <div className="space-y-1 text-sm font-mono">
              <div>
                Has Audio:{" "}
                <span
                  className={
                    videoState.hasAudio ? "text-green-300" : "text-red-300"
                  }
                >
                  {videoState.hasAudio ? "Yes" : "No"}
                </span>
              </div>
              <div>
                Muted:{" "}
                <span
                  className={
                    videoState.isMuted ? "text-red-300" : "text-green-300"
                  }
                >
                  {videoState.isMuted ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-300">
            🐛 Debug Info
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <div className="text-gray-400 mb-1">General:</div>
              <div>
                Regime ID: <span className="text-blue-300">{regimeId}</span>
              </div>
              <div>
                Initialized:{" "}
                <span
                  className={isInitialized ? "text-green-300" : "text-red-300"}
                >
                  {isInitialized ? "Yes" : "No"}
                </span>
              </div>
              <div>
                Streaming URL:{" "}
                <span className="text-blue-300 break-all">
                  {process.env.NEXT_PUBLIC_STREAMING_URL}
                </span>
              </div>
              <div>
                Last Update:{" "}
                <span className="text-gray-300">
                  {new Date(connectionInfo.lastUpdate).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div>
              <div className="text-gray-400 mb-1">Video Element:</div>
              {videoRef.current && (
                <>
                  <div>
                    Ready State:{" "}
                    <span className="text-blue-300">
                      {videoRef.current.readyState}
                    </span>
                  </div>
                  <div>
                    Network State:{" "}
                    <span className="text-blue-300">
                      {videoRef.current.networkState}
                    </span>
                  </div>
                  <div>
                    Current Time:{" "}
                    <span className="text-blue-300">
                      {videoRef.current.currentTime.toFixed(2)}s
                    </span>
                  </div>
                  <div>
                    Duration:{" "}
                    <span className="text-blue-300">
                      {videoRef.current.duration
                        ? `${videoRef.current.duration.toFixed(2)}s`
                        : "Unknown"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
