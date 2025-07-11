// Add this inside your About Page below the Feature Cards or as a separate section.

import { Users, Ticket, DollarSign } from "lucide-react"; // Optional icons for visual appeal

export default function WinWinDiagram() {
  return (
    <section className="py-16 bg-white">
      <h2 className="text-3xl font-bold text-center mb-8">
        Everyone Wins with Reventlify
      </h2>

      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center">
          <Users className="w-16 h-16 text-[#5850EC] mb-4" />
          <h3 className="text-xl font-semibold mb-2">Event Creators</h3>
          <p className="text-gray-600">
            Earn more through boosted ticket sales driven by the community.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <DollarSign className="w-16 h-16 text-[#5850EC] mb-4" />
          <h3 className="text-xl font-semibold mb-2">Affiliates (All Users)</h3>
          <p className="text-gray-600">
            Earn 50% of Reventlify’s profit on each ticket you sell. No
            barriers.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <Ticket className="w-16 h-16 text-[#5850EC] mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ticket Buyers</h3>
          <p className="text-gray-600">
            Enjoy easy, secure access to exciting events at the best prices.
          </p>
        </div>
      </div>

      <p className="text-center mt-12 text-lg text-gray-600 max-w-2xl mx-auto">
        With Reventlify, everyone benefits — creators sell more, affiliates
        earn, and buyers enjoy unforgettable events. It’s a community where
        success is shared.
      </p>
    </section>
  );
}
