"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchForRegimes } from "@/lib/api/getRegimes";
import { Loader2, AlertCircle } from "lucide-react";
import EventDetailPage from "@/components/events/details";
import { formatEventDetail } from "@/lib/helpers/formatEventDetail";

export default function EventDetailPageWrapper() {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["event-detail", id],
    queryFn: () =>
      searchForRegimes({ searchString: id as string, page: 1, limit: 1 }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-[#5850EC]" />
      </div>
    );
  }

  if (error || !data?.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Event Not Found</h2>
        <p className="text-gray-500 max-w-md mb-4">
          We couldn't find the event you're looking for. It may have been
          removed.
        </p>
      </div>
    );
  }

  const event = formatEventDetail(data.data[0]);

  return <EventDetailPage event={event} />;
}
