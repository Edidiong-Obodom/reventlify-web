"use client"
import SigninForm from "@/components/signin/form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-4">
      <div className="mx-auto max-w-md space-y-8 pt-16">
        {/* Logo */}
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

        {/* Sign In Form */}
        <SigninForm />
      </div>
    </main>
  );
}
