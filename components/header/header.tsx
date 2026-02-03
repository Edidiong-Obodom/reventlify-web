import {
  Menu,
  Search,
  MapPin,
  ChevronDown,
  Bell,
  Filter,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getProfile, updateProfileLocation } from "@/lib/api/profile";

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

export const Header = ({ isMenuOpen, setIsMenuOpen }: HeaderProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [locationLabel, setLocationLabel] = useState<string>("Location");

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.accessToken],
    queryFn: () => getProfile(session?.accessToken as string),
    enabled: !!session?.accessToken,
  });

  const locationFromProfile = useMemo(() => {
    if (!profile) return null;
    const parts = [profile.city, profile.state, profile.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }, [profile]);

  useEffect(() => {
    if (locationFromProfile) {
      setLocationLabel(locationFromProfile);
    }
  }, [locationFromProfile]);

  useEffect(() => {
    if (!session?.accessToken || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await updateProfileLocation(session.accessToken, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            force: false,
          });
          const parts = [
            result.data.city,
            result.data.state,
            result.data.country,
          ].filter(Boolean);
          if (parts.length > 0) {
            setLocationLabel(parts.join(", "));
          }
        } catch {
          // ignore location update failures
        }
      },
      () => {
        // ignore geolocation errors
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }, [session?.accessToken]);

  const handleFocus = () => {
    router.push("/events/search"); // replace with your desired route
  };

  const toNotifications = () => {
    router.push("/notifications"); // replace with your desired route
  };
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#5850EC] text-white z-30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-6 h-6 space-y-1 z-50"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hidden md:flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span className="text-sm font-medium">Menu</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block w-96">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <input
                type="text"
                onFocus={handleFocus}
                placeholder="Search Reventlify..."
                className="w-full bg-white/10 rounded-full pl-10 pr-4 py-2 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{locationLabel}</span>
              {/* <ChevronDown className="w-4 h-4" /> */}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toNotifications}
              onKeyDown={toNotifications}
              className="relative hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* <button className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button> */}
          </div>
        </div>
      </div>
    </header>
  );
};
