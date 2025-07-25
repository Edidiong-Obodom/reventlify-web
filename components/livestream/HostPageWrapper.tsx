"use client";

import Broadcast from "@/components/livestream/broadcaster";
import { notFound, useParams } from "next/navigation";

export default async function HostPageWrapper() {
  const { regimeId } = useParams();

  if (!regimeId) return notFound(); // optional

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-xl font-bold mb-2">
        Hosting Live for Regime ID: {regimeId}
      </h2>
      <Broadcast />
    </div>
  );
}
