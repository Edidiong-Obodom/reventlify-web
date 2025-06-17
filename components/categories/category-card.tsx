import { CategoryCardProps } from "@/lib/interfaces/regimeInterface";
import React from "react";

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const Icon = category.icon;

  return (
    <button className="group border border-gray-300 hover:border-[#5850EC] bg-white p-6 rounded-2xl flex flex-col items-center gap-2 hover:shadow-md transition-all hover:-translate-y-1">
      <Icon className="w-8 h-8 text-gray-500 group-hover:text-[#5850EC] transition-colors" />
      <span className="font-medium text-gray-700 group-hover:text-[#5850EC] transition-colors">
        {category.name}
      </span>
    </button>
  );
};
