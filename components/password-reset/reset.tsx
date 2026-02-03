"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import FullScreenLoader from "@/components/common/loaders/fullScreenLoader";

export default function ResetPassword({
  email,
  onSuccess,
}: {
  email: string;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must have a minimum of 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/pw-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "Reset failed.");
        return;
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {loading && <FullScreenLoader />}
      {error && <p className="text-red-500 text-md text-center">{error}</p>}
      <h2 className="text-2xl font-semibold text-gray-900">
        Set new password
      </h2>

      <div className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 pl-10 pr-10 text-sm outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
          />
          <button
            type="button"
            className="absolute right-0 top-1/2 -translate-y-1/2 px-3 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 pl-10 pr-10 text-sm outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
          />
        </div>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center rounded-full bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#5558DD] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2"
      >
        <span className="flex-1 text-center font-semibold">
          {loading ? "LOADING..." : "RESET PASSWORD"}
        </span>
      </button>
    </form>
  );
}
