"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MoreVertical,
  UserPlus,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  followUser,
  getUserProfileById,
  getUserRegimes,
  unfollowUser,
} from "@/lib/api/profile";
import { EventCard, EventCardSkeleton } from "@/components/events/event-card";

interface TabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const Tab = ({ label, active, onClick }: TabProps) => (
  <button
    onClick={onClick}
    className={`flex-1 py-4 font-medium text-center ${
      active ? "text-[#5850EC] border-b-2 border-[#5850EC]" : "text-gray-500"
    }`}
  >
    {label}
  </button>
);

export default function OtherProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("about");
  const [showFullBio, setShowFullBio] = useState(false);

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["public-profile", id, session?.accessToken],
    queryFn: () =>
      getUserProfileById(session?.accessToken as string, id as string),
    enabled: !!session?.accessToken && !!id,
  });

  const { data: regimesData, isLoading: isRegimesLoading } = useQuery({
    queryKey: ["public-profile-regimes", id, session?.accessToken],
    queryFn: () =>
      getUserRegimes(session?.accessToken as string, id as string, 1, 20),
    enabled: !!session?.accessToken && !!id && activeTab === "event",
  });

  const bio = profile?.bio ?? "Nothing to show.";

  const displayBio =
    showFullBio || bio.length <= 120 ? bio : `${bio.substring(0, 120)}...`;

  const isFollowing = profile?.isFollowing ?? false;
  const followerCount = profile?.followersCount ?? 0;
  const followingCount = profile?.followingCount ?? 0;

  const handleFollowToggle = async () => {
    if (!session?.accessToken || !id) {
      router.push("/signin");
      return;
    }
    try {
      if (isFollowing) {
        await unfollowUser(session.accessToken, id as string);
      } else {
        await followUser(session.accessToken, id as string);
      }
      await refetchProfile();
    } catch {
      // ignore for now
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-gray-800 hover:text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
          {/* Profile Image */}
          <div className="mb-4 md:mb-0">
            <div className="w-32 h-32 rounded-full overflow-hidden">
              <Image
                src={profile?.photo ?? "/placeholder-dp.jpg"}
                alt="Profile"
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Profile Info - Desktop */}
          <div className="hidden md:block flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {profile?.name || profile?.userName || "User"}
                </h2>
                <div className="flex items-center gap-6 mb-4">
                  <div className="text-center">
                    <div className="font-bold">{followingCount}</div>
                    <div className="text-gray-500 text-sm">Following</div>
                  </div>
                  <div className="h-10 w-px bg-gray-200"></div>
                  <div className="text-center">
                    <div className="font-bold">{followerCount}</div>
                    <div className="text-gray-500 text-sm">Followers</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {profile?.id !== session?.user.id && (
                  <button
                    onClick={handleFollowToggle}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                      isFollowing
                        ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        : "bg-[#5850EC] text-white hover:bg-[#6C63FF]"
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isFollowing ? "Following" : "Follow"}</span>
                  </button>
                )}
                <button className="flex items-center gap-2 border border-[#5850EC] text-[#5850EC] px-6 py-2 rounded-lg hover:bg-[#5850EC]/5 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>Messages</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info - Mobile */}
        <div className="flex flex-col items-center md:hidden">
          <h2 className="text-2xl font-bold mb-2">{profile?.name ?? "User"}</h2>
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <div className="font-bold">{followingCount}</div>
              <div className="text-gray-500 text-sm">Following</div>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="text-center">
              <div className="font-bold">{followerCount}</div>
              <div className="text-gray-500 text-sm">Followers</div>
            </div>
          </div>

          <div className="flex gap-2 w-full mb-6">
            <button
              onClick={handleFollowToggle}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                isFollowing
                  ? "border border-gray-300 text-gray-700"
                  : "bg-[#5850EC] text-white"
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>{isFollowing ? "Following" : "Follow"}</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 border border-[#5850EC] text-[#5850EC] py-3 rounded-lg">
              <MessageCircle className="w-5 h-5" />
              <span>Messages</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex">
            <Tab
              label="ABOUT"
              active={activeTab === "about"}
              onClick={() => setActiveTab("about")}
            />
            <Tab
              label="EVENT"
              active={activeTab === "event"}
              onClick={() => setActiveTab("event")}
            />
            <Tab
              label="REVIEWS"
              active={activeTab === "reviews"}
              onClick={() => setActiveTab("reviews")}
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "about" && (
          <div>
            <p className="text-gray-600 mb-1">{displayBio}</p>
            {bio.length > 120 && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="text-[#5850EC] flex items-center hover:underline"
              >
                {showFullBio ? "Show Less" : "Read More"}
                <ChevronDown
                  className={`w-4 h-4 ml-1 transition-transform ${
                    showFullBio ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>
        )}

        {activeTab === "event" && (
          <EventsTab
            isLoading={isRegimesLoading}
            events={regimesData?.data ?? []}
            session={session}
          />
        )}

        {activeTab === "reviews" && <ReviewsTab />}
      </main>
    </div>
  );
}

function EventsTab({
  events,
  isLoading,
  session,
}: {
  events: any[];
  isLoading: boolean;
  session: any;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} session={session} />
      ))}
    </div>
  );
}

function ReviewsTab() {
  const reviews = [
    {
      id: "1",
      author: "Jennifer Fritz",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      rating: 5,
      date: "2 weeks ago",
      content:
        "David organized an amazing event! Everything was well planned and the atmosphere was fantastic. Would definitely attend another event by him.",
      event: "International Kids Safe",
    },
    {
      id: "2",
      author: "Ronald C. Kinch",
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      rating: 4,
      date: "1 month ago",
      content:
        "Great host, very responsive and accommodating. The event was well organized but started a bit late. Otherwise, it was a wonderful experience.",
      event: "A virtual evening of smooth jazz",
    },
    {
      id: "3",
      author: "Clara Tolson",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      rating: 5,
      date: "2 months ago",
      content:
        "Absolutely loved the event! David is an excellent organizer who pays attention to every detail. The venue was perfect and everything ran smoothly.",
      event: "Gala Music Festival",
    },
  ];

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-xl p-4 shadow-sm md:p-6"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={review.avatar || "/placeholder.svg"}
                alt={review.author}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <h3 className="font-semibold">{review.author}</h3>
                <div className="text-sm text-gray-500">{review.date}</div>
              </div>
              <div className="flex flex-col mt-1">
                <div>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 inline ${
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-1">
                  for {review.event}
                </span>
              </div>
            </div>
          </div>
          <p className="text-gray-600">{review.content}</p>
        </div>
      ))}
    </div>
  );
}
