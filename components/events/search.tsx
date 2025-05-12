"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Calendar,
  MapPin,
} from "lucide-react";
import Image from "next/image";

interface Event {
  id: string;
  title: string;
  date: string;
  day: string;
  time: string;
  image: string;
  location?: string;
  category?: string;
}

const events: Event[] = [
  {
    id: "1",
    title: "A virtual evening of smooth jazz",
    date: "1ST MAY",
    day: "SAT",
    time: "2:00 PM",
    image:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    location: "Online Event",
    category: "Music",
  },
  {
    id: "2",
    title: "Jo malone london's mother's day",
    date: "1ST MAY",
    day: "SAT",
    time: "2:00 PM",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    location: "London, UK",
    category: "Lifestyle",
  },
  {
    id: "3",
    title: "Women's leadership conference",
    date: "1ST MAY",
    day: "SAT",
    time: "2:00 PM",
    image:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    location: "New York, USA",
    category: "Business",
  },
  {
    id: "4",
    title: "International kids safe parents night out",
    date: "1ST MAY",
    day: "SAT",
    time: "2:00 PM",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    location: "Chicago, USA",
    category: "Family",
  },
  {
    id: "5",
    title: "International gala music festival",
    date: "1ST MAY",
    day: "SAT",
    time: "2:00 PM",
    image:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    location: "Paris, France",
    category: "Music",
  },
];

const categories = [
  "All",
  "Music",
  "Business",
  "Food",
  "Art",
  "Sports",
  "Technology",
  "Family",
  "Lifestyle",
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when the component mounts
    inputRef.current?.focus();
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-800 hover:text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            {/* <h1 className="text-2xl font-bold">Search</h1> */}
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="sticky top-[65px] z-10 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-[#5850EC]" />
              </div>
              <input
                type="text"
                ref={inputRef}
                placeholder="Search Reventlify..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Category Filters */}
          {showFilters && (
            <div className="mt-4 pb-2 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-[#5850EC] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-[#5850EC]/10 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-[#5850EC]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No events found</h2>
            <p className="text-gray-500 text-center max-w-md">
              We couldn't find any events matching your search. Try adjusting
              your filters or search term.
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Link href={`/events/view/${event.id}`} key={event.id}>
                <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow md:h-full flex flex-col">
                  <div className="flex p-4 gap-4 md:flex-col md:items-start">
                    <div className="w-20 h-20 md:w-full md:h-40 rounded-lg overflow-hidden bg-[#5850EC]/10 relative flex-shrink-0">
                      <Image
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#5850EC] font-medium text-sm mb-1">
                        {event.date}- {event.day} -{event.time}
                      </div>
                      <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                        {event.title}
                      </h2>

                      <div className="hidden md:flex flex-col gap-2 mt-4">
                        <div className="flex items-center text-gray-500 text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {event.date}, {event.time}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.category && (
                          <div className="flex items-center text-gray-500 text-sm">
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {event.category}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
