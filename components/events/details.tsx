"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  MapPin,
  ChevronRight,
  Share2,
  Heart,
  Download,
} from "lucide-react";
import ImageFallback from "../image-fallback";
import Link from "next/link";
import { Session } from "next-auth";
import { useSearchParams } from "next/navigation";
import { slugify } from "@/lib/helpers/formatEventDetail";
import { Pricing } from "@/lib/interfaces/regimeInterface";
import MobilePricing from "./pricing/mobile";
import PricingSidebar from "./pricing/desktop";
import { parseMarkdown } from "@/lib";
import DOMPurify from "dompurify";

interface EventDetailProps {
  event?: {
    id: string;
    title: string;
    date: string;
    day: string;
    startTime: string;
    endTime: string;
    location: string;
    address: string;
    organizer: {
      name: string;
      image: string;
    };
    description: string;
    pricings: Pricing[];
    attendees: number;
    image: string;
    gallery: string[];
  };
  session: Session | null;
}

const defaultEvent = {
  id: "1",
  title: "International Band Music Concert",
  date: "14 December, 2021",
  day: "Tuesday",
  startTime: "4:00PM",
  endTime: "9:00PM",
  location: "Gala Convention Center",
  address: "36 Guild Street London, UK",
  organizer: {
    name: "Ashfak Sayem",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  description:
    "Enjoy your favorite dishes and a lovely time with your friends and family and have a great time. Food from local food trucks will be available for purchase. Live performances from international bands will keep you entertained throughout the evening.",
  price: "$120",
  attendees: 20,
  image:
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
};

export default function EventDetailPage({ event, session }: EventDetailProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
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
                  event?.title as string
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
    <div className="flex flex-col min-h-screen bg-white md:bg-gray-50">
      {/* Desktop Header - Only visible on desktop */}
      <header className="hidden md:flex items-center justify-between p-4 bg-white border-b">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Events</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
            <button
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsSaved(!isSaved)}
            >
              {isSaved ? (
                <Bookmark className="w-5 h-5 fill-[#5850EC] text-[#5850EC]" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>
            {/* <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100">
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button> */}
          </div>
        </div>
      </header>

      {/* Hero Image Section */}
      <div className="relative">
        <div className="relative h-[300px] md:h-[500px] w-full">
          <ImageFallback
            src={event?.image as string}
            fallbackSrc="/placeholder.jpg"
            alt={event?.title as string}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        {/* Mobile Header - Only visible on mobile */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 md:hidden">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          {/* <div className="text-white text-lg font-semibold">Event Details</div> */}
          <div className="flex flex-row">
            <button
              onClick={handleShare}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button
              className="w-10 h-10 flex ml-4 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Bookmark
                className={`w-5 h-5 text-white ${isSaved ? "fill-white" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Attendees Bar - Positioned over the bottom of the image */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[80%] max-w-3xl bg-white rounded-full shadow-lg py-3 px-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex -space-x-2 mr-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                >
                  <ImageFallback
                    src={`https://i.pravatar.cc/100?img=${i}`}
                    fallbackSrc="placeholder-dp.jpg"
                    alt={`Attendee ${i}`}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <span className="text-[#5850EC] font-medium">
              {event?.attendees === 0
                ? "Be the first to join!"
                : `+${event?.attendees} Going`}
            </span>
          </div>
          <button className="bg-[#5850EC] text-white px-6 py-2 rounded-full hover:bg-[#6C63FF] transition-colors">
            Invite
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col md:flex-row md:max-w-7xl md:mx-auto md:mt-16 md:px-8 md:gap-8">
        {/* Main Content */}
        <div className="flex-1 px-4 pt-12 md:pt-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">
            {event?.title}
          </h1>

          {/* Event Details */}
          <div className="space-y-6 mb-8">
            <div className="flex items-start">
              <div className="w-14 h-14 bg-[#5850EC]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-[#5850EC]" />
              </div>
              <div className="ml-4">
                <h3 className="text-[1.2rem] font-semibold">{event?.date}</h3>
                <p className="text-gray-500">
                  {event?.day}, {event?.startTime} - {event?.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-14 h-14 bg-[#5850EC]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-[#5850EC]" />
              </div>
              <div className="ml-4">
                <h3 className="text-[1.2rem] font-semibold">
                  {event?.location}
                </h3>
                <p className="text-gray-500">{event?.address}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-14 h-14 overflow-hidden rounded-xl flex-shrink-0">
                <ImageFallback
                  src={event?.organizer.image as string}
                  fallbackSrc="/placeholder-dp.jpg"
                  alt={event?.organizer.name as string}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="ml-4 flex flex-1 items-center justify-between">
                <div>
                  <h3 className="text-[1.2rem] font-semibold">
                    {event?.organizer?.name}
                  </h3>
                  <p className="text-gray-500">Organizer</p>
                </div>
                <button
                  className={`px-6 py-2 rounded-full border ${
                    isFollowing
                      ? "border-[#5850EC] text-[#5850EC]"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>
          </div>

          {/* About Event */}
          <div className="mb-8">
            <h2 className="text-1xl font-bold mb-4">About Event</h2>
            {/* <p className="text-gray-600 leading-relaxed">
              {event?.description}
            </p> */}
            <div
              className="prose prose-p:my-1 prose-ul:my-1 prose-li:my-1" // Optional: if you're using Tailwind typography
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  parseMarkdown(event?.description as string)
                ),
              }}
            />
          </div>

          {/* Additional Content for Desktop */}
          <div className="block space-y-8 mb-8">
            <div>
              <h2 className="text-1xl font-bold mb-4">Lineup</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <ImageFallback
                          src={`https://i.pravatar.cc/100?img=${i + 10}`}
                          fallbackSrc="/placeholder.svg?height=48&width=48"
                          alt={`Artist ${i}`}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">Band Name {i}</h3>
                        <p className="text-sm text-gray-500">
                          Main Stage • {i + 4}:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {event?.gallery && event?.gallery.length > 0 && (
              <div>
                <h2 className="text-1xl font-bold mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {event?.gallery.map((galleryImage, i) => (
                    <div
                      key={`Gallery-image-${i}`}
                      className="aspect-square rounded-xl overflow-hidden"
                    >
                      <ImageFallback
                        src={galleryImage}
                        fallbackSrc="/placeholder.jpg"
                        alt={`Gallery image ${i}`}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="block md:hidden h-[100px]"></div>
          </div>
        </div>

        {/* Sidebar for Desktop */}
        <PricingSidebar pricings={event?.pricings as Pricing[]} />
      </div>

      {/* Mobile Buy Ticket Button */}
      <MobilePricing pricings={event?.pricings as Pricing[]} />
    </div>
  );
}
