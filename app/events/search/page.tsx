export const metadata = {
  title: "Search Events | Reventlify",
  description:
    "Discover events that match your vibe. Search, explore, and find unforgettable experiences near you or around the world.",
};

import SearchPage from "@/components/events/search";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default function Search() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin w-8 h-8 text-[#5850EC]" />
        </div>
      }
    >
      <SearchPage />
    </Suspense>
  );
}
