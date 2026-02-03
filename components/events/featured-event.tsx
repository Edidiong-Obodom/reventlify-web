import { Users, Heart, Share2 } from "lucide-react";
import ImageFallback from "../image-fallback";
import { Regime } from "@/lib/interfaces/regimeInterface";
import moment from "moment";
import { slugify } from "@/lib/helpers/formatEventDetail";
import Link from "next/link";
import { removeMarkdownSyntax } from "@/lib";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { bookmarkRegime, unbookmarkRegime } from "@/lib/api/bookmarks";

export const FeaturedEvent = ({
  event,
  session,
  isBookmarked: isBookmarkedProp,
}: {
  event: Partial<Regime>;
  session?: Session | null;
  isBookmarked?: boolean;
}) => {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(Boolean(isBookmarkedProp));
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  useEffect(() => {
    setIsBookmarked(Boolean(isBookmarkedProp));
  }, [isBookmarkedProp]);
  const handleDate = (start_date: string, end_date: string) => {
    if (start_date !== end_date) {
      return `${start_date?.trim().split("-")[2].slice(0, 2)}-${end_date
        ?.trim()
        .split("-")[2]
        .slice(0, 2)} ${moment()
        .month(Number(start_date?.split("-")[1]) - 1)
        .format("MMMM")
        .toUpperCase()}`;
    }
    return `${start_date?.trim().split("-")[2].slice(0, 2)} ${moment()
      .month(Number(start_date?.split("-")[1]) - 1)
      .format("MMMM")
      .toUpperCase()}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: document.title,
          text: "Check out this event on Reventlify!",
          url: `${process.env.NEXT_PUBLIC_URL}/events/view/${slugify(
            event.name as string
          )}`,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.error("Error sharing", error));
    } else {
      alert("Sharing is not supported in your browser.");
    }
  };

  const handleBookmark = async () => {
    if (!session?.accessToken) {
      toast.error("Please sign in to bookmark events.");
      router.push("/signin");
      return;
    }

    if (!event.id) return;

    try {
      setIsBookmarkLoading(true);
      if (isBookmarked) {
        await unbookmarkRegime(session.accessToken, String(event.id));
        setIsBookmarked(false);
        toast.success("Removed from bookmarks.");
      } else {
        await bookmarkRegime(session.accessToken, String(event.id));
        setIsBookmarked(true);
        toast.success("Saved to bookmarks.");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Bookmark update failed.");
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  return (
    <div className="mb-12 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow">
      <div className="relative h-[400px] md:h-[500px] group">
        <ImageFallback
          src={event.regime_banner as string}
          fallbackSrc="/placeholder.jpg"
          alt={event.name as string}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
              <span className="font-bold">
                {handleDate(
                  event.start_date as string,
                  event.end_date as string
                )}
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{event.total_ticket_sales}+ Going</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
          <p className="text-white/80 mb-4 max-w-2xl truncate">
            {removeMarkdownSyntax(event.description as string)}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={`/events/view/${slugify(event.name as string)}`}
              className="bg-[#5850EC] px-6 py-3 rounded-xl font-medium hover:bg-[#6C63FF] transition-colors"
            >
              Get Tickets
            </Link>
            <button
              onClick={handleBookmark}
              disabled={isBookmarkLoading}
              className="bg-white/20 backdrop-blur p-3 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-70"
            >
              <Heart
                className={`w-6 h-6 ${
                  isBookmarked ? "text-[#FF6B6B] fill-[#FF6B6B]" : ""
                }`}
              />
            </button>
            <button
              onClick={handleShare}
              className="bg-white/20 backdrop-blur p-3 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
