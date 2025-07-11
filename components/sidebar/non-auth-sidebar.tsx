import type React from "react";
import {
  Home,
  Calendar,
  Info,
  HelpCircle,
  LogIn,
  UserPlus,
} from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import Link from "next/link";
import ImageFallback from "../image-fallback";

const menuItems = [
  { label: "Home", link: "/", icon: <Home className="w-5 h-5" /> },
  { label: "About", link: "/about", icon: <Info className="w-5 h-5" /> },
  {
    label: "Browse Events",
    link: "/events/search",
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    label: "Create Events",
    link: "/events/create",
    icon: <Calendar className="w-5 h-5" />,
  },
  { label: "Help Center", link: "/", icon: <HelpCircle className="w-5 h-5" /> },
];

interface NonAuthSidebarProps {
  isMenuOpen: boolean;
  isMobile: boolean;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
}

export const NonAuthSidebar = ({
  isMenuOpen,
  isMobile,
  sidebarRef,
}: NonAuthSidebarProps) => {
  return (
    <div
      ref={sidebarRef}
      className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      } flex flex-col md:hidden bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300`}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-offset-2 ring-[#5850EC]">
            <ImageFallback
              src="/img/Reventlify.png"
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
            Reventlify
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
              link={item.link}
              isMenuOpen={isMenuOpen}
              isMobile={isMobile}
            />
          ))}
        </nav>
      </div>

      {/* Fixed Bottom Section */}
      <div className="p-4 border-t border-gray-100 bg-white space-y-2">
        <Link
          href="/signin"
          className={`w-full bg-white border border-[#5850EC] text-[#5850EC] py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#5850EC]/5 transition-all ${
            !isMobile && !isMenuOpen ? "p-3" : ""
          }`}
        >
          <LogIn className="w-5 h-5" />
          <span
            className={`transition-opacity duration-300 ${
              !isMobile && !isMenuOpen ? "opacity-0 w-0" : "opacity-100"
            }`}
          >
            Log In
          </span>
        </Link>

        <Link
          href="/signup"
          className={`w-full bg-[#5850EC] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#6C63FF] transition-all ${
            !isMobile && !isMenuOpen ? "p-3" : ""
          }`}
        >
          <UserPlus className="w-5 h-5" />
          <span
            className={`transition-opacity duration-300 ${
              !isMobile && !isMenuOpen ? "opacity-0 w-0" : "opacity-100"
            }`}
          >
            Sign Up
          </span>
        </Link>
      </div>
    </div>
  );
};
