import { ChevronRight } from "lucide-react";
import { EventCard, EventCardSkeleton } from "./event-card";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getRegimes } from "@/lib/api/getRegimes";

export const EventsSection = () => {
  const { data: session } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["regimes", session?.accessToken],
    queryFn: () => getRegimes(session?.accessToken as string),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Browse Events</h2>
        <button className="text-[#5850EC] hover:underline flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? [1, 2, 3, 4].map((i) => <EventCardSkeleton key={i} />)
          : data?.data.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
      </div>
    </div>
  );
};
