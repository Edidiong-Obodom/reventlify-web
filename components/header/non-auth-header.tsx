"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface NonAuthHeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

export const NonAuthHeader = ({
  isMenuOpen,
  setIsMenuOpen,
  isMobile,
}: NonAuthHeaderProps) => {
  const router = useRouter();

  const handleFocus = () => {
    router.push("/events/search"); // replace with your desired route
  };
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#5850EC] text-white z-30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between p-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-6 h-6 z-50"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Logo */}
          <div className="flex items-center md:hidden">
            {/* <span className="text-xl font-bold">Reventlify</span> */}

            <Image
              src="/img/Reventlify.png"
              alt="Reventlify"
              // fill
              width={30}
              height={30}
              className="object-cover border rounded-full"
            />
          </div>
          <div className="hidden md:flex items-center">
            {/* <span className="text-xl font-bold">Reventlify</span> */}
            <Image
              src="/img/Reventlify.png"
              alt="Reventlify"
              // fill
              width={40}
              height={40}
              className="object-cover border rounded-full mr-3"
            />
            <span className="text-xl font-bold">Reventlify</span>
          </div>

          {/* Search Bar - Center on desktop, hidden on mobile */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <input
                type="text"
                onFocus={handleFocus}
                placeholder="Search Reventlify..."
                className="w-full bg-white/10 rounded-full pl-10 pr-4 py-2 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-colors"
              />
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="#" className="hover:text-white/80 transition-colors">
              Create Events
            </Link>
            <Link href="#" className="hover:text-white/80 transition-colors">
              Help Center
            </Link>
            <Link
              href="/signin"
              className="hover:text-white/80 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="bg-white text-[#5850EC] px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Search Button */}
          <button
            className="md:hidden"
            type="button"
            onClick={handleFocus}
            onKeyDown={handleFocus}
          >
            <Search className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};
