"use client";

import { Menu, Search, X, MapPin, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

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
  const [locationLabel, setLocationLabel] = useState<string>("Location");

  const handleFocus = () => {
    router.push("/events/search"); // replace with your desired route
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`;
          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();
          const address = data?.address ?? {};
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.county ||
            null;
          const state = address.state || address.region || null;
          const country = address.country || null;
          const parts = [city, state, country].filter(Boolean);
          if (parts.length > 0) {
            setLocationLabel(parts.join(", "));
          }
        } catch {
          // ignore reverse geocode errors
        }
      },
      () => {
        // ignore geolocation errors
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }, []);
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#5850EC] text-white z-30">
      <div className={`max-w-7xl mx-auto md:w-[80%]`}>
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
            <div className="flex items-center gap-1 ml-3 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{locationLabel}</span>
            </div>
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
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{locationLabel}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <Link
              href="/about"
              className="hover:text-white/80 transition-colors"
            >
              About
            </Link>
            <Link
              rel="canonical"
              href="/events/create"
              className="hover:text-white/80 transition-colors"
            >
              Create Events
            </Link>
            <Link
              rel="canonical"
              href="/signin"
              className="hover:text-white/80 transition-colors"
            >
              Log In
            </Link>
            <Link
              rel="canonical"
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
