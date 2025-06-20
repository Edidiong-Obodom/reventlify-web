"use client";

import { useRef, useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Header } from "@/components/header/header";
import { CategoriesSection } from "@/components/categories/categories-section";
import { EventsSection } from "@/components/events/events-section";
import { useSession } from "next-auth/react";
import { NonAuthHeader } from "@/components/header/non-auth-header";
import { NonAuthSidebar } from "@/components/sidebar/non-auth-sidebar";
import { FeaturedCarousel } from "@/components/events/featured-events-carousel";
import { Music, Briefcase, Plane, Utensils, Volleyball } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Music",
    icon: Music,
  },
  {
    id: 2,
    name: "Travel",
    icon: Plane,
  },
  {
    id: 3,
    name: "Business",
    icon: Briefcase,
  },
  {
    id: 4,
    name: "Food",
    icon: Utensils,
  },
  {
    id: 5,
    name: "Sport",
    icon: Volleyball,
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
      setIsSet(true);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isSet) {
    return (
      <div className="flex min-h-screen md:relative bg-gray-50 eddyContainerFull">
        {/* Backdrop Overlay */}
        {isMobile && isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {session ? (
          <Sidebar
            isMenuOpen={isMenuOpen}
            isMobile={isMobile}
            sidebarRef={sidebarRef}
            session={session}
          />
        ) : (
          <NonAuthSidebar
            isMenuOpen={isMenuOpen}
            isMobile={isMobile}
            sidebarRef={sidebarRef}
          />
        )}

        <div className="flex-1">
          {session ? (
            <Header
              isMenuOpen={isMenuOpen}
              isMobile={isMobile}
              setIsMenuOpen={setIsMenuOpen}
            />
          ) : (
            <NonAuthHeader
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              isMobile={isMobile}
            />
          )}
          {/* <div className="hidden md:block md:w-[10%]"></div> */}

          <main
            className={`max-w-7xl mx-auto p-4 md:p-8 md:w-[90%] md:h-[87vh] overflow-y-scroll scrollbar-hide mt-16${
              session ? " md:mr-0" : ""
            }`}
          >
            {" "}
            {/* Added mt-16 for header spacing */}
            <FeaturedCarousel session={session} />
            <CategoriesSection categories={categories} />
            <EventsSection session={session} />
          </main>
        </div>
      </div>
    );
  } else {
    return "";
  }
};

export default Page;
