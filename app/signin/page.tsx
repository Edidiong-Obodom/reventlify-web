export const metadata = {
  title: "Sign In | Reventlify",
  description:
    "Sign in to your world of endless events. Discover, join, and experience unforgettable moments tailored just for you.",
};

import FullScreenLoader from "@/components/common/loaders/fullScreenLoader";
import LoginPageWrapper from "@/components/signin/wrapper";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<FullScreenLoader backGround="light" />}>
      <LoginPageWrapper />
    </Suspense>
  );
}
