import { Play, Plus, Heart } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HeroBanner = ({ bannerData }) => {
    return (
        <div className="view">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <Swiper
                modules={[Pagination,]}
                spaceBetween={50}
                slidesPerView={1}
                pagination={{ clickable: true }}
            >
                {
                    bannerData?.map((item, idx) => (
                        <SwiperSlide key={idx}>
                            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white">
                                <img
                                    src={item?.image}
                                    alt="spiderman"
                                    className="w-full h-[420px] object-cover"
                                />
                                <div className="absolute top-3 right-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                                    IMDb 8/10
                                </div>
                                <div className="absolute bottom-8 left-8 right-8 text-white">
                                    <h2 className="text-3xl font-semibold">
                                        {item?.title}
                                    </h2>
                                    <p className="md:text-base text-sm text-gray-300 mt-1">
                                        {item?.description || "hi i am netflix if yu want to watch movie click here"}
                                    </p>
                                    <div className="flex items-center gap-3 mt-4">
                                        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium">
                                            <Play size={16} />
                                            Watch Now
                                        </button>

                                        <button className="flex items-center gap-2 border border-gray-400 px-4 py-2 rounded-lg text-gray-200 hover:bg-white/10">
                                            <Plus size={16} />
                                            Watchlist
                                        </button>
                                        <button className="ml-auto">
                                            <Heart className="text-gray-300" />
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))
                }
            </Swiper>
        </div>

    )
}

export default HeroBanner