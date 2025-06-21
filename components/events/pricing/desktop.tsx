import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Pricing } from "@/lib/interfaces/regimeInterface";

export default function PricingSidebar({ pricings }: { pricings: Pricing[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const selectedPricing = pricings[selectedIndex];

  const handleSelectPricing = (index: number) => {
    setSelectedIndex(index);
    setQuantity(1); // Reset quantity when selecting a new pricing
  };

  const maxSelectable = Math.min(10, selectedPricing.available_seats);
  const total = selectedPricing.amount * quantity;

  return (
    <div className="hidden md:block w-80 shrink-0">
      <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
        <h3 className="text-1xl font-bold mb-4">Buy Ticket</h3>

        <div className="space-y-4 mb-6">
          {pricings.map((pricing, index) => (
            <div
              key={pricing.id}
              className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border ${
                selectedIndex === index
                  ? "border-[#5850EC] bg-[#5850EC]/10"
                  : "border-gray-200"
              }`}
              onClick={() => handleSelectPricing(index)}
            >
              <span>{pricing.name}</span>
              <span>₦{pricing.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Quantity</span>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
              onClick={() =>
                setQuantity((prev) => Math.min(maxSelectable, prev + 1))
              }
            >
              +
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center font-semibold mb-6">
          <span>Total</span>
          <span>₦{total.toLocaleString()}</span>
        </div>

        <button className="w-full bg-[#5850EC] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#6C63FF] transition-colors">
          Buy {quantity} Ticket{quantity > 1 ? "s" : ""}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
