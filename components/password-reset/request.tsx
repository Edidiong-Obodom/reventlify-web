"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import FullScreenLoader from "@/components/common/loaders/fullScreenLoader";

export default function ResetRequest({
  onSuccess,
}: {
  onSuccess: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/pw-reset-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "Failed to send reset code.");
        return;
      }
      onSuccess(email);
    } catch (err: any) {
      setError(err?.message ?? "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {loading && <FullScreenLoader />}
      {error && <p className="text-red-500 text-md text-center">{error}</p>}
      <h2 className="text-2xl font-semibold text-gray-900">
        Reset your password
      </h2>
      <p className="text-sm text-gray-600">
        Enter your email and we’ll send you a reset code.
      </p>

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="abc@email.com"
          required
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 pl-10 text-sm outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
        />
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center rounded-full bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#5558DD] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2"
      >
        <span className="flex-1 text-center font-semibold">
          {loading ? "LOADING..." : "SEND CODE"}
        </span>
      </button>
    </form>
  );
}
