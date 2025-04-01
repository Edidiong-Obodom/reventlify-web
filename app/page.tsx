"use client";

import { useRef, useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Header } from "@/components/header/header";
import { FeaturedEvent } from "@/components/events/featured-event";
import { CategoriesSection } from "@/components/categories/categories-section";
import { EventsSection } from "@/components/events/events-section";
import { useSession } from "next-auth/react";

const events = [
  {
    id: 1,
    title: "International Band Music",
    image:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    location: "36 Guild Street London, UK",
    attendees: 20,
    price: "$50",
    time: "7:30 PM",
  },
  {
    id: 2,
    title: "Jo Malone London",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    location: "Radius Gallery • Santa Cruz, CA",
    attendees: 25,
    price: "$75",
    time: "6:00 PM",
  },
  {
    id: 3,
    title: "Contemporary Art Exhibition",
    image:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    location: "Modern Art Gallery, Paris",
    attendees: 40,
    price: "Free",
    time: "10:00 AM",
  },
  {
    id: 4,
    title: "Food & Wine Festival",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    location: "Waterfront Park, San Francisco",
    attendees: 100,
    price: "$120",
    time: "4:00 PM",
  },
];

const categories = [
  {
    id: 1,
    name: "Music",
    icon: "🎵",
    color: "bg-[#FEA1BF]",
  },
  {
    id: 2,
    name: "Travel",
    icon: "✈️",
    color: "bg-[#FFD460]",
  },
  {
    id: 3,
    name: "Business",
    icon: "💼",
    color: "bg-[#29ABE2]",
  },
  {
    id: 4,
    name: "Food",
    icon: "🍔",
    color: "bg-[#77D353]",
  },
  {
    id: 5,
    name: "Sport",
    icon: "⚽",
    color: "bg-[#A280FF]",
  },
];

const featuredEvent = {
  title: "Summer Music Festival 2024",
  image:
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  date: "15-17 JUNE",
  location: "Central Park, New York",
  attendees: 1500,
  description:
    "The biggest music festival of the year featuring top artists from around the world.",
};

const Page = () => {
  const { data: session } = useSession();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isSet, setIsSet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      console.log("session:: ", session);
      setIsSet(true)

      // if (window.innerWidth >= 768) {
      //   setIsMenuOpen(true)
      // }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if(isSet){
  return (
    <div className="flex min-h-screen md:relative bg-gray-50 eddyContainerFull">
      {/* Backdrop Overlay */}
      {isMobile && isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <Sidebar
        isMenuOpen={isMenuOpen}
        isMobile={isMobile}
        sidebarRef={sidebarRef}
      />

      <div className="flex-1">
        <Header
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          isMobile={isMobile}
        />
        {/* <div className="hidden md:block md:w-[10%]"></div> */}

        <main className="max-w-7xl mx-auto p-4 md:p-8 md:w-[90%] md:mr-0 md:h-[87vh] overflow-y-scroll scrollbar-hide mt-16">
          {" "}
          {/* Added mt-16 for header spacing */}
          <FeaturedEvent event={featuredEvent} />
          <CategoriesSection categories={categories} />
          <EventsSection events={events} />
        </main>
      </div>
    </div>
  ); 
} else{return ""}
};

export default Page;
