import { Skeleton } from "@nextui-org/react";

export function SkeletonLoader() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center bg-white rounded-lg shadow-md p-4">
                    {/* Title */}
                    <Skeleton className="w-3/4 h-6 rounded mb-2" />
                    {/* Price */}
                    <Skeleton className="w-1/2 h-4 rounded mb-4" />
                    {/* Image */}
                    <Skeleton className="w-full h-40 rounded mb-4" />
                    {/* Description */}
                    <Skeleton className="w-2/3 h-4 rounded mb-2" />
                    <Skeleton className="w-1/2 h-4 rounded mb-2" />
                    {/* Button */}
                    <Skeleton className="w-1/3 h-10 rounded" />
                </div>
            ))}
        </div>
    );
}
