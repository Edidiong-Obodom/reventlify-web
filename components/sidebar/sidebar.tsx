import type React from "react";
import {
  Crown,
  Users,
  Bell,
  Clock,
  Heart,
  ImagePlus,
  Ticket,
  ArrowRightLeft,
  Settings,
} from "lucide-react";
import ImageFallback from "../image-fallback";
import { SidebarItem } from "./sidebar-item";
import { RefObject } from "react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";

const menuItems = [
  {
    label: "My Profile",
    link: "/profile",
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: "Notifications",
    link: "/notifications",
    icon: <Bell className="w-5 h-5" />,
    badge: 3,
  },
  {
    label: "Calendar",
    link: "/create-event",
    icon: <Clock className="w-5 h-5" />,
  },
  {
    label: "Bookmarks",
    link: "/create-event",
    icon: <Heart className="w-5 h-5" />,
  },
  {
    label: "Create Event",
    link: "/events/create",
    icon: <ImagePlus className="w-5 h-5" />,
  },
  {
    label: "My Tickets",
    link: "/tickets",
    icon: <Ticket className="w-5 h-5" />,
  },
  {
    label: "Transactions",
    link: "/transactions",
    icon: <ArrowRightLeft className="w-5 h-5" />,
  },
  // {
  //   label: "Settings",
  //   link: "/create-event",
  //   icon: <Settings className="w-5 h-5" />,
  // },
];

interface SidebarProps {
  isMenuOpen: boolean;
  isMobile: boolean;
  sidebarRef: RefObject<HTMLDivElement | null>;
  session: Session;
}

export const Sidebar = ({
  isMenuOpen,
  isMobile,
  sidebarRef,
  session,
}: SidebarProps) => {
  const router = useRouter();
  return (
    <div
      ref={sidebarRef}
      className={`${
        isMobile
          ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
              isMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`
          : "absolute left-0 top-0 h-screen z-10 md:pt-12"
      } flex flex-col bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 ${
        !isMobile && !isMenuOpen ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-6 md:mt-3 md:mr-3 border-b border-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-offset-2 ring-[#5850EC]">
            <ImageFallback
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
              fallbackSrc="/placeholder-dp.jpg"
              alt="Profile"
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
          <h2
            className={`text-xl font-semibold transition-opacity duration-300 ${
              !isMobile && !isMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          >
            {session?.user?.firstName ?? "John Doe"}
          </h2>
        </div>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              badge={item.badge}
              link={item.link}
              isMenuOpen={isMenuOpen}
              isMobile={isMobile}
            />
          ))}
        </nav>
      </div>

      {/* Fixed Bottom Section */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          onClick={() =>
            router.push(`/events/search?partner=${session?.user?.id}`)
          }
          className={`w-full bg-gradient-to-r from-[#5850EC] to-[#7668EC] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all hover:-translate-y-0.5 ${
            !isMobile && !isMenuOpen ? "p-3" : ""
          }`}
        >
          <Crown className="w-5 h-5" />
          <span
            className={`transition-opacity duration-300 ${
              !isMobile && !isMenuOpen ? "opacity-0 w-0" : "opacity-100"
            }`}
          >
            Affiliate
          </span>
        </button>
      </div>
    </div>
  );
};
