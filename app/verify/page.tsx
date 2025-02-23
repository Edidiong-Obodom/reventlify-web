"use client";

import { motion, AnimatePresence } from "framer-motion";
import type React from "react";

import { useState, useEffect, useRef } from "react";
import { IoArrowBackOutline } from "react-icons/io5";

export default function VerificationScreen() {
  const [timer, setTimer] = useState(120);
  const [code, setCode] = useState(["", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInput = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value !== "" && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerification = () => {
    setIsVerified(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex justify-center">
      <AnimatePresence>
        {!isVerified ? (
          <div className="w-full max-w-md p-6">
            {/* Back Button */}
            <button className="mb-6 p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <IoArrowBackOutline className="text-2xl" />
            </button>

            {/* Main Content */}
            <div className="space-y-6">
              <h1 className="text-[32px] font-bold text-[#1A1B1E]">
                Verification
              </h1>
              <p className="text-lg text-[#1A1B1E]">
                We've sent the verification
                <br />
                code to edijay17@gmail.com
              </p>

              {/* Code Input */}
              <div className="flex gap-4 py-8 justify-center">
                {code.map((digit, index) => (
                  <div
                    key={index}
                    className={`w-[72px] h-[72px] rounded-2xl relative
                  ${
                    digit
                      ? "border-[#4263EB] border-2"
                      : "border border-[#4263EB]"
                  }`}
                  >
                    <input
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInput(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-full h-full bg-transparent text-center text-2xl font-semibold focus:outline-none"
                    />
                    {!digit && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="w-4 h-0.5 bg-[#4263EB] rounded-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Continue Button */}
              <button
                className="w-full bg-[#4263EB] text-white rounded-full py-4 px-6 flex items-center justify-between
              transition-opacity hover:opacity-90 disabled:opacity-50"
                disabled={!code.every((digit) => digit !== "")}
                onClick={handleVerification}
              >
                <span className="flex-1 text-center font-semibold">
                  CONTINUE
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

              {/* Resend Timer */}
              <div className="text-center mt-8">
                {timer === 0 ? (
                  <button className="text-[#4263EB]">Re-send code</button>
                ) : (
                  <>
                    <span className="text-[#1A1B1E]">Re-send code in </span>
                    <span className="text-[#4263EB]">
                      {`${Math.floor(timer / 60)}:${(timer % 60)
                        .toString()
                        .padStart(2, "0")}`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            key="success"
            className="flex flex-col items-center justify-center min-h-[60vh]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-[#4263EB] flex items-center justify-center mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.4,
              }}
            >
              <motion.svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <path d="M20 6L9 17l-5-5" />
              </motion.svg>
            </motion.div>
            <motion.h2
              className="text-3xl font-bold text-[#1A1B1E] text-center mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              Successful!
            </motion.h2>
            <motion.p
              className="text-lg text-[#1A1B1E]/70 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              Your account has been created successfully
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
