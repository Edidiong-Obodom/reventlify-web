"use client";

import { useEffect, useState } from "react";
import SignUpDetails from "@/components/signup/details";
import { IoArrowBackOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import VerificationScreen from "@/components/signup/verify";

export default function SignupPage() {
  const router = useRouter();
  const [step1, setStep1] = useState(false);
  const [step2, setStep2] = useState(false);

  const handleBack = () => {
    sessionStorage.removeItem("sendVMail");
    router.push("/");
  };

  useEffect(() => {
    const step1PassCheck = sessionStorage.getItem("sendVMail");
    if (step1PassCheck) {
      setStep1(true);
    } else {
      setStep1(false);
    }
  }, [step1]);

  useEffect(() => {
    if (step2) {
      setTimeout(() => {
        sessionStorage.removeItem("sendVMail");
        router.push("/signin");
      }, 3000);
    }
  }, [step2]);
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-4">
      {/* Back Button */}
      <button
        type="button"
        onClick={handleBack}
        onKeyDown={handleBack}
        className="mb-6 p-2 -ml-2 hover:bg-gray-100 rounded-full"
      >
        <IoArrowBackOutline className="text-2xl" />
      </button>
      <div className={`mx-auto max-w-md space-y-8 ${step2 ? "" : "pt-16"}`}>
        {/* Logo */}
        {step2 ? (
          ""
        ) : (
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-[#6366F1] p-3">
              <div className="h-full w-full rounded-full bg-[#6366F1] relative">
                <div className="absolute right-0 top-1/2 h-2 w-6 -translate-y-1/2 bg-[#67E8F9] rounded-full" />
              </div>
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-gray-900">
              Reventlify
            </h1>
          </div>
        )}
        {/* form */}
        {!step1 ? (
          <SignUpDetails setStep1={setStep1} />
        ) : (
          <VerificationScreen setStep2={setStep2} />
        )}
      </div>
    </main>
  );
}
