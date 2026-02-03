"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchForRegimes } from "@/lib/api/regimes";
import { Loader2, AlertCircle } from "lucide-react";
import EventDetailPage from "@/components/events/details";
import { formatEventDetail } from "@/lib/helpers/formatEventDetail";
import { useSession } from "next-auth/react";
import FullScreenLoader from "../common/loaders/fullScreenLoader";
import { getBookmarkIds } from "@/lib/api/bookmarks";

export default function EventDetailPageWrapper() {
  const { data: session } = useSession();
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["event-detail", id],
    queryFn: () =>
      searchForRegimes({ searchString: id as string, page: 1, limit: 1 }),
  });

  const { data: bookmarkIds } = useQuery({
    queryKey: ["bookmark-ids", session?.accessToken],
    queryFn: () => getBookmarkIds(session?.accessToken as string),
    enabled: !!session?.accessToken,
  });

  if (isLoading) {
    return <FullScreenLoader backGround="light" />;
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

  const isBookmarked = bookmarkIds?.includes(String(event.id)) ?? false;

  return (
    <EventDetailPage
      event={event}
      session={session}
      isBookmarked={isBookmarked}
    />
  );
}
