import { useState, useEffect } from "react";
import { AlignLeft, HelpCircle } from "lucide-react"; // You can replace this with any icon library you use

export default function AdditionalDetailsSection({
  data,
  handleChange,
}: {
  data: string;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (showTooltip) {
      timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000); // Hide after 5 seconds
    }

    return () => clearTimeout(timer);
  }, [showTooltip]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Additional Details</h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description<span className="text-red-500">*</span>
          </label>

          <div className="relative">
            {/* Icon inside text area */}
            <div className="absolute top-3 left-3 pointer-events-none">
              <AlignLeft className="w-5 h-5 text-gray-400" />
            </div>

            {/* Help Icon */}
            <button
              type="button"
              onClick={() => setShowTooltip(true)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Tooltip */}
            {showTooltip && (
              <div
                onClick={() => setShowTooltip(false)}
                className="absolute top-10 right-0 bg-gray-100 border border-gray-300 p-3 rounded-lg shadow-lg text-sm w-64 z-10 cursor-pointer"
              >
                <p className="font-semibold mb-1">Formatting Guide:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="font-bold">*bold*</span> ➜ <b>bold</b>
                  </li>
                  <li>
                    <span className="italic">_italic_</span> ➜ <em>italic</em>
                  </li>
                  <li>
                    <span className="">~underline~</span> ➜{" "}
                    <u>underline</u>
                  </li>
                  <li>- Item ➜ bullet list</li>
                  <li>1. Item ➜ ordered list</li>
                </ul>
                <p className="mt-2 text-xs text-gray-500">
                  Click this box to dismiss.
                </p>
              </div>
            )}

            {/* Textarea */}
            <textarea
              id="description"
              name="regimeDescription"
              value={data}
              onChange={handleChange}
              rows={5}
              required
              placeholder="Describe your event..."
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
