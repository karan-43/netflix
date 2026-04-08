import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'swiper/css';

const ContinueWatching = ({ continueWatchingData }) => {
    // If no data, don't show anything
    if (!continueWatchingData || continueWatchingData.length === 0) {
        return null;
    }

    return (
        <div className="w-full flex flex-col gap-6">
            <h2 className="text-white font-bold text-3xl px-1">Continue Watching</h2>

            <Swiper
                spaceBetween={20}
                slidesPerView={1.5}
                breakpoints={{
                    640: { slidesPerView: 2.5 },
                    768: { slidesPerView: 3.5 },
                    1024: { slidesPerView: 4.5 },
                    1280: { slidesPerView: 5.5 }
                }}
                className="w-full"
            >
                {continueWatchingData.map((item, idx) => {
                    // Normalize data structure (sometimes it's nested under videoId)
                    const video = item?.videoId || item;
                    const progress = item?.watchProgress || 0;
                    const watchDuration = item?.watchDuration || 0;

                    return (
                        <SwiperSlide key={idx} className="pb-4">
                            <div className="group relative bg-[#141414] rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:z-50 border border-transparent hover:border-gray-700">
                                {/* Thumbnail Image */}
                                <div className="relative aspect-video">
                                    <img
                                        src={video?.thumbnail || "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=800"}
                                        alt={video?.title}
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    />

                                    {/* Progress Bar Overlay (At the bottom of thumbnail) */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-900/60 z-10">
                                        <div
                                            className="h-full bg-[#E50914] transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(229,9,20,0.6)]"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    {/* Play Overlay */}
                                    <Link
                                        to={`/video/${video?._id}?t=${watchDuration}`}
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                                            <Play className="w-6 h-6 fill-current ml-1" />
                                        </div>
                                    </Link>
                                </div>

                                {/* Info Section */}
                                <div className="p-4 bg-linear-to-b from-[#141414] to-[#0a0a0a]">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <h3 className="text-white font-semibold text-sm line-clamp-1 flex-1">
                                            {video?.title || "Unknown Title"}
                                        </h3>
                                        <button className="text-gray-400 hover:text-white transition group-hover:scale-110">
                                            <Info size={16} />
                                        </button>
                                    </div>

                                    <div className="text-[11px] text-gray-400 font-medium tracking-tight flex justify-between items-center">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[#E50914] font-bold">
                                                {progress >= 95 ? "Watched" : `${watchDuration}sec`}
                                            </span>
                                            {progress < 95 && <span className="text-gray-600">|</span>}
                                            {progress < 95 && <span>{video?.watchDuration || 0}m total</span>}
                                        </div>
                                        <span className="bg-gray-800 text-[9px] px-1.5 py-0.5 rounded text-gray-300 border border-gray-700 uppercase">
                                            HD
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default ContinueWatching;