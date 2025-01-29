import { Skeleton } from "@nextui-org/react";

export function CartSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-top gap-4 p-4 bg-white shadow-md rounded-lg">
                    {/* Image Placeholder */}
                    <Skeleton className="w-20 h-20 rounded-lg" />

                    {/* Text Content */}
                    <div className="flex flex-col flex-grow gap-2">
                        <Skeleton className="w-3/5 h-6 rounded" />
                        <Skeleton className="w-2/5 h-4 rounded" />
                        <Skeleton className="w-1/5 h-4 rounded" />
                    </div>

                    {/* Button/Controls */}
                    <Skeleton className="w-10 h-10 rounded" />
                </div>
            ))}
        </div>
    );
}
