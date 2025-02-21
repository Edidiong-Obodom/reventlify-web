import type React from "react"
import { Crown, Users, Bell, Clock, Heart, Filter } from "lucide-react"
import ImageFallback from "../image-fallback"
import { SidebarItem } from "./sidebar-item"
import { RefObject } from "react"

const menuItems = [
  { label: "My Profile", icon: <Users className="w-5 h-5" /> },
  { label: "Messages", icon: <Bell className="w-5 h-5" />, badge: 3 },
  { label: "Calendar", icon: <Clock className="w-5 h-5" /> },
  { label: "Bookmarks", icon: <Heart className="w-5 h-5" /> },
  { label: "Settings", icon: <Filter className="w-5 h-5" /> },
]

interface SidebarProps {
  isMenuOpen: boolean
  isMobile: boolean
  sidebarRef: RefObject<HTMLDivElement | null>
}

export const Sidebar = ({ isMenuOpen, isMobile, sidebarRef }: SidebarProps) => {
  return (
    <div
      ref={sidebarRef}
      className={`${
        isMobile
          ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`
          : "fixed top-0 h-screen z-10 md:pt-12"
      } flex flex-col bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 ${
        !isMobile && !isMenuOpen ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-offset-2 ring-[#5850EC]">
            <ImageFallback
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
              fallbackSrc="/placeholder.svg?height=80&width=80"
              alt="Profile"
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
          <h2
            className={`text-xl font-semibold transition-opacity duration-300 ${!isMobile && !isMenuOpen ? "opacity-0" : "opacity-100"}`}
          >
            John Doe
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
              isMenuOpen={isMenuOpen}
              isMobile={isMobile}
            />
          ))}
        </nav>
      </div>

      {/* Fixed Bottom Section */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          className={`w-full bg-gradient-to-r from-[#5850EC] to-[#7668EC] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all hover:-translate-y-0.5 ${
            !isMobile && !isMenuOpen ? "p-3" : ""
          }`}
        >
          <Crown className="w-5 h-5" />
          <span
            className={`transition-opacity duration-300 ${!isMobile && !isMenuOpen ? "opacity-0 w-0" : "opacity-100"}`}
          >
            Upgrade Pro
          </span>
        </button>
      </div>
    </div>
  )
}

