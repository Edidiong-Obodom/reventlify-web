"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Edit, ChevronDown, Pencil, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/lib/api/profile";
import { categories } from "@/lib/constants";

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
  const router = useRouter();
  const { data: profile } = useQuery({
    queryKey: ["profile", session?.accessToken],
    queryFn: () => getProfile(session?.accessToken as string),
    enabled: !!session?.accessToken,
  });

  const editProfile = () => {
    router.push("/profile/edit"); // replace with your desired route
  };
  const bio =
    profile?.bio ??
    "Enjoy your favorite dishes and have a great time. Live music and entertainment will be provided throughout the event.";
  const displayBio = showFullBio
    ? bio
    : `${bio.substring(0, 120)}...`;

  const interests: Interest[] = useMemo(
    () =>
      categories.map((category, i) => ({
        id: category.id,
        name: category.name,
        color: interestColors[i % interestColors.length],
      })),
    []
  );

  const selectedInterests = profile?.interests ?? [];

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
                    <div className="font-bold">350</div>
                    <div className="text-gray-500 text-sm">Following</div>
                  </div>
                  <div className="h-10 w-px bg-gray-200"></div>
                  <div className="text-center">
                    <div className="font-bold">346</div>
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
              <div className="font-bold">350</div>
              <div className="text-gray-500 text-sm">Following</div>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="text-center">
              <div className="font-bold">346</div>
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
      </main>
    </div>
  );
}
