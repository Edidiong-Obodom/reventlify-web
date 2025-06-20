import { ChevronRight } from "lucide-react";
import { CategoryCard } from "./category-card";
import React from "react";
import { Category } from "@/lib/interfaces/regimeInterface";
import Link from "next/link";

interface CategoriesSectionProps {
  categories: Category[];
}

export const CategoriesSection = ({ categories }: CategoriesSectionProps) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Browse Categories</h2>
        <Link
          rel="canonical"
          href={"/events/search"}
          className="text-[#5850EC] hover:underline flex items-center gap-1"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
};
