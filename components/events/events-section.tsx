import { ChevronRight, CalendarPlus } from "lucide-react";
import { EventCard, EventCardSkeleton } from "./event-card";
import { useQuery } from "@tanstack/react-query";
import { getRegimes } from "@/lib/api/getRegimes";
import Link from "next/link";
import { Session } from "next-auth";

export const EventsSection = ({ session }: { session: Session | null }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["regimes", session?.accessToken],
    queryFn: () => getRegimes(session?.accessToken as string),
  });

  const events = data?.data || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Browse Events</h2>
        <Link
          rel="canonical"
          href={"/events/search"}
          className="text-[#5850EC] hover:underline flex items-center gap-1"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {error && (
          <div className="text-red-500 text-center mt-4 col-span-full">
            <span className="text-4xl ">😬 </span>Oops!
            <br /> Sorry something went wrong. Please check your internet
            connection and try again.
          </div>
        )}

        {isLoading ? (
          [1, 2, 3, 4].map((i) => <EventCardSkeleton key={i} />)
        ) : events.length === 0 ? (
          <>
            {!error && (
              <div className="flex flex-col items-center justify-center text-center py-16 col-span-full">
                <div className="w-20 h-20 bg-[#5850EC]/10 rounded-full flex items-center justify-center mb-4">
                  <CalendarPlus className="w-10 h-10 text-[#5850EC]" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  No Events Available
                </h2>
                <p className="text-gray-500 max-w-md mb-4">
                  There are currently no events to browse. Be the first to
                  create one!
                </p>
                <Link
                  rel="canonical"
                  href="/events/create"
                  className="bg-[#5850EC] text-white px-6 py-3 rounded-full hover:bg-[#4741d7] transition"
                >
                  Create an Event
                </Link>
              </div>
            )}
          </>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
};
