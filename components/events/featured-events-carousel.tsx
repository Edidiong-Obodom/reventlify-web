import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { FeaturedEvent } from "./featured-event";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getPopularRegimes } from "@/lib/api/getRegimes";
import Link from "next/link";
import { FeaturedEventSkeleton } from "./featured-event-skeleton";

export const FeaturedCarousel = () => {
  const { data: session } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["popular-regimes", session?.accessToken],
    queryFn: () => getPopularRegimes(session?.accessToken as string, 1, 3),
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    if (Array.isArray(data?.data) && data.data.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.data.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [data]);

  //   const goToPrevious = () => {
  //     if (Array.isArray(data?.data) && data.data.length > 0) {
  //       setCurrentIndex(
  //         (prevIndex) => (prevIndex - 1 + data.data.length) % data.data.length
  //       );
  //     }
  //   };

  //   const goToNext = () => {
  //     if (Array.isArray(data?.data) && data.data.length > 0) {
  //       setCurrentIndex((prevIndex) => (prevIndex + 1) % data.data.length);
  //     }
  //   };

  if (isLoading) {
    return (
      <div className="relative w-full max-w-7xl mx-auto overflow-hidden rounded-2xl">
        <div className="flex rounded-2xl transition-transform duration-700">
          <div className="w-full px-2">
            <FeaturedEventSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Empty state placeholder
  if (!data?.data.length || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-gray-100 rounded-2xl shadow-sm mb-6">
        <Megaphone className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Feature Your Event Here</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          There are currently no featured events. Get your event in front of
          thousands by featuring it here.
        </p>
        <Link href="/create-event">
          <button className="bg-[#5850EC] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#6C63FF] transition-colors">
            Feature Your Event
          </button>
        </Link>
      </div>
    );
  }

  // Carousel view
  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      <div
        className="flex rounded-2xl transition-transform duration-700"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {data?.data.map((event) => (
          <div key={event.id} className="min-w-full">
            <FeaturedEvent event={event} />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {/* <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur p-2 rounded-full"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button> */}
      {/* <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur p-2 rounded-full"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button> */}

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {data?.data.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? "bg-[#5850EC]" : "bg-[#5850EC]/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
