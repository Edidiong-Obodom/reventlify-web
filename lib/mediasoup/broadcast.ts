// lib/mediasoup/broadcaster.ts
import * as mediasoupClient from "mediasoup-client";

let device: mediasoupClient.Device;
let sendTransport: mediasoupClient.types.Transport;
let stream: MediaStream;
let socketRef: WebSocket;

export async function startBroadcasting(
  socket: WebSocket,
  regimeId: string,
  videoElement?: HTMLVideoElement
) {
  const video = document.querySelector("video");
  video?.requestVideoFrameCallback(() => {
    console.log("✅ Video frame rendered!");
  });
  console.log("🎙️ Starting broadcast");
  socketRef = socket;

  socket.send(JSON.stringify({ action: "getRouterRtpCapabilities" }));

  socket.onmessage = async (event) => {
    const msg = JSON.parse(event.data);

    if (msg.action === "routerRtpCapabilities") {
      device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities: msg.data });

      socket.send(
        JSON.stringify({ action: "createWebRtcTransport", role: "producer" })
      );
    }

    if (msg.action === "createWebRtcTransportResult") {
      const { id, iceParameters, iceCandidates, dtlsParameters } = msg.data;

      sendTransport = device.createSendTransport({
        id,
        iceCandidates,
        iceParameters,
        dtlsParameters,
        appData: { isBroadcaster: true },
        iceServers: [],
      });

      sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
        socket.send(
          JSON.stringify({
            action: "connectProducerTransport",
            transportId: sendTransport.id,
            dtlsParameters,
          })
        );
        callback();
      });

      sendTransport.on(
        "produce",
        ({ kind, rtpParameters }, callback, errback) => {
          const listener = (event: MessageEvent) => {
            const msg = JSON.parse(event.data);
            if (msg.action === "produceResult") {
              socket.removeEventListener("message", listener);
              callback({ id: msg.data.id });
            }
          };

          socket.addEventListener("message", listener);

          socket.send(
            JSON.stringify({
              action: "produce",
              transportId: sendTransport.id,
              kind,
              rtpParameters,
              producerId: regimeId,
            })
          );
        }
      );

      // 🔴 Capture webcam and mic
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      const videoTrack = stream.getVideoTracks()[0];

      console.log("🎥 Producer video track:", {
        enabled: videoTrack.enabled,
        muted: videoTrack.muted,
        readyState: videoTrack.readyState,
        settings: videoTrack.getSettings(),
      });

      // Attach to video element if provided
      if (videoElement) {
        videoElement.srcObject = stream;
      }

      for (const track of stream.getTracks()) {
        const producer = await sendTransport.produce({ track });

        // ✅ DEBUG LOGS FOR TRACK STATE
        if (track.kind === "video") {
          console.log("🎛️ Video Producer paused?", producer.paused);
          console.log("📶 Video Producer track muted?", track.muted);
          console.log("📡 Video Producer track readyState?", track.readyState);
        }
      }

      // 👇 Handle tab visibility
      document.addEventListener("visibilitychange", () => {
        if (!stream) return;

        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack) return;

        if (document.hidden) {
          console.log("🚫 Tab hidden — pausing video track");
          videoTrack.enabled = false;
        } else {
          console.log("✅ Tab visible — resuming video track");
          videoTrack.enabled = true;
        }
      });
    }
  };
}

export function stopBroadcasting() {
  console.log("🛑 Stopping broadcast");

  if (sendTransport) {
    try {
      sendTransport.close();
      console.log("🛑 Broadcast stopped!");
    } catch (err) {
      console.warn("Failed to close sendTransport:", err);
    }
  }

  if (stream) {
    for (const track of stream.getTracks()) {
      track.stop();
    }
  }

  if (socketRef) {
    socketRef.close();
  }

  // Clear references
  device = undefined as any;
  sendTransport = undefined as any;
  stream = undefined as any;
  socketRef = undefined as any;
}
