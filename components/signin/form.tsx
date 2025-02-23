"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "@/app/auth/01-auth";

const SigninForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [state, action] = useFormState(login, undefined);

  return (
    <form className="space-y-6" action={action}>
      <h2 className="text-3xl font-semibold text-gray-900">Sign in</h2>

      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="abc@email.com"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 pl-10 text-sm outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
          />
        </div>
        {state?.errors?.email && (
          <p className="text-sm text-red-500">{state.errors.email}</p>
        )}

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
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
        {state?.message && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            role="switch"
            aria-checked={rememberMe}
            onClick={() => setRememberMe(!rememberMe)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2 ${
              rememberMe ? "bg-[#6366F1]" : "bg-gray-200"
            }`}
          >
            <span className="sr-only">Remember me</span>
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                rememberMe ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <label className="text-sm text-gray-600">Remember Me</label>
        </div>
        <button className="text-sm text-[#6366F1] hover:underline">
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center rounded-md bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#5558DD] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2"
      >
        SIGN IN
        <ArrowRight className="ml-2 h-4 w-4" />
      </button>

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

      {/* <div className="space-y-3">
        <button className="flex w-full items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2">
          <img
            src="https://www.google.com/favicon.ico"
            alt=""
            className="mr-2 h-4 w-4"
          />
          Login with Google
        </button>
        <button className="flex w-full items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2">
          <img
            src="https://www.facebook.com/favicon.ico"
            alt=""
            className="mr-2 h-4 w-4"
          />
          Login with Facebook
        </button>
      </div> */}

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <button className="text-[#6366F1] hover:underline">Sign up</button>
      </p>
    </form>
  );
};

export default SigninForm;
