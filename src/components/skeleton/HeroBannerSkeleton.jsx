import React from 'react';

const HeroBannerSkeleton = () => {
    return (
        <div className="view">
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-900 border border-gray-800">
                <div className="w-full h-[420px] bg-gray-800/80 animate-pulse"></div>
                <div className="absolute top-3 right-3 bg-gray-700/80 w-20 h-6 animate-pulse rounded"></div>
                <div className="absolute bottom-8 left-8 right-8">
                    <div className="h-9 w-3/4 md:w-1/3 bg-gray-700/80 animate-pulse rounded mb-3"></div>
                    <div className="h-5 w-full md:w-1/2 bg-gray-700/80 animate-pulse rounded mt-2"></div>
                    <div className="flex items-center gap-3 mt-6">
                        <div className="w-32 h-10 bg-gray-700/80 animate-pulse rounded-lg"></div>
                        <div className="w-32 h-10 bg-gray-700/80 animate-pulse rounded-lg"></div>
                        <div className="ml-auto w-8 h-8 rounded-full bg-gray-700/80 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroBannerSkeleton;
