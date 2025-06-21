import React, { useRef } from "react";
import { Save, Trash2, CirclePlus, User, Clock } from "lucide-react";
import { randomNumber } from "@/lib";

export interface LineUp {
  id: string;
  title: string;
  time: string;
  image: string; // base64 string
  saved?: boolean;
}

interface LineUpSectionProps {
  lineUps: LineUp[];
  setLineUps: React.Dispatch<React.SetStateAction<LineUp[]>>;
}

export default function LineUpSection({
  lineUps,
  setLineUps,
}: LineUpSectionProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (
    index: number,
    field: keyof LineUp,
    value: string
  ) => {
    setLineUps((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleImageChange = (index: number, file: File | null) => {
    if (!file) {
      // If user cancels the selection, clear the image from the lineup
      setLineUps((prev) =>
        prev.map((item, i) => (i === index ? { ...item, image: "" } : item))
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setLineUps((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, image: reader.result as string } : item
          )
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (index: number) => {
    setLineUps((prev) =>
      prev.map((item, i) => (i === index ? { ...item, saved: true } : item))
    );
  };

  const handleDelete = (index: number) => {
    setLineUps((prev) => prev.filter((_, i) => i !== index));
  };

  const addNewLineUp = () => {
    setLineUps((prev) => [
      ...prev,
      {
        id: String(randomNumber()),
        title: "",
        time: "",
        image: "",
        saved: false,
      },
    ]);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-8">
      <h2 className="text-lg font-semibold mb-4">Event Line Up (Optional)</h2>

      {lineUps.map((lineUp, i) => (
        <div key={i} className={`flex flex-col ${i > 0 ? "mt-4" : ""}`}>
          <h3 className="text-[1.5rem] mb-4">{i + 1}.</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line Up Title{" "}
                  {lineUp.saved ? null : (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={lineUp.title}
                    onChange={(e) =>
                      handleInputChange(i, "title", e.target.value)
                    }
                    placeholder="e.g. DJ Spinall"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                    disabled={lineUp.saved}
                  />
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Performance Time{" "}
                  {lineUp.saved ? null : (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    value={lineUp.time}
                    onChange={(e) =>
                      handleInputChange(i, "time", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                    disabled={lineUp.saved}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line Up Image{" "}
                  {lineUp.saved ? null : (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => {
                    fileInputRefs.current[i] = el;
                  }}
                  onChange={(e) =>
                    handleImageChange(i, e.target.files?.[0] || null)
                  }
                  disabled={lineUp.saved}
                />

                {lineUp.image && (
                  <img
                    src={lineUp.image}
                    alt="Line Up"
                    className="w-8 h-8 mt-2 object-cover rounded"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row justify-between">
                {!lineUp.saved && (
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

      {/* Add New Line Up */}
      <button
        type="button"
        onClick={addNewLineUp}
        className="w-1/4 mt-4 py-4 rounded-xl font-medium transition-all bg-[#5850EC] text-white hover:bg-[#6C63FF] flex items-center justify-center gap-2"
      >
        <CirclePlus />
      </button>
    </div>
  );
}
