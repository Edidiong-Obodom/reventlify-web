import * as mediasoupClient from "mediasoup-client";

let device: mediasoupClient.Device;
let consumerTransport: mediasoupClient.types.Transport;
let consumer: mediasoupClient.types.Consumer;
let ws: WebSocket;

export async function startViewing(videoElement: HTMLVideoElement) {
  ws = new WebSocket(`${process.env.NEXT_PUBLIC_STREAMING_URL}`);

  ws.onopen = async () => {
    console.log("🔌 Connected to live server");

    // Step 1: Get Router RTP Capabilities
    ws.send(JSON.stringify({ action: "getRouterRtpCapabilities" }));
  };

  ws.onmessage = async (event) => {
    const msg = JSON.parse(event.data);

    if (msg.action === "routerRtpCapabilities") {
      // Step 2: Load Device with capabilities
      device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities: msg.data });

      // Step 3: Create WebRTC Transport
      ws.send(
        JSON.stringify({ action: "createWebRtcTransport", role: "consumer" })
      );
    }

    if (msg.action === "createWebRtcTransportResult") {
      const { id, iceParameters, iceCandidates, dtlsParameters } = msg.data;

      consumerTransport = device.createRecvTransport({
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
      });

      consumerTransport.on(
        "connect",
        ({ dtlsParameters }, callback, errback) => {
          ws.send(
            JSON.stringify({
              action: "connectConsumerTransport",
              dtlsParameters,
            })
          );
          callback(); // continue connection
        }
      );

      consumerTransport.on("connectionstatechange", (state) => {
        console.log("Consumer Transport State:", state);
        if (state === "connected") {
          console.log("🟢 Consumer connected");
        } else if (state === "failed" || state === "disconnected") {
          console.warn("🔴 Consumer connection issue");
        }
      });

      console.log("📡 Sending consume request to server...");
      // Step 4: Tell server we want to consume stream
      ws.send(
        JSON.stringify({
          action: "consume",
          rtpCapabilities: device.rtpCapabilities,
        })
      );
    }

    if (msg.action === "error" && msg.message === "No producer found") {
      console.warn("Retrying consume in 2 seconds...");
      setTimeout(() => {
        ws.send(
          JSON.stringify({
            action: "consume",
            rtpCapabilities: device.rtpCapabilities,
          })
        );
      }, 2000);
    }

    if (msg.action === "consumeResult") {
      const { id, producerId, kind, rtpParameters } = msg.data;

      consumer = await consumerTransport.consume({
        id,
        producerId,
        kind,
        rtpParameters,
      });

      console.log("🎬 Consumed from producer:", producerId);
      console.log("📦 Consuming track of kind:", kind);

      const stream = new MediaStream();
      stream.addTrack(consumer.track);
      console.log(
        stream.getTracks().map((track) => ({
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
        }))
      );
      videoElement.autoplay = true;
      videoElement.muted = true; // or true for testing
      videoElement.playsInline = true;
      videoElement.srcObject = stream;
      console.log("👁️ Checking video tracks:", stream.getVideoTracks());
      stream.getVideoTracks()[0].addEventListener("mute", () => {
        console.warn("🔇 Track muted", consumer.track.muted);
        console.log("🎛️ Track enabled?", consumer.track.enabled);
      });

      stream.getVideoTracks()[0].addEventListener("unmute", () => {
        console.warn("🔊 Track unmuted");
      });
      console.log(
        "🎛️ Track settings:",
        stream.getVideoTracks()[0]?.getSettings()
      );

      videoElement
        .play()
        .then(() => {
          console.log("🎬 Video playback started");
        })
        .catch((err) => {
          console.error("❌ videoElement.play() error:", err);
        });

      videoElement.onloadedmetadata = () => {
        console.log("🎥 Metadata loaded, playing video");
      };
      videoElement.onplay = () => {
        console.log("▶️ Play method requested");
      };
      videoElement.onplaying = () => {
        console.log("▶️ Video is playing");
      };

      videoElement.onloadedmetadata = () => {
        console.log("✅ Metadata loaded");
      };

      console.log("Track readyState:", consumer.track.readyState);

      // ✅ Optional delayed logs for debugging
      setTimeout(() => {
        console.log("⏱️ Video track muted?", consumer.track.muted);
        console.log("📊 Track readyState:", consumer.track.readyState);
        console.log("📈 Is playing?", videoElement.paused ? "No" : "Yes");
      }, 3000);
    }
  };

  ws.onerror = (err) => {
    console.error("Viewer socket error:", err);
  };
}

export function stopViewing() {
  if (consumerTransport) consumerTransport.close();
  if (ws && ws.readyState === WebSocket.OPEN) ws.close();
}
