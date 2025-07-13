import { Clock, Heart, MapPin, Share2 } from "lucide-react";
import ImageFallback from "../image-fallback";
import Link from "next/link";
import moment from "moment";
import { Regime } from "@/lib/interfaces/regimeInterface";
import { capitalizeEachWord, capitalizeFirst } from "@/lib";
import { slugify } from "@/lib/helpers/formatEventDetail";
import { Session } from "next-auth";
import { useSearchParams } from "next/navigation";

export const EventCard = ({
  event,
  coverLink,
  session,
}: {
  event: Partial<Regime>;
  coverLink?: boolean;
  session?: Session | null;
}) => {
  const searchParams = useSearchParams();
  const partner = searchParams.get("partner");
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: document.title,
          text: "Check out this event on Reventlify!",
          url:
            session && partner
              ? `${process.env.NEXT_PUBLIC_URL}/events/view/${slugify(
                  event?.name as string
                )}?partner=${session.user.id}`
              : window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.error("Error sharing", error));
    } else {
      alert("Sharing is not supported in your browser.");
    }
  };
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
      <div className="relative h-48 group">
        <ImageFallback
          src={event.regime_banner as string}
          fallbackSrc="/placeholder.jpg"
          alt={event?.name ?? ""}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-white rounded-lg p-2">
          <div className="text-[#FF6B6B] text-xl font-bold">
            {event.start_date?.split("-")[2].slice(0, 2)}
          </div>
          <div className="text-[#FF6B6B] text-sm">
            {moment()
              .month(Number(event.start_date?.split("-")[1]) - 1)
              .format("MMM")
              .toUpperCase()}
          </div>
        </div>
        {partner && (
          <button
            onClick={handleShare}
            className="absolute bottom-4 right-4 bg-white p-2 rounded-lg hover:scale-110 transition-transform"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <button className="absolute top-4 right-4 bg-white p-2 rounded-lg hover:scale-110 transition-transform">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Clock className="w-4 h-4" />
          <span>{moment(event.start_time, "HH:mm:ss").format("h:mm A")}</span>
          <span className="px-2 py-0.5 bg-[#5850EC]/10 text-[#5850EC] rounded-full font-medium">
            {event.pricings
              ?.filter((price) => price.amount !== 0)
              .sort((a, b) => a.amount - b.amount)[0]?.amount === undefined
              ? "Free"
              : `₦ ${event.pricings
                  ?.filter((price) => price.amount !== 0)
                  .sort((a, b) => a.amount - b.amount)[0]
                  ?.amount.toLocaleString()}`}
          </span>
        </div>
        {coverLink ? (
          event.name
        ) : (
          <Link
            rel="canonical"
            href={`/events/view/${slugify(event.name as string)}${
              session && partner ? `?partner=${session.user.id}` : ""
            }`}
            className="font-bold text-lg mb-2 hover:text-[#5850EC] cursor-pointer transition-colors"
          >
            {event.name}
          </Link>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white overflow-hidden"
              >
                <ImageFallback
                  src={`https://i.pravatar.cc/100?img=${i}`}
                  fallbackSrc="placeholder-dp.jpg"
                  alt={`Attendee ${i}`}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <span className="text-[#5850EC]">
            {event.total_ticket_sales == "0"
              ? "Be the first to join!"
              : `+${event.total_ticket_sales} Going`}
          </span>
        </div>
        <div className="flex items-center text-gray-500">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm truncate">{`${capitalizeFirst(
            event.address as string
          )}, ${capitalizeEachWord(event.city as string)} ${capitalizeFirst(
            event.state as string
          )}, ${capitalizeFirst(event.country as string)}.`}</span>
        </div>
        <div className="flex items-center text-gray-500 mt-3 text-sm">
          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
            {event.type}
          </span>
        </div>
      </div>
    </div>
  );
};

export const EventCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="relative h-48 bg-gray-200"></div>

      <div className="p-4 space-y-3">
        {/* Date and Price Row */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
          <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
        </div>

        {/* Event Title */}
        <div className="h-5 w-3/4 bg-gray-200 rounded"></div>

        {/* Avatars and Going Count */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white"
              ></div>
            ))}
          </div>
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>

        {/* Location */}
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};
