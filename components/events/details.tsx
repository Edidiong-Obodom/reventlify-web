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
    price: string;
    attendees: number;
    image: string;
  };
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

export default function EventDetailPage({
  event = defaultEvent,
}: EventDetailProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white md:bg-gray-50">
      {/* Desktop Header - Only visible on desktop */}
      <header className="hidden md:flex items-center justify-between p-4 bg-white border-b">
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
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100">
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
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100">
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
        </div>
      </header>

      {/* Hero Image Section */}
      <div className="relative">
        <div className="relative h-[300px] md:h-[500px] w-full">
          <ImageFallback
            src={event.image || "/placeholder.svg"}
            fallbackSrc="/placeholder.svg?height=500&width=1000"
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        {/* Mobile Header - Only visible on mobile */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 md:hidden">
          <Link
            href="/events"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="text-white text-lg font-semibold">Event Details</div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
            onClick={() => setIsSaved(!isSaved)}
          >
            <Bookmark
              className={`w-5 h-5 text-white ${isSaved ? "fill-white" : ""}`}
            />
          </button>
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
                    fallbackSrc="/placeholder.svg?height=40&width=40"
                    alt={`Attendee ${i}`}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <span className="text-[#5850EC] font-medium">
              +{event.attendees} Going
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
          <h1 className="text-3xl md:text-4xl font-bold mb-8">{event.title}</h1>

          {/* Event Details */}
          <div className="space-y-6 mb-8">
            <div className="flex items-start">
              <div className="w-14 h-14 bg-[#5850EC]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-[#5850EC]" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">{event.date}</h3>
                <p className="text-gray-500">
                  {event.day}, {event.startTime} - {event.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-14 h-14 bg-[#5850EC]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-[#5850EC]" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">{event.location}</h3>
                <p className="text-gray-500">{event.address}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-14 h-14 overflow-hidden rounded-xl flex-shrink-0">
                <ImageFallback
                  src={event.organizer.image || "/placeholder.svg"}
                  fallbackSrc="/placeholder.svg?height=56&width=56"
                  alt={event.organizer.name}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="ml-4 flex flex-1 items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {event.organizer.name}
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
            <h2 className="text-2xl font-bold mb-4">About Event</h2>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>

          {/* Additional Content for Desktop */}
          <div className="block space-y-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Lineup</h2>
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

            <div>
              <h2 className="text-2xl font-bold mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl overflow-hidden"
                  >
                    <ImageFallback
                      src={`https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=${i}`}
                      fallbackSrc="/placeholder.svg?height=200&width=200"
                      alt={`Gallery image ${i}`}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="block md:hidden h-[100px]"></div>
          </div>
        </div>

        {/* Sidebar for Desktop */}
        <div className="hidden md:block w-80 shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{event.price}</h3>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-[#5850EC]/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[#5850EC]" />
                </button>
                <button className="w-10 h-10 rounded-full bg-[#5850EC]/10 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-[#5850EC]" />
                </button>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{event.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time</span>
                <span className="font-medium">
                  {event.startTime} - {event.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location</span>
                <span className="font-medium">{event.location}</span>
              </div>
            </div>

            <button className="w-full bg-[#5850EC] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#6C63FF] transition-colors">
              Buy Ticket
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Buy Ticket Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button className="w-full bg-[#5850EC] text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#6C63FF] transition-colors">
          <span>Buy Ticket {event.price}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
