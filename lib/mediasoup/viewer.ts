import * as mediasoupClient from "mediasoup-client";

let device: mediasoupClient.Device;
let consumerTransport: mediasoupClient.types.Transport;
let consumers: Map<string, mediasoupClient.types.Consumer> = new Map();
let ws: WebSocket;
let viewerStream: MediaStream | null = null;
let currentRegimeId: string = "";

// Track what kinds we've successfully consumed
let consumedKinds = new Set<string>();

// Connection state management
type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "failed"
  | "closed";
let connectionState: ConnectionState = "idle";

// Retry management with exponential backoff
class RetryManager {
  private retryCount = 0;
  private maxRetries = 5;
  private baseDelay = 1000; // 1 second

  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      const result = await operation();
      this.retryCount = 0; // Reset on success
      return result;
    } catch (error) {
      if (this.retryCount >= this.maxRetries) {
        console.error(`❌ ${context} failed after ${this.maxRetries} attempts`);
        throw new Error(`${context} failed after ${this.maxRetries} attempts`);
      }

      const delay = this.baseDelay * Math.pow(2, this.retryCount); // Exponential backoff
      this.retryCount++;

      console.warn(
        `⚠️ ${context} attempt ${this.retryCount} failed, retrying in ${delay}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.retryWithBackoff(operation, context);
    }
  }

  reset() {
    this.retryCount = 0;
  }
}

const retryManager = new RetryManager();

export async function startViewing(
  videoElement: HTMLVideoElement,
  regimeId: string
) {
  // Reset state
  consumers.clear();
  consumedKinds.clear();
  viewerStream = null;
  currentRegimeId = regimeId;
  connectionState = "connecting";
  retryManager.reset();

  console.log("🎯 Starting viewer for regime:", regimeId);

  try {
    ws = new WebSocket(`${process.env.NEXT_PUBLIC_STREAMING_URL}`);

    ws.onopen = async () => {
      console.log("🔌 Connected to live server for regime:", regimeId);
      connectionState = "connected";

      try {
        // Step 1: Get Router RTP Capabilities
        await sendMessage({ action: "getRouterRtpCapabilities" });
      } catch (error) {
        console.error("❌ Failed to get router capabilities:", error);
        connectionState = "failed";
      }
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("📨 Received message:", msg.action);
        await handleWebSocketMessage(msg, videoElement);
      } catch (error) {
        console.error("❌ Error handling WebSocket message:", error);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ Viewer socket error:", err);
      connectionState = "failed";
    };

    ws.onclose = (event) => {
      console.log("🔌 WebSocket connection closed", event.code, event.reason);
      connectionState = "closed";

      // Auto-reconnect for unexpected closures (not manual close)
      if (event.code !== 1000 && currentRegimeId) {
        console.log("🔄 Attempting to reconnect...");
        setTimeout(() => {
          if (connectionState !== "connecting") {
            startViewing(videoElement, currentRegimeId);
          }
        }, 3000);
      }
    };
  } catch (error) {
    console.error("❌ Failed to create WebSocket:", error);
    connectionState = "failed";
    throw error;
  }
}

// Helper function to send messages with promise support
function sendMessage(message: any): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ws.readyState !== WebSocket.OPEN) {
      reject(new Error("WebSocket is not open"));
      return;
    }

    try {
      ws.send(JSON.stringify(message));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

async function handleWebSocketMessage(
  msg: any,
  videoElement: HTMLVideoElement
) {
  if (msg.action === "routerRtpCapabilities") {
    try {
      // Step 2: Load Device with capabilities
      device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities: msg.data });
      console.log("📱 Device loaded with RTP capabilities");

      // Step 3: Create WebRTC Transport
      await sendMessage({ action: "createWebRtcTransport", role: "consumer" });
    } catch (error) {
      console.error("❌ Failed to load device:", error);
      connectionState = "failed";
    }
  }

  if (msg.action === "createWebRtcTransportResult") {
    try {
      const { id, iceParameters, iceCandidates, dtlsParameters } = msg.data;

      consumerTransport = device.createRecvTransport({
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
      });

      // Enhanced transport event handling
      consumerTransport.on(
        "connect",
        ({ dtlsParameters }, callback, errback) => {
          console.log("🔗 Consumer transport connecting...");
          sendMessage({
            action: "connectConsumerTransport",
            dtlsParameters,
          })
            .then(() => {
              callback();
            })
            .catch((error) => {
              console.error("❌ Failed to connect consumer transport:", error);
              errback(error);
            });
        }
      );

      consumerTransport.on("connectionstatechange", (state) => {
        console.log("🔄 Consumer Transport State:", state);
        if (state === "connected") {
          console.log("🟢 Consumer transport connected - requesting consumers");
          // Only request consumers when transport is fully connected
          requestConsumers();
        } else if (state === "failed") {
          console.warn("🔴 Consumer transport failed");
          connectionState = "failed";
        } else if (state === "disconnected") {
          console.warn("🟡 Consumer transport disconnected");
        }
      });

      console.log("📡 Consumer transport created successfully");
    } catch (error) {
      console.error("❌ Failed to create consumer transport:", error);
      connectionState = "failed";
    }
  }

  if (msg.action === "error") {
    console.warn("❌ Server error:", msg.message);

    // Handle specific error cases with retry logic
    if (msg.message && msg.message.includes("producer found")) {
      const kind = msg.kind || "unknown";
      console.warn(`🔄 No ${kind} producer found, will retry...`);

      // Use retry manager for producer requests
      setTimeout(() => {
        retryManager
          .retryWithBackoff(
            () => requestSpecificConsumer(kind),
            `Request ${kind} consumer`
          )
          .catch((error) => {
            console.error(
              `❌ Failed to retry ${kind} consumer after all attempts:`,
              error
            );
          });
      }, 2000);
    } else {
      console.error("❌ Unhandled server error:", msg);
    }
  }

  if (msg.action === "consumeResult") {
    try {
      await handleConsumeResult(msg.data, videoElement);
    } catch (error) {
      console.error("❌ Failed to handle consume result:", error);
    }
  }
}

async function requestConsumers() {
  const kinds = ["video", "audio"]; // Prioritize video first

  for (const kind of kinds) {
    if (!consumedKinds.has(kind)) {
      try {
        await requestSpecificConsumer(kind);
        // Small delay between requests to avoid overwhelming server
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Failed to request ${kind} consumer:`, error);
      }
    } else {
      console.log(`✅ ${kind} consumer already requested/consumed`);
    }
  }
}

async function requestSpecificConsumer(kind: string): Promise<void> {
  console.log(`📡 Requesting ${kind} consumer for regime:`, currentRegimeId);

  const message = {
    action: "consume",
    rtpCapabilities: device.rtpCapabilities,
    producerId: currentRegimeId,
    kind: kind,
  };

  await sendMessage(message);
}

async function handleConsumeResult(data: any, videoElement: HTMLVideoElement) {
  const { id, producerId, kind, rtpParameters, regimeId } = data;

  try {
    const consumer = await consumerTransport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
    });

    consumers.set(id, consumer);
    consumedKinds.add(kind);

    console.log(`🎬 ${kind} consumer created:`, {
      consumerId: id,
      producerId: producerId,
      regimeId: regimeId,
      paused: consumer.paused,
      trackDetails: {
        kind: consumer.track.kind,
        enabled: consumer.track.enabled,
        muted: consumer.track.muted,
        readyState: consumer.track.readyState,
        settings: consumer.track.getSettings(),
      },
    });

    // Create or get the viewer stream
    if (!viewerStream) {
      viewerStream = new MediaStream();
      videoElement.srcObject = viewerStream;
      console.log("📺 Created new MediaStream for video element");
    }

    // Add track to stream
    viewerStream.addTrack(consumer.track);
    console.log(
      `➕ Added ${kind} track to stream. Total tracks:`,
      viewerStream.getTracks().length
    );

    // Enhanced track event listeners
    consumer.track.addEventListener("mute", () => {
      console.warn(`🔇 ${kind} track muted`);
    });

    consumer.track.addEventListener("unmute", () => {
      console.log(`🔊 ${kind} track unmuted`);
    });

    consumer.track.addEventListener("ended", () => {
      console.warn(`🛑 ${kind} track ended`);
      // Remove track from stream
      if (viewerStream?.getTrackById(consumer.track.id)) {
        viewerStream.removeTrack(consumer.track);
      }
      consumers.delete(id);
      consumedKinds.delete(kind);
    });

    // Enhanced consumer event listeners
    consumer.on("@close", () => {
      console.log(`🗑️ ${kind} consumer closed`);
      consumers.delete(id);
      consumedKinds.delete(kind);

      // Remove track from stream if it exists
      if (viewerStream?.getTrackById(consumer.track.id)) {
        viewerStream.removeTrack(consumer.track);
      }
    });

    consumer.on("@pause", () => {
      console.log(`⏸️ ${kind} consumer paused`);
    });

    consumer.on("@resume", () => {
      console.log(`▶️ ${kind} consumer resumed`);
    });

    // Handle video-specific setup
    if (kind === "video") {
      await setupVideoPlayback(videoElement);
    }

    // Resume consumer if paused
    if (consumer.paused) {
      try {
        await consumer.resume();
        console.log(`▶️ ${kind} consumer resumed`);
      } catch (error) {
        console.warn(`⚠️ Failed to resume ${kind} consumer:`, error);
      }
    }
  } catch (error) {
    console.error(`❌ Failed to create ${kind} consumer:`, error);
    throw error;
  }
}

async function setupVideoPlayback(videoElement: HTMLVideoElement) {
  console.log("🎥 Setting up video playback...");

  // Enhanced video element event listeners
  const handleLoadedMetadata = () => {
    console.log("✅ Video metadata loaded");
    console.log("📐 Video dimensions:", {
      videoWidth: videoElement.videoWidth,
      videoHeight: videoElement.videoHeight,
      duration: videoElement.duration,
    });
  };

  const handlePlaying = () => {
    console.log("▶️ Video is playing");
  };

  const handlePlay = () => {
    console.log("📍 Video play event triggered");
  };

  const handleError = (e: Event) => {
    console.error("❌ Video element error:", e);
  };

  const handleWaiting = () => {
    console.log("⏳ Video waiting for data");
  };

  const handleCanPlay = () => {
    console.log("✅ Video can play");
  };

  // Add event listeners
  videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
  videoElement.addEventListener("playing", handlePlaying);
  videoElement.addEventListener("play", handlePlay);
  videoElement.addEventListener("error", handleError);
  videoElement.addEventListener("waiting", handleWaiting);
  videoElement.addEventListener("canplay", handleCanPlay);

  // Attempt to play video
  try {
    await videoElement.play();
    console.log("🎬 Video playback started successfully");
  } catch (err) {
    console.warn("⚠️ Autoplay failed (user interaction may be required):", err);
    console.log("🔧 Video element state:", {
      paused: videoElement.paused,
      muted: videoElement.muted,
      readyState: videoElement.readyState,
    });
  }
}

export function stopViewing() {
  console.log("🛑 Stopping viewer");

  connectionState = "closed";

  // Close all consumers
  consumers.forEach((consumer, id) => {
    try {
      if (!consumer.closed) {
        consumer.close();
        console.log(`🗑️ Closed consumer: ${id}`);
      }
    } catch (err) {
      console.warn(`⚠️ Error closing consumer ${id}:`, err);
    }
  });
  consumers.clear();
  consumedKinds.clear();

  // Close transport
  if (consumerTransport) {
    try {
      if (!consumerTransport.closed) {
        consumerTransport.close();
        console.log("🗑️ Consumer transport closed");
      }
    } catch (err) {
      console.warn("⚠️ Error closing consumer transport:", err);
    }
  }

  // Close WebSocket
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close(1000, "Manual stop");
    console.log("🔌 WebSocket closed");
  }

  // Clear stream
  if (viewerStream) {
    viewerStream.getTracks().forEach((track) => {
      try {
        track.stop();
        console.log(`🛑 Stopped ${track.kind} track`);
      } catch (err) {
        console.warn(`⚠️ Error stopping ${track.kind} track:`, err);
      }
    });
    viewerStream = null;
  }

  // Reset references
  device = undefined as any;
  consumerTransport = undefined as any;
  ws = undefined as any;
  currentRegimeId = "";
  retryManager.reset();

  console.log("✅ Viewer cleanup completed");
}

// Utility functions for external use
export function getViewerState() {
  return {
    isActive: consumers.size > 0,
    regimeId: currentRegimeId,
    consumers: Array.from(consumers.keys()),
    consumedKinds: Array.from(consumedKinds),
    connectionState,
    transportState: consumerTransport?.connectionState || "disconnected",
    deviceLoaded: !!device,
    hasStream: !!viewerStream,
    trackCount: viewerStream?.getTracks().length || 0,
  };
}

export function getConnectionState(): ConnectionState {
  return connectionState;
}

export function forceReconnect(videoElement: HTMLVideoElement) {
  if (currentRegimeId) {
    console.log("🔄 Force reconnecting...");
    stopViewing();
    setTimeout(() => {
      startViewing(videoElement, currentRegimeId);
    }, 1000);
  }
}
