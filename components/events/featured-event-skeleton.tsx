export const FeaturedEventSkeleton = () => {
  return (
    <div className="mb-12 rounded-2xl overflow-hidden bg-gray-200 animate-pulse">
      <div className="relative h-[200px] md:h-[300px] bg-gray-300" />
      <div className="p-8">
        <div className="h-6 w-1/3 bg-gray-300 rounded mb-4"></div>
        <div className="h-10 w-2/3 bg-gray-300 rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
        <div className="h-4 w-5/6 bg-gray-300 rounded mb-6"></div>
        <div className="flex items-center gap-4">
          <div className="h-12 w-32 bg-gray-300 rounded-xl"></div>
          <div className="h-12 w-12 bg-gray-300 rounded-lg"></div>
          <div className="h-12 w-12 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};
