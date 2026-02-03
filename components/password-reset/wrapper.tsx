"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ResetRequest from "./request";
import ResetVerify from "./verify";
import ResetPassword from "./reset";

export default function ResetPasswordWrapper() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("pwResetEmail");
    const storedStep = sessionStorage.getItem("pwResetStep");
    if (storedEmail) {
      setEmail(storedEmail);
    }
    if (storedStep === "2") setStep(2);
    if (storedStep === "3") setStep(3);
  }, []);

  useEffect(() => {
    if (email) {
      sessionStorage.setItem("pwResetEmail", email);
    }
    sessionStorage.setItem("pwResetStep", String(step));
  }, [email, step]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        sessionStorage.removeItem("pwResetEmail");
        sessionStorage.removeItem("pwResetStep");
        router.push("/signin");
      }, 2500);
    }
  }, [success, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-4">
      <div className="mx-auto max-w-md space-y-8 pt-16">
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/img/Reventlify.png"
            alt="Reventlify"
            width={65}
            height={65}
            className="object-cover border rounded-full"
          />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Reventlify
          </h1>
        </div>

        {success ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Password reset successful
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Redirecting to sign in...
            </p>
          </div>
        ) : step === 1 ? (
          <ResetRequest
            onSuccess={(newEmail) => {
              setEmail(newEmail);
              setStep(2);
            }}
          />
        ) : step === 2 ? (
          <ResetVerify
            email={email}
            onBack={() => setStep(1)}
            onSuccess={() => setStep(3)}
          />
        ) : (
          <ResetPassword
            email={email}
            onSuccess={() => setSuccess(true)}
          />
        )}
      </div>
    </main>
  );
}
