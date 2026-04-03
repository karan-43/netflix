
import { Swiper, SwiperSlide } from 'swiper/react'

const VideoCardSkeleton = () => {
    return (
        <div className="w-full overflow-hidden flex flex-col gap-y-6 pb-6">
            <div className="h-8 w-48 bg-gray-800/80 animate-pulse rounded-md"></div>
            <Swiper
                className="w-full"
                spaceBetween={16}
                slidesPerView={1}
                breakpoints={{
                    320: { slidesPerView: 1.5 },
                    640: { slidesPerView: 3 },
                    1024: { slidesPerView: 5 },
                }}
            >
                {[...Array(6)].map((_, idx) => (
                    <SwiperSlide key={idx}>
                        <div className="w-full h-72 bg-gray-800/80 animate-pulse rounded-lg"></div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}

export default VideoCardSkeleton