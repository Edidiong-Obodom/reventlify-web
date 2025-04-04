import { Clock, Heart, MapPin } from "lucide-react";
import ImageFallback from "../image-fallback";
import Link from "next/link";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    image: string;
    location: string;
    attendees: number;
    price: string;
    time: string;
  };
}

export const EventCard = ({ event }: EventCardProps) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
      <div className="relative h-48 group">
        <ImageFallback
          src={event.image || "/placeholder.svg"}
          fallbackSrc="/placeholder.svg?height=200&width=300"
          alt={event.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-white rounded-lg p-2">
          <div className="text-[#FF6B6B] text-xl font-bold">10</div>
          <div className="text-[#FF6B6B] text-sm">JUNE</div>
        </div>
        <button className="absolute top-4 right-4 bg-white p-2 rounded-lg hover:scale-110 transition-transform">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Clock className="w-4 h-4" />
          <span>{event.time}</span>
          <span className="px-2 py-0.5 bg-[#5850EC]/10 text-[#5850EC] rounded-full font-medium">
            {event.price}
          </span>
        </div>
        <Link
          href="/events/view/2"
          className="font-bold text-lg mb-2 hover:text-[#5850EC] cursor-pointer transition-colors"
        >
          {event.title}
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white overflow-hidden"
              >
                <ImageFallback
                  src={`https://i.pravatar.cc/100?img=${i}`}
                  fallbackSrc="/placeholder.svg?height=24&width=24"
                  alt={`Attendee ${i}`}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <span className="text-[#5850EC]">+{event.attendees} Going</span>
        </div>
        <div className="flex items-center text-gray-500">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm truncate">{event.location}</span>
        </div>
      </div>
    </div>
  );
};
