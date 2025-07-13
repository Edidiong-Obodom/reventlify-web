import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Pricing } from "@/lib/interfaces/regimeInterface";
import FullScreenLoader from "@/components/common/loaders/fullScreenLoader";
import toast from "react-hot-toast";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PricingSidebar({
  pricings,
  regimeId,
  affiliate,
}: Readonly<{
  pricings: Pricing[];
  regimeId: string;
  affiliate?: string | null;
}>) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const selectedPricing = pricings[selectedIndex];
  const maxSelectable = Math.min(10, selectedPricing.available_seats);
  const total = selectedPricing.amount * quantity;

  const handleSelectPricing = (index: number) => {
    setSelectedIndex(index);
    setQuantity(1);
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

      const authorizationUrl = result.authorization_url;
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
    <>
      {isLoading && <FullScreenLoader />}

      <div className="hidden md:block w-80 shrink-0">
        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
          <h3 className="text-1xl font-bold mb-4">Buy Ticket</h3>

          <div className="space-y-4 mb-6">
            {pricings.map((pricing, index) => (
              <button
                key={pricing.id}
                className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border w-full ${
                  selectedIndex === index
                    ? "border-[#5850EC] bg-[#5850EC]/10"
                    : "border-gray-200"
                }`}
                onClick={() => handleSelectPricing(index)}
                type="button"
              >
                <span>{pricing.name}</span>
                <span>₦{pricing.amount.toLocaleString()}</span>
              </button>
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

          <button
            onClick={handleBuyTicket}
            disabled={isLoading}
            className="w-full bg-[#5850EC] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#6C63FF] transition-colors"
          >
            Buy {quantity} Ticket{quantity > 1 ? "s" : ""}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
