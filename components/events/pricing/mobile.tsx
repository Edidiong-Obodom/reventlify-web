import { useState } from "react";
import { ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { Pricing } from "@/lib/interfaces/regimeInterface";

export default function MobilePricing({ pricings }: { pricings: Pricing[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelectPricing = (index: number) => {
    setSelectedIndex(index);
    setQuantity(1); // Reset quantity
    setIsExpanded(true); // Automatically expand when pricing is selected
  };

  const selectedPricing =
    selectedIndex !== null ? pricings[selectedIndex] : null;
  const maxSelectable = selectedPricing
    ? Math.min(10, selectedPricing.available_seats)
    : 10;
  const total = selectedPricing ? selectedPricing.amount * quantity : 0;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      {/* Toggle Arrow */}
      <div className="flex justify-center mb-3">
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-700" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>

      {/* Pricing Options */}
      <div className="flex overflow-x-auto space-x-4 mb-3">
        {pricings.map((pricing, index) => (
          <button
            key={pricing.id}
            className={`flex-shrink-0 min-w-[150px] px-4 py-1 rounded-xl flex flex-col items-center justify-center ${
              selectedIndex === index
                ? "bg-[#5850EC] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => handleSelectPricing(index)}
          >
            <span>{pricing.name}</span>
            <span>₦{pricing.amount.toLocaleString()}</span>
          </button>
        ))}
      </div>

      {/* Slide Toggle Section */}
      {isExpanded && selectedPricing && (
        <div className="transition-all duration-300 ease-in-out">
          {/* Quantity Selector */}
          <div className="flex justify-between items-center mb-3">
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

          {/* Buy Button */}
          <button className="w-full bg-[#5850EC] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#6C63FF] transition-colors">
            <span>
              Buy {quantity} Ticket{quantity > 1 ? "s" : ""} - ₦
              {total.toLocaleString()}
            </span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
