"use client";

import { useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import FullScreenLoader from "@/components/common/loaders/fullScreenLoader";

export default function ResetVerify({
  email,
  onSuccess,
  onBack,
}: {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/pw-reset-code/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "Invalid code.");
        return;
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {loading && <FullScreenLoader />}
      {error && <p className="text-red-500 text-md text-center">{error}</p>}
      <h2 className="text-2xl font-semibold text-gray-900">Verify code</h2>
      <p className="text-sm text-gray-600">
        Enter the code sent to <span className="font-medium">{email}</span>
      </p>

      <div className="relative">
        <ShieldCheck className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          id="code"
          name="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter reset code"
          required
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 pl-10 text-sm outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 rounded-full bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#5558DD] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2"
        >
          {loading ? "LOADING..." : "VERIFY"}
        </button>
      </div>
    </form>
  );
}
