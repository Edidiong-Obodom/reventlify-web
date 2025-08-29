import * as mediasoupClient from "mediasoup-client";

let device: mediasoupClient.Device;
let sendTransport: mediasoupClient.types.Transport;
let stream: MediaStream;
let socketRef: WebSocket;
let currentRegimeId: string = "";

// Enhanced producer tracking with health monitoring
interface ProducerInfo {
  producer: mediasoupClient.types.Producer;
  track: MediaStreamTrack;
  isHealthy: boolean;
  lastHealthCheck: number;
}

let producers: Map<string, ProducerInfo> = new Map();

// Broadcast state management
type BroadcastState =
  | "idle"
  | "connecting"
  | "connected"
  | "streaming"
  | "error"
  | "reconnecting";
let broadcastState: BroadcastState = "idle";
let reconnectAttempts = 0;
let maxReconnectAttempts = 5;

// Health monitoring
let healthMonitorInterval: ReturnType<typeof setInterval> | null = null;

// --- NEW: FIFO queue for produce callbacks to avoid race conditions ---
const pendingProduceCallbacks: Array<(data: { id: string }) => void> = [];

const monitorProducerHealth = () => {
  if (healthMonitorInterval) {
    clearInterval(healthMonitorInterval);
  }

  healthMonitorInterval = setInterval(() => {
    const now = Date.now();
    const unhealthyProducers: string[] = [];

    producers.forEach((producerInfo, kind) => {
      const { producer, track } = producerInfo;
      const isHealthy =
        producer !== undefined &&
        !producer.closed &&
        !producer.paused &&
        track.readyState === "live" &&
        track.enabled;

      if (!isHealthy && producerInfo.isHealthy) {
        console.warn(`🏥 Producer ${kind} became unhealthy`);
        unhealthyProducers.push(kind);
      }

      producerInfo.isHealthy = isHealthy;
      producerInfo.lastHealthCheck = now;
    });

    // Attempt to recreate unhealthy producers
    unhealthyProducers.forEach((kind) => {
      console.log(`🔄 Attempting to recreate unhealthy ${kind} producer`);
      recreateProducer(kind);
    });
  }, 5000); // Check every 5 seconds
};

const recreateProducer = async (kind: string) => {
  const producerInfo = producers.get(kind);
  if (!producerInfo || !stream) return;

  try {
    console.log(`🔄 Recreating ${kind} producer...`);

    // Find the corresponding track in the stream
    const tracks = stream.getTracks().filter((track) => track.kind === kind);
    if (tracks.length === 0) {
      console.warn(`⚠️ No ${kind} track found in stream`);
      return;
    }

    const track = tracks[0];

    // Create new producer - produce() will trigger sendTransport.on('produce') which pushes callback to queue
    const newProducer = await sendTransport.produce({
      track,
      appData: { regimeId: currentRegimeId, kind },
    });

    // Update producer info
    producerInfo.producer = newProducer;
    producerInfo.track = track;
    producerInfo.isHealthy = true;
    producerInfo.lastHealthCheck = Date.now();

    // Setup event listeners for new producer
    setupProducerEventListeners(newProducer, kind, track);

    console.log(`✅ Successfully recreated ${kind} producer:`, newProducer.id);
  } catch (error) {
    console.error(`❌ Failed to recreate ${kind} producer:`, error);
  }
};

const setupProducerEventListeners = (
  producer: mediasoupClient.types.Producer,
  kind: string,
  track: MediaStreamTrack
) => {
  producer.on("@close", () => {
    console.log(`🗑️ ${kind} producer closed`);
    producers.delete(kind);
  });

  producer.on("transportclose", () => {
    console.log(`🚫 ${kind} producer transport closed`);
    producers.delete(kind);
  });

  producer.on("@pause", () => {
    console.log(`⏸️ ${kind} producer paused`);
  });

  producer.on("@resume", () => {
    console.log(`▶️ ${kind} producer resumed`);
  });

  // Track event listeners
  track.addEventListener("mute", () => {
    console.warn(`🔇 ${kind} track muted`);
  });

  track.addEventListener("unmute", () => {
    console.log(`🔊 ${kind} track unmuted`);
  });

  track.addEventListener("ended", () => {
    console.warn(`🛑 ${kind} track ended`);
    try {
      if (producer && !producer.closed) {
        producer.close();
      }
    } catch (err) {
      /* ignore */
    }
    producers.delete(kind);
  });
};

export async function startBroadcasting(
  socket: WebSocket,
  regimeId: string,
  videoElement?: HTMLVideoElement
) {
  console.log("🎙️ Starting broadcast for regime:", regimeId);

  try {
    // Reset state
    producers.clear();
    currentRegimeId = regimeId;
    socketRef = socket;
    broadcastState = "connecting";
    reconnectAttempts = 0;

    // Attach a single onmessage handler which will also resolve produce callbacks
    socket.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        await handleWebSocketMessage(msg, videoElement);
      } catch (error) {
        console.error("❌ Error handling WebSocket message:", error);
        broadcastState = "error";
      }
    };

    socket.onerror = (err) => {
      console.error("❌ Broadcaster socket error:", err);
      broadcastState = "error";
    };

    socket.onclose = (event) => {
      console.log("🔌 Broadcaster WebSocket connection closed", event.code);
      broadcastState = "idle";

      // Auto-reconnect for unexpected closures
      if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        console.log(
          `🔄 Attempting to reconnect... (${
            reconnectAttempts + 1
          }/${maxReconnectAttempts})`
        );
        setTimeout(() => {
          reconnectAttempts++;
          attemptReconnect(regimeId, videoElement);
        }, Math.pow(2, reconnectAttempts) * 1000); // Exponential backoff
      }
    };

    // Start the connection process
    socket.send(JSON.stringify({ action: "getRouterRtpCapabilities" }));
  } catch (error) {
    console.error("❌ Failed to start broadcasting:", error);
    broadcastState = "error";
    throw error;
  }
}

const attemptReconnect = async (
  regimeId: string,
  videoElement?: HTMLVideoElement
) => {
  try {
    broadcastState = "reconnecting";

    // Create new WebSocket connection
    const newSocket = new WebSocket(`${process.env.NEXT_PUBLIC_STREAMING_URL}`);

    newSocket.onopen = () => {
      console.log("🔄 Reconnection successful");
      startBroadcasting(newSocket, regimeId, videoElement);
    };

    newSocket.onerror = () => {
      console.error("❌ Reconnection failed");
      broadcastState = "error";
    };
  } catch (error) {
    console.error("❌ Reconnection attempt failed:", error);
    broadcastState = "error";
  }
};

const handleWebSocketMessage = async (
  msg: any,
  videoElement?: HTMLVideoElement
) => {
  // --- FIRST: handle produceResult queue if present ---
  if (msg.action === "produceResult") {
    try {
      const { id } = msg.data || {};
      const callback = pendingProduceCallbacks.shift();
      if (callback) {
        callback({ id });
      } else {
        console.warn("⚠️ Received produceResult but no pending callback", id);
      }
    } catch (err) {
      console.error("❌ Error resolving produceResult:", err);
    }
    // produceResult handled; still allow fallthrough to other handlers if needed but usually it's specific
    return;
  }

  // --- Regular handlers ---
  if (msg.action === "routerRtpCapabilities") {
    try {
      device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities: msg.data });
      console.log("📱 Device loaded with RTP capabilities");
      broadcastState = "connected";

      socketRef.send(
        JSON.stringify({ action: "createWebRtcTransport", role: "producer" })
      );
    } catch (error) {
      console.error("❌ Failed to load device:", error);
      broadcastState = "error";
    }
    return;
  }

  if (msg.action === "createWebRtcTransportResult") {
    try {
      await setupSendTransport(msg.data, videoElement);
    } catch (error) {
      console.error("❌ Failed to setup send transport:", error);
      broadcastState = "error";
    }
    return;
  }

  if (msg.action === "producerTransportConnected") {
    console.log("✅ Producer transport connected successfully");
    return;
  }

  if (msg.action === "error") {
    console.error("❌ Server error:", msg.message);
    broadcastState = "error";
    return;
  }

  // Unknown message - log for visibility
  console.log("📨 Unhandled message action (broadcast):", msg.action);
};

const setupSendTransport = async (
  transportData: any,
  videoElement?: HTMLVideoElement
) => {
  const { id, iceParameters, iceCandidates, dtlsParameters } = transportData;

  sendTransport = device.createSendTransport({
    id,
    iceCandidates,
    iceParameters,
    dtlsParameters,
    appData: { isBroadcaster: true, regimeId: currentRegimeId },
    iceServers: [],
  });

  // Enhanced transport event listeners
  sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
    console.log("🔗 Producer transport connecting...");
    try {
      socketRef.send(
        JSON.stringify({
          action: "connectProducerTransport",
          transportId: sendTransport.id,
          dtlsParameters,
        })
      );
      callback();
    } catch (error: any) {
      console.error("❌ Failed to connect producer transport:", error);
      errback(error);
    }
  });

  sendTransport.on("connectionstatechange", (state) => {
    console.log("🔄 Producer Transport State:", state);
    if (state === "connected") {
      console.log("🟢 Producer transport connected");
    } else if (state === "failed" || state === "disconnected") {
      console.warn("🔴 Producer transport connection issue");
      broadcastState = "error";
    }
  });

  // Add connection state monitoring
  sendTransport.on("connectionstatechange", (connectionState) => {
    console.log("🧊 Producer connection state:", connectionState);
  });

  // Add ICE gathering state monitoring  
  sendTransport.on("icegatheringstatechange", (iceGatheringState) => {
    console.log("🔍 Producer ICE gathering state:", iceGatheringState);
  });

  // Add ICE candidate error monitoring
  sendTransport.on("icecandidateerror", (error) => {
    console.log("❌ Producer ICE candidate error:", error);
  });

  // IMPORTANT: use FIFO queue for produce callbacks to avoid multiple message listener races
  sendTransport.on(
    "produce",
    ({ kind, rtpParameters, appData }, callback, errback) => {
      console.log(`📡 Producing ${kind} track for regime:`, currentRegimeId);

      // Push callback into queue. When server returns produceResult, the top callback will be called.
      pendingProduceCallbacks.push(callback);

      try {
        socketRef.send(
          JSON.stringify({
            action: "produce",
            transportId: sendTransport.id,
            kind,
            rtpParameters,
            producerId: currentRegimeId,
          })
        );
      } catch (error: any) {
        // If send fails, remove our callback and call errback
        const cb = pendingProduceCallbacks.pop();
        if (cb) {
          try {
            errback(error);
          } catch (e) {
            /* ignore */
          }
        }
      }
    }
  );

  // Capture media and create producers
  await setupMediaCapture(videoElement);
};

const setupMediaCapture = async (videoElement?: HTMLVideoElement) => {
  try {
    console.log("🎥 Capturing media...");

    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 2,
      },
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: "user",
      },
    });

    console.log("🎥 Media stream acquired:", {
      audioTracks: stream.getAudioTracks().length,
      videoTracks: stream.getVideoTracks().length,
    });

    // Prevent tracks from being auto-paused
    stream.getTracks().forEach((track) => {
      track.enabled = true;

      // Log track details
      console.log(`🎙️ Broadcaster track (${track.kind}):`, {
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
        settings: track.getSettings(),
      });

      // Specifically check for muted video tracks on broadcaster
      if (track.kind === "video" && track.muted) {
        console.error("❌ CRITICAL: Video track is muted on broadcaster side!");
        console.log("🔧 Video track constraints:", track.getConstraints());
      }
    });

    // Attach to video element if provided
    if (videoElement) {
      videoElement.srcObject = stream;
      console.log("📺 Stream attached to video element");
    }

    // Create producers for each track (sequential to keep FIFO mapping correct)
    await createProducers();

    // Start health monitoring
    monitorProducerHealth();

    // Setup simplified visibility handling
    setupVisibilityHandling();

    broadcastState = "streaming";
    console.log(`🎬 Broadcasting started with ${producers.size} producers`);
  } catch (error) {
    console.error("❌ Failed to capture media:", error);
    broadcastState = "error";
    throw error;
  }
};

const createProducers = async () => {
  // create producers in a deterministic order: video first, audio second
  const tracks = stream.getTracks();
  const sorted = [...tracks].sort((a, b) => {
    if (a.kind === "video" && b.kind !== "video") return -1;
    if (b.kind === "video" && a.kind !== "video") return 1;
    return 0;
  });

  for (const track of sorted) {
    try {
      console.log(`🎛️ Creating producer for ${track.kind} track...`);

      // produce() will not resolve until the sendTransport.on('produce') callback is called
      const producer = await sendTransport.produce({
        track,
        appData: { regimeId: currentRegimeId, kind: track.kind },
      });

      // Store producer info with health tracking
      producers.set(track.kind, {
        producer,
        track,
        isHealthy: true,
        lastHealthCheck: Date.now(),
      });

      console.log(`✅ ${track.kind} producer created:`, {
        id: producer.id,
        kind: producer.kind,
        paused: producer.paused,
        trackEnabled: track.enabled,
        trackMuted: track.muted,
        trackReadyState: track.readyState,
      });

      // Setup event listeners
      setupProducerEventListeners(producer, track.kind, track);
    } catch (error) {
      console.error(`❌ Failed to create ${track.kind} producer:`, error);
    }
  }
};

const setupVisibilityHandling = () => {
  const handleVisibilityChange = () => {
    if (!stream) return;

    console.log(`🔄 Tab ${document.hidden ? "hidden" : "visible"}`);

    // Simple approach: just ensure tracks stay enabled
    stream.getTracks().forEach((track) => {
      track.enabled = true;
    });

    // Log producer states
    producers.forEach((producerInfo, kind) => {
      console.log(`📊 ${kind} producer state:`, {
        closed: producerInfo.producer.closed,
        paused: producerInfo.producer.paused,
        trackEnabled: producerInfo.track.enabled,
        trackReadyState: producerInfo.track.readyState,
      });
    });
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Setup beforeunload warning
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (producers.size > 0) {
      e.preventDefault();
      e.returnValue =
        "You are currently broadcasting. Are you sure you want to leave?";
      return e.returnValue;
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  // Store cleanup function
  (sendTransport as any).visibilityCleanup = () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
};

export function stopBroadcasting() {
  console.log("🛑 Stopping broadcast");

  broadcastState = "idle";

  // Stop health monitoring
  if (healthMonitorInterval) {
    clearInterval(healthMonitorInterval);
    healthMonitorInterval = null;
  }

  // Close all producers
  producers.forEach((producerInfo, kind) => {
    try {
      if (!producerInfo.producer.closed) {
        producerInfo.producer.close();
        console.log(`🗑️ Closed ${kind} producer`);
      }
    } catch (err) {
      console.warn(`⚠️ Error closing ${kind} producer:`, err);
    }
  });
  producers.clear();

  // Clear any pending produce callbacks (safely)
  while (pendingProduceCallbacks.length) {
    const cb = pendingProduceCallbacks.shift();
    try {
      // inform callback with a dummy id (or could call errback if we kept one)
      if (cb) cb({ id: "" });
    } catch (e) {
      /* ignore */
    }
  }

  // Close transport
  if (sendTransport) {
    try {
      // Clean up visibility listener
      if ((sendTransport as any).visibilityCleanup) {
        (sendTransport as any).visibilityCleanup();
      }

      if (!sendTransport.closed) {
        sendTransport.close();
        console.log("🗑️ Send transport closed");
      }
    } catch (err) {
      console.warn("⚠️ Error closing send transport:", err);
    }
  }

  // Stop all media tracks
  if (stream) {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
        console.log(`🛑 Stopped ${track.kind} track`);
      } catch (err) {
        console.warn(`⚠️ Error stopping ${track.kind} track:`, err);
      }
    });
  }

  // Close WebSocket
  if (socketRef && socketRef.readyState === WebSocket.OPEN) {
    socketRef.close(1000, "Manual stop");
    console.log("🔌 WebSocket closed");
  }

  // Clear references
  device = undefined as any;
  sendTransport = undefined as any;
  stream = undefined as any;
  socketRef = undefined as any;
  currentRegimeId = "";
  reconnectAttempts = 0;

  console.log("✅ Broadcast cleanup completed");
}

// Enhanced utility function to get current broadcasting state
export function getBroadcastState() {
  const producerStates = Array.from(producers.entries()).map(
    ([kind, info]) => ({
      kind,
      id: info.producer.id,
      closed: info.producer.closed,
      paused: info.producer.paused,
      isHealthy: info.isHealthy,
      trackEnabled: info.track.enabled,
      trackReadyState: info.track.readyState,
      lastHealthCheck: info.lastHealthCheck,
    })
  );

  return {
    state: broadcastState,
    isActive: producers.size > 0 && broadcastState === "streaming",
    regimeId: currentRegimeId,
    producers: Array.from(producers.keys()),
    producerDetails: producerStates,
    transportState: (sendTransport as any)?.connectionState || "disconnected",
    deviceLoaded: !!device,
    reconnectAttempts,
    hasStream: !!stream,
    trackCount: stream?.getTracks().length || 0,
  };
}

export function getCurrentBroadcastState(): BroadcastState {
  return broadcastState;
}

export function forceReconnect(
  regimeId: string,
  videoElement?: HTMLVideoElement
) {
  console.log("🔄 Force reconnecting broadcast...");
  stopBroadcasting();

  setTimeout(() => {
    const newSocket = new WebSocket(`${process.env.NEXT_PUBLIC_STREAMING_URL}`);
    newSocket.onopen = () => {
      startBroadcasting(newSocket, regimeId, videoElement);
    };
  }, 1000);
}
