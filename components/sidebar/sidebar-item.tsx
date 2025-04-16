import Link from "next/link";
import type { ReactNode } from "react";

interface SidebarItemProps {
  label: string;
  icon: ReactNode;
  badge?: number;
  isMenuOpen: boolean;
  isMobile: boolean;
  link: string;
}

export const SidebarItem = ({
  label,
  icon,
  badge,
  isMenuOpen,
  isMobile,
  link,
}: SidebarItemProps) => {
  return (
    <Link
      href={link}
      className={`flex items-center w-full text-gray-700 hover:text-[#5850EC] transition-all hover:bg-[#5850EC]/5 rounded-lg p-3 group ${
        !isMobile && !isMenuOpen ? "justify-center relative" : ""
      }`}
    >
      <span
        className={`text-gray-400 group-hover:text-[#5850EC] transition-colors ${
          !isMobile && !isMenuOpen ? "mx-auto" : ""
        }`}
      >
        {icon}
      </span>
      <span
        className={`ml-3 transition-opacity duration-300 ${
          !isMobile && !isMenuOpen ? "opacity-0 w-0" : "opacity-100"
        }`}
      >
        {label}
      </span>
      {badge && (
        <span
          className={`${
            !isMobile && !isMenuOpen
              ? "absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center"
              : "ml-auto"
          } bg-[#FF8A65] text-white text-xs px-2 py-0.5 rounded-full transition-opacity duration-300 ${
            !isMobile && !isMenuOpen ? "scale-75" : "opacity-100"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
};
