"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Tag,
  AlignLeft,
  ImageIcon,
  X,
  Upload,
  Check,
  Sofa,
  CirclePlus,
  Trash2,
  Save,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { categories, countries, nigerianLGAs, states } from "@/lib/constants";
import { randomNumber } from "@/lib";
import { useSession } from "next-auth/react";

interface LGA {
  id: number;
  name: string;
  state_id: number;
  state_code: string;
  state_name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  latitude: number;
  longitude: number;
  wikiDataId: string;
}

interface Pricing {
  pricingName: string;
  pricingTotalSeats: number;
  pricingAmount?: number;
  saved?: boolean;
}

interface EventFormData {
  regimeName: string;
  regimeStartDate: string;
  regimeEndDate: string;
  regimeStartTime: string;
  regimeEndTime: string;
  regimeVenue: string;
  regimeAddress: string;
  regimePricing: Pricing[];
  organizer: string;
  regimeType: string;
  regimeCountry: string;
  regimeState: string;
  regimeCity: string;
  regimeDescription: string;
  regimeAffiliate: boolean;
  regimeMediaBase64: string;
  regimeWithdrawalPin: string;
}

const initialFormData: EventFormData = {
  regimeName: "",
  regimeStartDate: "",
  regimeEndDate: "",
  regimeStartTime: "",
  regimeEndTime: "",
  regimeVenue: "",
  regimeAddress: "",
  regimePricing: [],
  organizer: "",
  regimeType: "",
  regimeCountry: "nigeria",
  regimeState: "lagos",
  regimeCity: "Ikeja",
  regimeDescription: "",
  regimeAffiliate: false,
  regimeMediaBase64: "",
  regimeWithdrawalPin: "",
};

export default function CreateEventPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [lgs, setLgs] = useState<LGA[]>(nigerianLGAs);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState("");
  const [pricingCopy, setPricingCopy] = useState([
    {
      pricingName: "Regular",
      pricingAmount: 0,
      pricingTotalSeats: 50,
      saved: false,
    },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    const newState = formData.regimeState.replaceAll("-", " ");

    const newLGs = nigerianLGAs.filter(
      (lg) => lg.state_name.toLowerCase() === newState
    );
    setLgs(newLGs);
  }, [formData.regimeState]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview URL for the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pricingCopy.length === 0) {
      setErrorMsg(
        "You cannot have 0 pricings for an event, even if it's a free event make one pricing and make the pricing amount 0 and save it."
      );
    }
    setIsSubmitting(true);

    // Simulate API call
    try {
      const request = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/v1/user/regime/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            ...formData,
            regimeMediaBase64: imagePreview,
          }),
        }
      );
      const response = await request.json();
      console.log("Form submitted:", formData);
      console.log("Image:", imagePreview);
      console.log("response:", response);
      setIsSuccess(true);

      // Reset after showing success
      setTimeout(() => {
        setIsSuccess(false);
        setFormData(initialFormData);
        setImagePreview(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInput = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    const newCode = [...pin];
    newCode[index] = value;
    setPin(newCode);

    // Auto focus next input
    if (value !== "" && index < 4) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold">Create New Event</h1>
          </div>

          <button
            type="submit"
            form="event-form"
            disabled={isSubmitting || isSuccess}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              isSuccess
                ? "bg-green-500 text-white"
                : "bg-[#5850EC] text-white hover:bg-[#6C63FF]"
            } disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Created!</span>
              </>
            ) : (
              <span>Create Event</span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <form id="event-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#5850EC]" />
              Event Image
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center">
              {imagePreview ? (
                <div className="relative w-full">
                  <div className="aspect-video w-full relative rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Event preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#5850EC]/10 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-[#5850EC]" />
                  </div>
                  <p className="text-gray-600 mb-2">
                    Drag and drop an image or click to browse
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    Recommended size: 1200 x 630 pixels
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="event-image"
                  />
                  <label
                    htmlFor="event-image"
                    className="px-4 py-2 bg-[#5850EC]/10 text-[#5850EC] rounded-lg cursor-pointer hover:bg-[#5850EC]/20 transition-colors"
                  >
                    Select Image
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="regimeName"
                  value={formData.regimeName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. International Band Music Concert"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Tag className="w-5 h-5 text-gray-400" />
                  </div>
                  <select
                    id="category"
                    name="regimeType"
                    value={formData.regimeType}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC] appearance-none bg-white"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Date*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="startDate"
                      name="regimeStartDate"
                      value={formData.regimeStartDate}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Date*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="endDate"
                      name="regimeEndDate"
                      value={formData.regimeEndDate}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Time*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="startTime"
                      name="regimeStartTime"
                      value={formData.regimeStartTime}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Time*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="endTime"
                      name="regimeEndTime"
                      value={formData.regimeEndTime}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#5850EC]" />
              Location
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="regimeVenue"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Venue Name*
                </label>
                <input
                  type="text"
                  id="regimeVenue"
                  name="regimeVenue"
                  value={formData.regimeVenue}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Gala Convention Center"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address*
                </label>
                <input
                  type="text"
                  id="address"
                  name="regimeAddress"
                  value={formData.regimeAddress}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 36 Guild Street London, UK"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Country
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Tag className="w-5 h-5 text-gray-400" />
                  </div>
                  <select
                    id="country"
                    name="regimeCountry"
                    value={formData.regimeCountry}
                    onChange={handleChange}
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC] appearance-none bg-white"
                  >
                    <option value="" disabled>
                      Select a country
                    </option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  State
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Tag className="w-5 h-5 text-gray-400" />
                  </div>
                  <select
                    id="state"
                    name="regimeState"
                    value={formData.regimeState}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC] appearance-none bg-white"
                  >
                    <option value="" disabled>
                      Select a state
                    </option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Tag className="w-5 h-5 text-gray-400" />
                  </div>
                  <select
                    id="city"
                    name="regimeCity"
                    value={formData.regimeCity}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC] appearance-none bg-white"
                  >
                    <option value="" disabled>
                      Select a city
                    </option>
                    {lgs.map((lg) => (
                      <option key={lg.id} value={lg.name}>
                        {lg.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Ticket Pricing</h2>

            {pricingCopy?.map((pricing, i) => {
              if (pricingCopy[i]?.saved === true) {
                return (
                  <div
                    className={`flex flex-col ${i > 0 ? "mt-4" : ""}`}
                    key={randomNumber()}
                  >
                    <h3 className="text-[1.5rem] mb-4">{i + 1}.</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="organizer"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Pricing Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="pricingName"
                              value={pricingCopy[i].pricingName}
                              disabled
                              placeholder="e.g. Ashfak Sayem"
                              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="price"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Ticket Price
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-[1.5rem] text-gray-400">
                                ₦
                              </span>
                            </div>
                            <input
                              type="number"
                              name="pricingAmount"
                              value={pricingCopy[i].pricingAmount}
                              disabled
                              placeholder="e.g. 120"
                              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="price"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Total Seats
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Sofa className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              name="pricingTotalSeats"
                              value={pricingCopy[i].pricingTotalSeats}
                              disabled
                              placeholder="e.g. 4500"
                              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPricingCopy(
                              pricingCopy.filter((v, ind) => ind !== i)
                            );
                          }}
                          onKeyDown={() => {
                            setPricingCopy(
                              pricingCopy.filter((v, ind) => ind !== i)
                            );
                          }}
                          className={`w-1/4 mt-4 py-2 rounded-xl font-medium transition-all bg-[#DC2626] text-white hover:bg-[#EF4444] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    className={`flex flex-col ${i > 0 ? "mt-4" : ""}`}
                    key={randomNumber()}
                  >
                    <h3 className="text-[1.5rem] mb-4">{i + 1}.</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="organizer"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Pricing Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="pricingName"
                              onChange={(e) => {
                                pricing.pricingName = e.target.value.trim();
                              }}
                              placeholder="e.g. Ashfak Sayem"
                              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="price"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Ticket Price
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-[1.5rem] text-gray-400">
                                ₦
                              </span>
                            </div>
                            <input
                              type="number"
                              name="pricingAmount"
                              onChange={(e) => {
                                pricing.pricingAmount = Number(
                                  e.target.value.trim()
                                );
                              }}
                              placeholder="e.g. 120"
                              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="price"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Total Seats
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Sofa className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              name="pricingTotalSeats"
                              onChange={(e) => {
                                pricing.pricingTotalSeats = Number(
                                  e.target.value.trim()
                                );
                              }}
                              placeholder="e.g. 4500"
                              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                            />
                          </div>
                        </div>
                        <div className="flex flex-row justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setPricingCopy(
                                pricingCopy.map((v, ind) => {
                                  if (ind === i) {
                                    return {
                                      ...pricing,
                                      saved: true,
                                    };
                                  } else {
                                    return v;
                                  }
                                })
                              );
                            }}
                            onKeyDown={() => {
                              setPricingCopy(
                                pricingCopy.map((v, ind) => {
                                  if (ind === i) {
                                    return {
                                      ...pricing,
                                      saved: true,
                                    };
                                  } else {
                                    return v;
                                  }
                                })
                              );
                            }}
                            className={`w-1/4 mt-4 py-2 rounded-xl font-medium transition-all bg-[#16A34A] text-white hover:bg-[#22C55E] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                          >
                            <Save />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPricingCopy(
                                pricingCopy.filter((v, ind) => ind !== i)
                              );
                            }}
                            onKeyDown={() => {
                              setPricingCopy(
                                pricingCopy.filter((v, ind) => ind !== i)
                              );
                            }}
                            className={`w-1/4 mt-4 py-2 rounded-xl font-medium transition-all bg-[#DC2626] text-white hover:bg-[#EF4444] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}

            <button
              type="button"
              onClick={() => {
                setPricingCopy((current) => [
                  ...current,
                  {
                    saved: false,
                    pricingTotalSeats: 50,
                    pricingAmount: 0,
                    pricingName: "Regular",
                  },
                ]);
              }}
              onKeyDown={() => {
                setPricingCopy((current) => [
                  ...current,
                  {
                    saved: false,
                    pricingTotalSeats: 50,
                    pricingAmount: 0,
                    pricingName: "Regular",
                  },
                ]);
              }}
              className={`w-1/4 mt-4 py-4 rounded-xl font-medium transition-all bg-[#5850EC] text-white hover:bg-[#6C63FF] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              <CirclePlus />
            </button>
          </div>

          {/* Code Input */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Withdrawal pin</h2>
            <div className="flex gap-4 justify-center">
              {pin.map((digit, index) => (
                <div
                  key={index}
                  className={`w-[52px] h-[52px] md:w-[72px] md:h-[72px] rounded-2xl relative
                  ${
                    digit
                      ? "border-[#4263EB] border-2"
                      : "border border-[#4263EB]"
                  }`}
                >
                  <input
                    ref={inputRefs[index]}
                    type="number"
                    inputMode="numeric"
                    required
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInput(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-full h-full bg-transparent text-center text-2xl font-semibold focus:outline-none"
                  />
                  {!digit && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-4 h-0.5 bg-[#4263EB] rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Additional Details</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <AlignLeft className="w-5 h-5 text-gray-400" />
                  </div>
                  <textarea
                    id="description"
                    name="regimeDescription"
                    value={formData.regimeDescription}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe your event..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/50 focus:border-[#5850EC]"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Submit Button */}
          <div className="md:hidden">
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className={`w-full py-4 rounded-xl font-medium transition-all ${
                isSuccess
                  ? "bg-green-500 text-white"
                  : "bg-[#5850EC] text-white hover:bg-[#6C63FF]"
              } disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Event...</span>
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Event Created!</span>
                </>
              ) : (
                <span>Create Event</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
