"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getBookmarkedRegimes } from "@/lib/api/bookmarks";
import { EventCard, EventCardSkeleton } from "./event-card";
import { categories } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";

export default function BookmarksPage() {
  const { data: session } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const limit = 10;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["bookmarks", session?.accessToken],
    queryFn: ({ pageParam = 1 }) =>
      getBookmarkedRegimes(session?.accessToken as string, pageParam, limit),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage?.data.length < limit) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    enabled: !!session?.accessToken,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const checkPageHeight = () => {
      if (
        window.innerHeight >= document.body.offsetHeight - 500 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    checkPageHeight();

    window.addEventListener("resize", checkPageHeight);

    return () => window.removeEventListener("resize", checkPageHeight);
  }, [data, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!session?.accessToken) {
    return (
      <div className="min-h-screen bg-white md:bg-gray-50 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-semibold mb-2">Sign in to view bookmarks</h2>
        <p className="text-gray-500 max-w-md mb-6">
          Your saved events are tied to your account.
        </p>
        <Link
          href="/signin"
          className="bg-[#5850EC] text-white px-6 py-3 rounded-full hover:bg-[#4741d7] transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const allEvents = data?.pages.flatMap((page) => page.data) || [];
  const visibleEvents = allEvents.filter(
    (event) => !removedIds.includes(String(event.id))
  );

  const filteredEvents = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase();
    return visibleEvents.filter((event) => {
      const matchesCategory =
        selectedCategory === "All" || event.type === selectedCategory;
      if (!search) return matchesCategory;
      const haystack = `${event.name} ${event.venue} ${event.city} ${event.state} ${event.country}`.toLowerCase();
      return matchesCategory && haystack.includes(search);
    });
  }, [visibleEvents, debouncedSearch, selectedCategory]);

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-800 hover:text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>

            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-[#5850EC]" />
              </div>
              <input
                type="text"
                ref={inputRef}
                placeholder="Search bookmarks..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full ${
                showFilters || selectedCategory !== "All"
                  ? "bg-[#5850EC] text-white"
                  : "bg-[#5850EC]/10 text-[#5850EC]"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden md:inline">Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pb-2 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      selectedCategory === category.id
                        ? setSelectedCategory("All")
                        : setSelectedCategory(category.id)
                    }
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${
                      selectedCategory === category.id
                        ? "bg-[#5850EC] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {error && (
          <div className="text-red-500 text-center mt-4">
            <span className="text-4xl ">😬 </span>Oops!
            <br /> Sorry something went wrong. Please check your internet
            connection and try again.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <>
            {!error && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-[#5850EC]/10 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-[#5850EC]" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  No bookmarks found
                </h2>
                <p className="text-gray-500 text-center max-w-md">
                  Save events to see them here later.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <div rel="canonical" key={event.id}>
                <EventCard
                  event={event}
                  session={session}
                  isBookmarked={true}
                  onBookmarkChange={(isBookmarked) => {
                    if (!isBookmarked) {
                      setRemovedIds((prev) => [
                        ...new Set([...prev, String(event.id)]),
                      ]);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {isFetchingNextPage && (
          <div className="mt-6 space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <EventCardSkeleton key={`loading-${i}`} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

