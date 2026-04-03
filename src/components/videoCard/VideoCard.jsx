import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import VideoCardSkeleton from "../skeleton/VideoCardSkeleton";
import { useSelector } from "react-redux";

const VideoCard = ({ items }) => {

    const { homeVideos } = useSelector((state) => state.home)

    if (homeVideos?.loading) return <VideoCardSkeleton />

    console.log(homeVideos?.loading, "homeVideos?.loading")

    return (
        <>
            <div className="w-full overflow-hidden flex flex-col gap-y-6">
                <h2 className="text-white font-bold text-3xl">
                    {items?.title}
                </h2>
                <Swiper
                    modules={[Pagination]}
                    className="w-full"
                    spaceBetween={16}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    breakpoints={{
                        320: { slidesPerView: 1.5 },
                        640: { slidesPerView: 3 },
                        1024: { slidesPerView: 5 },
                    }}
                >
                    {items?.videos?.map((item, idx) => (
                        <SwiperSlide key={idx}>
                            <div className="cursor-pointer w-full relative h-72 before:absolute before:inset-0 before:bg-[#0000003c]">
                                <img
                                    src={item?.thumbnail}
                                    className="size-full object-cover rounded-lg"

                                />
                                {items?.type === "Streamify Originals" && (
                                    <div className="flex flex-col gap-y-2 absolute bottom-4 left-4">
                                        <h2 className="text-white font-bold text-3xl">
                                            {item?.title}
                                        </h2>
                                        <p className="text-white text-xl font-semibold">
                                            {`${Math.floor(item?.duration / 60)} hr ${Math.floor(item?.duration % 60)} min`}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <Link to={`/video/${item?._id}`} className="absolute inset-0 size-full"></Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            {/* <VideoCardSkeleton /> */}
        </>

    );
};

export default VideoCard;