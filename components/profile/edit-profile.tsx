"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Camera, X, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { categories } from "@/lib/constants";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProfile, updateProfile } from "@/lib/api/profile";
import toast from "react-hot-toast";

interface Interest {
  id: string;
  name: string;
  color: string;
}
const categoryStyle = [
  { color: "bg-[#5850EC]" },
  { color: "bg-[#E25C4B]" },
  { color: "bg-[#F4A261]" },
  { color: "bg-[#7B68EE]" },
  { color: "bg-[#4ECDC4]" },
  { color: "bg-[#6FDFDF]" },
  { color: "bg-[#FF6B6B]" },
  { color: "bg-[#8A2BE2]" },
  { color: "bg-[#FF8C00]" },
  { color: "bg-[#3CB371]" },
  { color: "bg-[#FF69B4]" },
  { color: "bg-[#20B2AA]" },
];

const allInterests = categories.map((category, i) => ({
  ...category,
  color: categoryStyle[i]?.color ?? categoryStyle[1].color,
}));

export default function EditProfilePage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.accessToken],
    queryFn: () => getProfile(session?.accessToken as string),
    enabled: !!session?.accessToken,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
      setSelectedInterests(profile.interests ?? []);
      setImagePreview(profile.photo ?? null);
      setPhotoBase64(null);
    }
  }, [profile]);

  const { mutateAsync, isPending: isSaving } = useMutation({
    mutationFn: (payload: {
      name?: string;
      bio?: string;
      interests?: string[];
      photoBase64?: string | null;
    }) => updateProfile(session?.accessToken as string, payload),
  });

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setPhotoBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!session?.accessToken) {
      return toast.error("Please sign in to update your profile.");
    }
    if (!name.trim()) {
      return toast.error("Name cannot be empty.");
    }

    try {
      await mutateAsync({
        name: name.trim(),
        bio,
        interests: selectedInterests,
        ...(photoBase64 !== null ? { photoBase64 } : {}),
      });
      toast.success("Profile updated.");
      setPhotoBase64(null);
    } catch (error: any) {
      toast.error(error?.message ?? "Profile update failed.");
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="text-gray-800 hover:text-gray-600"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-bold">Edit Profile</h1>
            </div>
            <button
              className="flex items-center gap-1 text-[#5850EC] font-medium"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Check className="w-5 h-5" />
              <span className="hidden md:inline">Save Changes</span>
            </button>
          </div>
        </div>
      </header>

      {/* Edit Form */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-2">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              <Image
                src={
                  imagePreview ||
                  "/placeholder.svg"
                }
                alt="Profile"
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 bg-[#5850EC] text-white p-2 rounded-full hover:bg-[#6C63FF] transition-colors cursor-pointer"
            >
              <Camera className="w-5 h-5" />
            </label>
            <input
              type="file"
              id="profile-image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-500">Tap to change profile picture</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 md:bg-white md:p-6 md:rounded-xl md:shadow-sm">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              placeholder={`${session?.user.firstName ?? "John Doe"}`}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
            />
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">
              Write a short bio about yourself
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {allInterests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedInterests.includes(interest.id)
                      ? `${interest.color} text-white`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {interest.name}
                  {selectedInterests.includes(interest.id) && (
                    <X className="w-4 h-4 ml-1 inline-block" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={`${profile?.email ?? session?.user?.email ?? ""}`}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>
        </div>

        {/* Mobile Save Button */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button
            className="w-full bg-[#5850EC] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#6C63FF] transition-colors"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Check className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </div>
      </main>
    </div>
  );
}
