import { ChevronRight } from "lucide-react"
import { EventCard } from "./event-card"

interface EventsSectionProps {
  events: Array<{
    id: number
    title: string
    image: string
    location: string
    attendees: number
    price: string
    time: string
  }>
}

export const EventsSection = ({ events }: EventsSectionProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Upcoming Events</h2>
        <button className="text-[#5850EC] hover:underline flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

