"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Edit, ChevronDown, Pencil, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getProfile, getUserRegimes } from "@/lib/api/profile";
import { categories } from "@/lib/constants";
import { Regime } from "@/lib/interfaces/regimeInterface";

interface Interest {
  id: string;
  name: string;
  color: string;
}

const interestColors = [
  "bg-[#5850EC]",
  "bg-[#E25C4B]",
  "bg-[#F4A261]",
  "bg-[#7B68EE]",
  "bg-[#4ECDC4]",
  "bg-[#6FDFDF]",
  "bg-[#FF6B6B]",
  "bg-[#8A2BE2]",
  "bg-[#FF8C00]",
  "bg-[#3CB371]",
  "bg-[#FF69B4]",
  "bg-[#20B2AA]",
];

export default function UserProfilePage() {
  const { data: session } = useSession();
  const [showFullBio, setShowFullBio] = useState(false);
  const [showParticipantEvents, setShowParticipantEvents] = useState(false);
  const router = useRouter();
  const { data: profile } = useQuery({
    queryKey: ["profile", session?.accessToken],
    queryFn: () => getProfile(session?.accessToken as string),
    enabled: !!session?.accessToken,
  });
  const {
    data: regimesData,
    isLoading: isRegimesLoading,
    error: regimesError,
  } = useQuery({
    queryKey: [
      "profile-regimes",
      profile?.id,
      session?.accessToken,
      showParticipantEvents,
    ],
    queryFn: () =>
      getUserRegimes(
        session?.accessToken as string,
        profile?.id as string,
        1,
        20,
        showParticipantEvents,
      ),
    enabled: !!session?.accessToken && !!profile?.id,
  });

  const editProfile = () => {
    router.push("/profile/edit"); // replace with your desired route
  };
  const bio = profile?.bio ?? "Nothing to show.";
  const displayBio =
    showFullBio || bio.length <= 120 ? bio : `${bio.substring(0, 120)}...`;

  const interests: Interest[] = useMemo(
    () =>
      categories.map((category, i) => ({
        id: category.id,
        name: category.name,
        color: interestColors[i % interestColors.length],
      })),
    [],
  );

  const selectedInterests = profile?.interests ?? [];
  const followersCount = profile?.followersCount ?? 0;
  const followingCount = profile?.followingCount ?? 0;

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-800 hover:text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
          {/* Profile Image */}
          <div className="relative mb-4 md:mb-0">
            <div className="w-32 h-32 rounded-full overflow-hidden">
              <Image
                src={profile?.photo ?? "/placeholder-dp.jpg"}
                alt="Profile"
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
            <button className="absolute bottom-0 right-0 bg-[#5850EC] text-white p-2 rounded-full hover:bg-[#6C63FF] transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Info - Desktop */}
          <div className="hidden md:block flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {profile?.name ?? session?.user.firstName ?? "John Doe"}
                </h2>
                <div className="flex items-center gap-6 mb-4">
                  <div className="text-center">
                    <div className="font-bold">{followingCount}</div>
                    <div className="text-gray-500 text-sm">Following</div>
                  </div>
                  <div className="h-10 w-px bg-gray-200"></div>
                  <div className="text-center">
                    <div className="font-bold">{followersCount}</div>
                    <div className="text-gray-500 text-sm">Followers</div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={editProfile}
                onKeyDown={editProfile}
                className="flex items-center gap-2 border border-[#5850EC] text-[#5850EC] px-6 py-2 rounded-lg hover:bg-[#5850EC]/5 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Info - Mobile */}
        <div className="flex flex-col items-center md:hidden">
          <h2 className="text-2xl font-bold mb-2">
            {profile?.name ?? session?.user.firstName ?? "John Doe"}
          </h2>
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <div className="font-bold">{followingCount}</div>
              <div className="text-gray-500 text-sm">Following</div>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="text-center">
              <div className="font-bold">{followersCount}</div>
              <div className="text-gray-500 text-sm">Followers</div>
            </div>
          </div>

          <button
            onClick={editProfile}
            onKeyDown={editProfile}
            className="flex items-center gap-2 border border-[#5850EC] text-[#5850EC] px-6 py-2 rounded-full w-full max-w-xs justify-center mb-6 hover:bg-[#5850EC]/5 transition-colors"
          >
            <Edit className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* About Me Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2">About Me</h3>
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

        {/* Location Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2">Location</h3>
          <p className="text-gray-600">
            {profile?.city || profile?.state || profile?.country
              ? [profile?.city, profile?.state, profile?.country]
                  .filter(Boolean)
                  .join(", ")
              : "Location not set"}
          </p>
        </div>

        {/* Interests Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Interest</h3>
            <button
              onClick={editProfile}
              onKeyDown={editProfile}
              className="flex items-center gap-1 text-[#5850EC] bg-[#5850EC]/10 px-4 py-1 rounded-full hover:bg-[#5850EC]/20 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              <span>CHANGE</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <div
                key={interest.id}
                className={`${
                  interest.color
                } text-white px-4 py-2 rounded-full ${
                  selectedInterests.includes(interest.id) ? "" : "opacity-50"
                }`}
              >
                {interest.name}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Settings - Desktop Only */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="font-medium">Privacy Settings</div>
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </div>
            <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="font-medium">Notification Preferences</div>
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </div>
            <button
              type="button"
              className="flex justify-between w-full items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/" })}
              onKeyDown={() => signOut({ callbackUrl: "/" })}
            >
              <div className="font-medium">Sign out</div>
              {/* <ArrowLeft className="w-5 h-5 rotate-180" /> */}
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h3 className="text-xl font-bold">
              {showParticipantEvents ? "Participating Events" : "Created Events"}
            </h3>
            <div className="inline-flex rounded-full bg-gray-100 p-1">
              <button
                onClick={() => setShowParticipantEvents(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !showParticipantEvents
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Created
              </button>
              <button
                onClick={() => setShowParticipantEvents(true)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  showParticipantEvents
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Participating
              </button>
            </div>
          </div>
          {isRegimesLoading ? (
            <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
              {[1, 2, 3, 4].map((i) => (
                <CreatedRegimeCardSkeleton key={i} />
              ))}
            </div>
          ) : regimesError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {showParticipantEvents
                ? "Failed to load participating events."
                : "Failed to load created events."}
            </div>
          ) : (regimesData?.data?.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-gray-600">
              {showParticipantEvents
                ? "You are not participating in any events yet."
                : "You have not created any events yet."}
            </div>
          ) : (
            <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
              {regimesData?.data?.map((event) => (
                <CreatedRegimeCard
                  key={event.id}
                  event={event}
                  isParticipantView={showParticipantEvents}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function CreatedRegimeCard({
  event,
  isParticipantView,
}: {
  event: Regime;
  isParticipantView: boolean;
}) {
  const now = Date.now();
  const start = new Date(`${event.start_date}T${event.start_time}`).getTime();
  const end = new Date(`${event.end_date}T${event.end_time}`).getTime();
  const status = now < start ? "upcoming" : now > end ? "ended" : "ongoing";
  const sold = Number(event.total_ticket_sales ?? 0);
  const totalSeats = event.pricings.reduce(
    (sum, price) => sum + Number(price.total_seats ?? 0),
    0,
  );
  const seatsLeft = event.pricings.reduce(
    (sum, price) => sum + Number(price.available_seats ?? 0),
    0,
  );
  const canViewTicketStats =
    !isParticipantView || event.participant_role === "super_admin";

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="relative h-36 w-full">
        <Image
          src={event.regime_banner || "/placeholder.jpg"}
          alt={event.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <Link
            href={`/regimes/${event.id}/dashboard`}
            className="font-semibold text-lg text-gray-900 hover:text-[#0F766E] transition-colors truncate"
          >
            {event.name}
          </Link>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              status === "ongoing"
                ? "bg-emerald-100 text-emerald-700"
                : status === "upcoming"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-700"
            }`}
          >
            {status}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 truncate">
          {event.venue}, {event.city}, {event.state}
        </p>

        {canViewTicketStats ? (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-gray-50 p-2">
              <div className="text-xs text-gray-500">Sold</div>
              <div className="font-semibold text-gray-900">{sold}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-2">
              <div className="text-xs text-gray-500">Left</div>
              <div className="font-semibold text-gray-900">{seatsLeft}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-2">
              <div className="text-xs text-gray-500">Capacity</div>
              <div className="font-semibold text-gray-900">{totalSeats}</div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
            Ticket stats are visible to super_admin participants only.
          </div>
        )}
      </div>
    </div>
  );
}

function CreatedRegimeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-36 w-full bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-2/3 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 bg-gray-100 rounded-lg" />
          <div className="h-12 bg-gray-100 rounded-lg" />
          <div className="h-12 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
