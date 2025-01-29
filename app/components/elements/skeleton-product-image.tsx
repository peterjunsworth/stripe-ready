import { Skeleton } from "@nextui-org/react";

export function ProductImageSkeleton() {
    return (
        <div className="flex space-x-4">
            {/* Vertical column for thumbnails */}
            <div className="flex flex-col space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="w-[75px] h-[75px] rounded-md">
                        <Skeleton className="w-full h-full" />
                    </div>
                ))}
            </div>

            {/* Large product image */}
            <div className="w-[500px] h-[500px] rounded-md">
                <Skeleton className="w-full h-full" />
            </div>
        </div>
    );
}
