"use client";
import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const SignUpDetails = ({
  setStep1,
}: {
  setStep1: Dispatch<SetStateAction<boolean>>;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendSignUpcode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const req = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/signup/send-code`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
            userName,
          }),
        }
      );
      const res = await req.json();

      if (req.status === 200) {
        sessionStorage.setItem(
          "sendVMail",
          JSON.stringify({ email, userName })
        );
        setLoading(false);
        setStep1(true);
      } else {
        setLoading(false);
        setError(res?.message);
        setStep1(false);
      }
    } catch (error: any) {
      setLoading(false);
      setError(error?.message);
      setStep1(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      {/* Sign Up Form */}
      <form className="space-y-6" onSubmit={sendSignUpcode}>
        {error && <p className="text-red-500 text-md text-center">{error}</p>}
        <h1 className="text-2xl font-semibold text-gray-900">Sign up</h1>

        <div className="space-y-4">
          {/* Username Input */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <input
              type="text"
              placeholder="Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 pl-10 text-sm outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="abc@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 pl-10 text-sm outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
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
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </button>
          </div>
        </div>

        {/* Sign Up Button */}
        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-full bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#5558DD] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2"
        >
          <span className="flex-1 text-center font-semibold">
            {loading ? "LOADING..." : "SIGN UP"}
          </span>
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* OR Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gradient-to-br from-white to-gray-50 px-2 text-gray-500">
              OR
            </span>
          </div>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/signin" className="text-[#6366F1] hover:underline">
            Signin
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUpDetails;
