"use client";
import SigninForm from "@/components/signin/form";
import { IoArrowBackOutline } from "react-icons/io5";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleBack = () => {
    sessionStorage.removeItem("sendVMail");
    router.push("/");
  };
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
      <div className="mx-auto max-w-md space-y-8 pt-16">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/img/Reventlify.png"
            alt="Reventlify"
            // fill
            width={65}
            height={65}
            className="object-cover border rounded-full"
          />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Reventlify
          </h1>
        </div>

        {/* Sign In Form */}
        <SigninForm />
      </div>
    </main>
  );
}
