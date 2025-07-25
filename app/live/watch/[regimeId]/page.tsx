"use client";

import { useEffect, useRef } from "react";
import { startViewing, stopViewing } from "@/lib/mediasoup/viewer";
import { useParams } from "next/navigation";

export default function WatchPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { regimeId } = useParams() as { regimeId: string };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.onplaying = () => {
      console.log("🎥 Viewer video is playing");
    };
    video.onloadedmetadata = () => {
      console.log("✅ Metadata loaded");
    };
    video.onplay = () => {
      console.log("▶️ Play triggered from component");
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      startViewing(videoRef.current);
    }

    return () => {
      stopViewing();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-xl font-semibold mb-2">
        🎬 Watching Stream: {regimeId}
      </h2>
      <video
        ref={(el) => {
          if (el) {
            el.onplaying = () => console.log("🎥 Direct ref playing");
          }
          videoRef.current = el;
        }}
        autoPlay
        playsInline
        className="w-full max-w-3xl rounded border mx-auto"
      />
      <button
        className="bg-white text-black p-5"
        onClick={() => (videoRef.current!.muted = false)}
      >
        🔊 Unmute
      </button>
      <button
        className="bg-white text-black p-5"
        onClick={() => {
          const video = videoRef.current;
          if (!video) return;
          video.play().then(() => {
            console.log("▶️ Manual play triggered");
          });
        }}
      >
        ▶️ Play Video
      </button>
      <button
        className="bg-white text-black p-5"
        onClick={() => console.log(videoRef?.current?.srcObject)}
      >
        📦 Inspect Stream
      </button>
    </div>
  );
}
