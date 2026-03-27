import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


const ContinueWatching = ({ continueWatchingData }) => {
    return (
        <Swiper
            modules={[Pagination,]}
            spaceBetween={50}
            slidesPerView={6}
            pagination={{ clickable: true }}
        >
            {
                continueWatchingData?.length > 0 &&
                continueWatchingData?.map((item, idx) => (
                    <SwiperSlide key={idx}>
                        <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white">
                            <video
                                src={item?.video}
                                className="w-full h-[420px] object-cover"
                            />

                        </div>
                    </SwiperSlide>
                ))

            }
        </Swiper>
    )
}

export default ContinueWatching