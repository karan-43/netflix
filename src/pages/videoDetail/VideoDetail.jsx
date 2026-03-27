import { ArrowLeft, Play, SkipBack, SkipForward, Cast, Settings, Maximize, Plus, Download, Share2, Heart } from "lucide-react";
import { useParams } from "react-router-dom";
import { getVideoDetail } from "../../features/videoDetailSlice/videoDetailSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

export default function VideoDetail() {

    const { id } = useParams();

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getVideoDetail(id))
    }, [id])

    const { videoDetail } = useSelector((state) => state.videoDetail);
    const videoDetailData = videoDetail?.data;
    console.log(videoDetailData, "videoDetailData")





    return (
        <div className="min-h-screen bg-[#020b1c] text-white flex flex-col">
            <div className="view">
                <div className="flex flex-wrap justify-between w-full">
                    <div className="w-full">
                        <video
                            src="/your-video.mp4"
                            className="w-full h-full object-cover"
                            controls
                            autoPlay
                            muted
                        />
                    </div>

                    <div className="w-full md:pt-12">
                        <div className="w-full flex flex-col gap-y-8">
                            <div className="flex flex-col gap-y-2">
                                <h2 className="md:text-3xl text-xl font-semibold">Gullak 4</h2>
                                <p className="text-gray-400 text-sm">
                                    2024 | Hindi | Comedy
                                </p>
                            </div>
                            <div className="w-full flex gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                                        <Plus />
                                    </div>
                                    <span className="text-sm text-gray-400">Watchlist</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                                        <Download />
                                    </div>
                                    <span className="text-sm text-gray-400">Download</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                                        <Share2 />
                                    </div>
                                    <span className="text-sm text-gray-400">Share</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                                        <Heart />
                                    </div>
                                    <span className="text-sm text-gray-400">Rate</span>
                                </div>

                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Gullak 4 continues the heartwarming journey of the Mishra family, capturing everyday struggles, dreams, and joys of a middle-class household...
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
