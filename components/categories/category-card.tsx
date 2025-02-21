interface CategoryCardProps {
  category: {
    id: number
    name: string
    icon: string
    color: string
  }
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <button
      className={`${category.color} text-white p-6 rounded-2xl flex flex-col items-center gap-2 hover:shadow-lg transition-all hover:-translate-y-0.5`}
    >
      <span className="text-3xl mb-2">{category.icon}</span>
      <span className="font-medium">{category.name}</span>
    </button>
  )
}

