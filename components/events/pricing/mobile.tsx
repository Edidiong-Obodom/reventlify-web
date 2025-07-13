import { useState } from "react";
import { ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { Pricing } from "@/lib/interfaces/regimeInterface";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import FullScreenLoader from "@/components/common/loaders/fullScreenLoader";
import { useRouter } from "next/navigation";

export default function MobilePricing({
  pricings,
  regimeId,
  affiliate,
}: Readonly<{
  pricings: Pricing[];
  regimeId: string;
  affiliate?: string | null;
}>) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedPricing = pricings[selectedIndex];
  const maxSelectable = Math.min(10, selectedPricing.available_seats);
  const total = selectedPricing.amount * quantity;

  const handleSelectPricing = (index: number) => {
    setSelectedIndex(index);
    setQuantity(1); // Reset quantity
    setIsExpanded(true); // Automatically expand when pricing is selected
  };

  const handleBuyTicket = async () => {
    setIsLoading(true);

    try {
      console.log(affiliate, session?.user.id);
      const body: any = {
        amount: selectedPricing.amount,
        pricingId: selectedPricing.id,
        regimeId,
        counter: quantity,
      };

      if (affiliate && affiliate !== session?.user.id) {
        body.affiliate = affiliate;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/user/tickets/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`, // Replace this
          },
          body: JSON.stringify(body),
        }
      );

      if (response.status === 401 || response.status === 403) {
        return signOut({
          callbackUrl: `/signin?callbackUrl=${encodeURIComponent(
            window.location.href
          )}`,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        return toast.error(errorData?.message ?? "Purchase failed");
      }

      const result = await response.json();

      if (selectedPricing.amount === 0) {
        return router.push("/tickets");
      }

      const authorizationUrl = result?.authorization_url;
      if (authorizationUrl) {
        window.location.href = authorizationUrl; // ⬅️ Redirect to Paystack
      } else {
        return toast.error("No authorization URL returned");
      }
    } catch (error: any) {
      console.error("Purchase error:", error.message);
      return toast.error(error?.message ?? "Purchase failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      {isLoading && <FullScreenLoader />}
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
          <button
            onClick={handleBuyTicket}
            disabled={isLoading}
            className="w-full bg-[#5850EC] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#6C63FF] transition-colors"
          >
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
