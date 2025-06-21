import React from "react";
import { Save, Trash2, User, Sofa, CirclePlus } from "lucide-react";

interface Pricing {
  pricingName: string;
  pricingTotalSeats: number;
  pricingAmount?: number;
  saved?: boolean;
}

interface TicketPricingSectionProps {
  pricingCopy: Pricing[];
  setPricingCopy: React.Dispatch<React.SetStateAction<{
    pricingName: string;
    pricingAmount: number;
    pricingTotalSeats: number;
    saved: boolean;
}[]>>;
}

export default function TicketPricingSection({
  pricingCopy,
  setPricingCopy,
}: TicketPricingSectionProps) {
  const handleInputChange = (
    index: number,
    field: keyof Pricing,
    value: string | number
  ) => {
    setPricingCopy((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = (index: number) => {
    setPricingCopy((prev) =>
      prev.map((item, i) => (i === index ? { ...item, saved: true } : item))
    );
  };

  const handleDelete = (index: number) => {
    setPricingCopy((prev) => prev.filter((_, i) => i !== index));
  };

  const addNewPricing = () => {
    setPricingCopy((prev) => [
      ...prev,
      {
        pricingName: "Regular",
        pricingTotalSeats: 50,
        pricingAmount: 0,
        saved: false,
      },
    ]);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Ticket Pricing</h2>

      {pricingCopy.map((pricing, i) => (
        <div key={i} className={`flex flex-col ${i > 0 ? "mt-4" : ""}`}>
          <h3 className="text-[1.5rem] mb-4">{i + 1}.</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pricing Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pricing Name{" "}
                  {pricing.saved ? null : (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="pricingName"
                    value={pricing.pricingName}
                    onChange={(e) =>
                      handleInputChange(i, "pricingName", e.target.value)
                    }
                    placeholder="e.g. VIP"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                    disabled={pricing.saved}
                  />
                </div>
              </div>

              {/* Pricing Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ticket Price{" "}
                  {pricing.saved ? null : (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-[1.5rem] text-gray-400">₦</span>
                  </div>
                  <input
                    type="number"
                    name="pricingAmount"
                    value={pricing.pricingAmount}
                    onChange={(e) =>
                      handleInputChange(
                        i,
                        "pricingAmount",
                        Number(e.target.value)
                      )
                    }
                    placeholder="e.g. 5000"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                    disabled={pricing.saved}
                  />
                </div>
              </div>

              {/* Total Seats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Seats{" "}
                  {pricing.saved ? null : (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Sofa className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="pricingTotalSeats"
                    value={pricing.pricingTotalSeats}
                    onChange={(e) =>
                      handleInputChange(
                        i,
                        "pricingTotalSeats",
                        Number(e.target.value)
                      )
                    }
                    placeholder="e.g. 4500"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                    disabled={pricing.saved}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row justify-between">
                {!pricing.saved && (
                  <button
                    type="button"
                    onClick={() => handleSave(i)}
                    className="w-1/4 mt-4 py-2 rounded-xl font-medium transition-all bg-[#16A34A] text-white hover:bg-[#22C55E] flex items-center justify-center gap-2"
                  >
                    <Save />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(i)}
                  className="w-1/4 mt-4 py-2 rounded-xl font-medium transition-all bg-[#DC2626] text-white hover:bg-[#EF4444] flex items-center justify-center gap-2"
                >
                  <Trash2 />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add New Pricing */}
      <button
        type="button"
        onClick={addNewPricing}
        className="w-1/4 mt-4 py-4 rounded-xl font-medium transition-all bg-[#5850EC] text-white hover:bg-[#6C63FF] flex items-center justify-center gap-2"
      >
        <CirclePlus />
      </button>
    </div>
  );
}
