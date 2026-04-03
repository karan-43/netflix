import {
    Plus, Download, Share2, Heart,
    X, RotateCcw, RotateCw, Play, Pause, Sun, Lock, Layers, MessageSquare, StepForward, Gauge,
    ThumbsDown, ThumbsUp, Flag, Maximize, Minimize
} from "lucide-react";
import Hls from "hls.js";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import { getVideoDetail } from "../../features/videoDetailSlice/videoDetailSlice";
import { useEffect, useState } from "react";
import { openDB } from "idb";
import WatchList from "../../components/watchList/watchList";
import { watchListModalOpen } from "../../features/watchlistSlice/watchlistSlice";
import { useDispatch, useSelector } from "react-redux";

// -- IndexedDB: version 3 adds "keys" store for crypto key --
const getDB = () =>
    openDB("videoDB", 3, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("videos")) {
                db.createObjectStore("videos");
            }
            if (!db.objectStoreNames.contains("keys")) {
                db.createObjectStore("keys");
            }
        },
    });

// Get or lazily create a non-extractable AES-GCM key bound to this origin
const getEncryptionKey = async (db) => {
    let key = await db.get("keys", "videoKey");
    if (!key) {
        key = await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            false, // non-extractable — cannot be read outside the browser
            ["encrypt", "decrypt"]
        );
        await db.put("keys", key, "videoKey");
    }
    return key;
};

const encryptBlob = async (blob, key) => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const buffer = await blob.arrayBuffer();
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, buffer);
    return { iv, data: encrypted };
};

const decryptToBlob = async ({ iv, data }, key) => {
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new Blob([decrypted], { type: "video/mp4" });
};

export default function VideoDetail() {
    const [offlineVideo, setOfflineVideo] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0); const [showControls, setShowControls] = useState(true);
    const [brightness, setBrightness] = useState(1);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const controlsTimeout = useRef(null);

    const { id } = useParams();
    const videoRef = useRef(null);

    const dispatch = useDispatch();

    const { videoDetail } = useSelector((state) => state.videoDetail);
    const videoDetailData = videoDetail?.data;

    const { watchListModalState } = useSelector((state) => state.watchlist);

    const { user } = useSelector((state) => state.auth);
    const userId = user?.data?._id || user?.data?.userName;

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    useEffect(() => {
        dispatch(getVideoDetail(id));

        const loadOfflineVideo = async () => {
            try {
                const db = await getDB();

                let targetUserId = userId;
                if (!targetUserId) {
                    const allKeys = await db.getAllKeys("videos");
                    const foundKey = allKeys.find(key =>
                        typeof key === "string" &&
                        (key.endsWith(`_${id}_meta`) || key.endsWith(`_${id}`))
                    );
                    if (foundKey) {
                        targetUserId = foundKey.split("_")[0];
                    } else {
                        setOfflineVideo(null);
                        setIsDownloaded(false);
                        return;
                    }
                }

                // Old full-video fallback check
                const oldStored = await db.get("videos", `${targetUserId}_${id}`);
                if (oldStored) {
                    setIsDownloaded(true);
                    const key = await getEncryptionKey(db);
                    const videoBlob = await decryptToBlob(oldStored, key);
                    setOfflineVideo(URL.createObjectURL(videoBlob));
                    return;
                }

                // Chunk method check
                const meta = await db.get("videos", `${targetUserId}_${id}_meta`);
                if (meta && meta.downloaded > 0) {
                    if (meta.total && meta.downloaded >= meta.total) {
                        setIsDownloaded(true);
                        const key = await getEncryptionKey(db);
                        const chunks = [];
                        let offset = 0;
                        const chunkSize = 1024 * 1024 * 2;

                        while (offset < meta.total) {
                            const encrypted = await db.get("videos", `${targetUserId}_${id}_chunk_${offset}`);
                            if (!encrypted) break;
                            const decryptedBlob = await decryptToBlob(encrypted, key);
                            chunks.push(decryptedBlob);
                            offset += chunkSize;
                        }

                        if (chunks.length > 0) {
                            const finalBlob = new Blob(chunks, { type: "video/mp4" });
                            setOfflineVideo(URL.createObjectURL(finalBlob));
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load offline video:", err);
            }
        };

        loadOfflineVideo();
    }, [id, dispatch, userId]);

    useEffect(() => {
        let hls;

        const setupPlayer = () => {
            if (offlineVideo) {
                if (videoRef.current) {
                    videoRef.current.src = offlineVideo;
                    videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
                }
                return;
            }

            if (!videoDetailData) return;

            if (videoDetailData.trailerUrl) {
                if (Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });

                    hls.loadSource(videoDetailData.trailerUrl); // 🔥 .m3u8
                    if (videoRef.current) hls.attachMedia(videoRef.current);

                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        videoRef.current.muted = true;
                        videoRef.current.play().catch(err => {
                            console.log("Autoplay blocked:", err);
                        });
                    });
                } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
                    videoRef.current.src = videoDetailData.trailerUrl;
                    videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
                }
            } else if (videoDetailData.trailerUrl_mp4) {
                // Fallback to MP4 if HLS is not available
                if (videoRef.current) {
                    videoRef.current.src = videoDetailData.trailerUrl_mp4;
                    videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
                }
            }
        };

        setupPlayer();

        return () => {
            if (hls) hls.destroy();
        };
    }, [videoDetailData, offlineVideo]);


    const downloadVideo = async (url) => {
        if (!url || isDownloading || isDownloaded) return;
        if (!userId) {
            alert("Please login to download videos.");
            return;
        }

        try {
            setIsDownloading(true);

            const db = await getDB();
            const key = await getEncryptionKey(db);

            const chunkSize = 1024 * 1024 * 2; // 2MB
            let start = 0;

            // check previous progress
            const meta = (await db.get("videos", `${userId}_${id}_meta`)) || { downloaded: 0, total: 0 };
            start = meta.downloaded || 0;

            let totalSize = 0;
            try {
                const resHead = await fetch(url, { method: "HEAD" });
                const fetchSize = resHead.headers.get("content-length");
                totalSize = fetchSize ? parseInt(fetchSize, 10) : 0;
            } catch (err) {
                console.warn("HEAD request failed, falling back to full download", err);
                totalSize = 0;
            }

            if (totalSize > 0) {
                while (start < totalSize) {
                    const end = Math.min(start + chunkSize - 1, totalSize - 1);
                    const res = await fetch(url, {
                        headers: { Range: `bytes=${start}-${end}` },
                    });

                    if (!res.ok) throw new Error("Chunk failed to fetch");

                    const blob = await res.blob();

                    if (res.status !== 206) {
                        // Server does not support range requests
                        const encrypted = await encryptBlob(blob, key);
                        await db.put("videos", encrypted, `${userId}_${id}`);
                        await db.put("videos", { downloaded: blob.size, total: blob.size }, `${userId}_${id}_meta`);
                        break;
                    }

                    const encrypted = await encryptBlob(blob, key);

                    await db.put("videos", encrypted, `${userId}_${id}_chunk_${start}`);
                    start += chunkSize;

                    await db.put("videos", { downloaded: Math.min(start, totalSize), total: totalSize }, `${userId}_${id}_meta`);
                }
            } else {
                // Fallback for missing Content-Length (fetch whole video)
                const res = await fetch(url);
                if (!res.ok) throw new Error("Video failed to fetch");

                const blob = await res.blob();
                const encrypted = await encryptBlob(blob, key);

                await db.put("videos", encrypted, `${userId}_${id}`);
                await db.put("videos", { downloaded: blob.size, total: blob.size }, `${userId}_${id}_meta`);
            }

            setIsDownloaded(true);
            alert("Download completed ✅");
            window.location.reload(); // optionally reload to assemble chunks immediately

        } catch (err) {
            console.error("Download failed:", err);
            alert("Download failed. The server may not allow cross-origin requests or range headers.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        controlsTimeout.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    const handleMouseLeave = () => {
        if (isPlaying) setShowControls(false);
    };

    const toggleFullScreen = () => {
        const videoContainer = document.getElementById("video-container");
        if (!videoContainer) return;

        if (!document.fullscreenElement) {
            videoContainer.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.log(err);
            });
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const handleTimelineClick = (e) => {
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        videoRef.current.currentTime = percent * duration;
    };

    const formatTime = (timeInSeconds) => {
        if (!timeInSeconds || isNaN(timeInSeconds)) return "00:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <>
            <div className="min-h-screen bg-[#020b1c] text-white flex flex-col">
                <div className="view">
                    <div className="flex flex-wrap justify-between w-full">
                        <div
                            id="video-container"
                            className="relative w-full aspect-video md:h-[70vh] bg-black group overflow-hidden select-none"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            onClick={handleMouseMove}
                        >
                            {/* VIDEO */}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                onClick={togglePlay}
                                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                className="w-full h-full object-contain"
                                style={{ filter: `brightness(${brightness})` }}
                                disablePictureInPicture
                                onContextMenu={(e) => e.preventDefault()}
                            />

                            {/* OVERLAY CONTROLS */}
                            <div
                                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 flex flex-col justify-between p-4 md:p-8 ${showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                            >
                                {/* TOP BAR */}
                                <div className="flex justify-between items-start text-white w-full z-10 pt-2 lg:px-4">
                                    <div className="flex gap-3 md:gap-4 items-center">
                                        <div className="size-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"><span className="text-white font-bold text-lg">S</span></div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-base md:text-lg tracking-wide shadow-sm">
                                                1. {videoDetailData?.title || 'Name of Episode'}
                                            </span>
                                            <span className="text-xs text-gray-300 font-medium tracking-wide">1h 21m</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className="hidden sm:flex gap-4 bg-[#2b2b2b]/60 px-4 py-2 rounded-full backdrop-blur-md">
                                            <button className="hover:text-gray-300 transition cursor-pointer"><ThumbsDown size={22} /></button>
                                            <button className="hover:text-gray-300 transition cursor-pointer"><ThumbsUp size={22} /></button>

                                        </div>
                                        <button className="hover:text-gray-300 transition cursor-pointer drop-shadow-md"><Flag size={26} /></button>
                                        <button
                                            className="hover:text-gray-300 transition cursor-pointer drop-shadow-md"
                                            onClick={() => {
                                                if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
                                                window.history.back();
                                            }}
                                        >
                                            <X size={32} />
                                        </button>
                                    </div>
                                </div>

                                {/* MIDDLE CONTROLS */}
                                <div className="flex justify-center items-center gap-20 md:gap-40 relative flex-1">
                                    {/* BRIGHTNESS SLIDER */}
                                    <div className="absolute left-2 sm:left-6 hidden md:flex flex-col items-center gap-4 h-40">
                                        <Sun size={26} className="text-white z-10 drop-shadow-md" />
                                        <div className="h-full relative flex justify-center w-6">
                                            <input
                                                type="range" min="0.2" max="2" step="0.1" value={brightness}
                                                onChange={(e) => setBrightness(e.target.value)}
                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1.5 bg-white/30 appearance-none cursor-pointer outline-none -rotate-90 z-10 overflow-hidden rounded-full"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); if (videoRef.current) videoRef.current.currentTime -= 10; }}
                                        className="text-white hover:text-gray-300 transition flex flex-col items-center z-10 cursor-pointer drop-shadow-lg"
                                    >
                                        <div className="relative flex items-center justify-center">
                                            <RotateCcw size={52} className="font-light" strokeWidth={1.5} />
                                            <span className="absolute text-[12px] font-bold mt-1">10</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                        className="text-white hover:scale-110 transition z-10 cursor-pointer drop-shadow-lg"
                                    >
                                        {isPlaying ?
                                            <Pause size={72} fill="white" strokeWidth={0} /> :
                                            <Play size={72} fill="white" strokeWidth={0} />
                                        }
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); if (videoRef.current) videoRef.current.currentTime += 10; }}
                                        className="text-white hover:text-gray-300 transition flex flex-col items-center z-10 cursor-pointer drop-shadow-lg"
                                    >
                                        <div className="relative flex items-center justify-center">
                                            <RotateCw size={52} className="font-light" strokeWidth={1.5} />
                                            <span className="absolute text-[12px] font-bold mt-1">10</span>
                                        </div>
                                    </button>
                                </div>

                                {/* BOTTOM BAR */}
                                <div className="flex flex-col gap-6 w-full pb-2">
                                    {/* TIMELINE */}
                                    <div className="flex items-center gap-4 text-white text-sm font-medium w-full z-10 px-2 lg:px-8">
                                        <div
                                            className="flex-1 h-1 md:h-1.5 bg-gray-500/50 cursor-pointer relative group/timeline flex items-center rounded-full"
                                            onClick={handleTimelineClick}
                                        >
                                            <div
                                                className="absolute left-0 h-full bg-[#E50914] rounded-full delay-75"
                                                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                                            >
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 bg-[#E50914] rounded-full translate-x-1/2 shadow-[0_0_10px_rgba(229,9,20,0.8)]"></div>
                                            </div>
                                        </div>
                                        <span className="w-16 text-right font-medium tracking-wider">{formatTime(duration - currentTime)}</span>
                                    </div>

                                    {/* BOTTOM BUTTONS */}
                                    <div className="flex justify-between items-center text-white text-sm w-full overflow-x-auto gap-6 scrollbar-hide z-10 px-2 lg:px-8">
                                        <div className="flex gap-6 md:gap-8 min-w-max">
                                            <button className="flex items-center gap-2 hover:text-gray-300 transition cursor-pointer font-medium tracking-wide text-gray-200">
                                                <Gauge size={22} className="opacity-90" />
                                                <span className="hidden sm:inline">Speed (1x)</span>
                                                <span className="sm:hidden">1x</span>
                                            </button>
                                            <button className="flex items-center gap-2 hover:text-gray-300 transition cursor-pointer font-medium tracking-wide text-gray-200">
                                                <Lock size={22} className="opacity-90" />
                                                <span className="hidden sm:inline">Lock</span>
                                            </button>
                                        </div>
                                        <div className="flex gap-6 md:gap-8 min-w-max items-center">
                                            <button className="flex items-center gap-2 hover:text-gray-300 transition cursor-pointer font-medium tracking-wide text-gray-200">
                                                <Layers size={22} className="opacity-90" />
                                                <span className="hidden sm:inline">Episodes</span>
                                            </button>
                                            <button className="flex items-center gap-2 hover:text-gray-300 transition cursor-pointer font-medium tracking-wide text-gray-200">
                                                <MessageSquare size={22} className="opacity-90" />
                                                <span className="hidden sm:inline">Audio & Subtitles</span>
                                            </button>
                                            <button className="flex items-center gap-2 hover:text-gray-300 transition cursor-pointer font-medium tracking-wide text-gray-200">
                                                <StepForward size={22} className="opacity-90" />
                                                <span className="hidden sm:inline">Next Ep.</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }}
                                                className="flex items-center gap-2 hover:text-gray-300 transition cursor-pointer font-medium tracking-wide ml-2 md:ml-4 text-white"
                                                title="Fullscreen"
                                            >
                                                {isFullScreen ? <Minimize size={26} className="opacity-100" /> : <Maximize size={26} className="opacity-100" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:pt-12">
                            <div className="w-full flex flex-col gap-y-8">
                                <div className="flex flex-col gap-y-2">
                                    <h2 className="md:text-3xl text-xl font-semibold">{videoDetailData?.title}</h2>
                                    <p className="text-gray-400 text-sm">
                                        {new Date(videoDetailData?.releaseDate).getFullYear()} | {videoDetailData?.language} | {videoDetailData?.category?.name}
                                    </p>
                                </div>
                                <div className="w-full flex gap-6">
                                    <button onClick={() => dispatch(watchListModalOpen(true))} type="button" className="cursor-pointer flex flex-col items-center gap-2">
                                        <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                                            <Plus />
                                        </div>
                                        <span className="text-sm text-gray-400">Watchlist</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            downloadVideo(
                                                videoDetailData?.trailerUrl_mp4
                                            )
                                        }
                                        disabled={isDownloading || isDownloaded}
                                        className="cursor-pointer flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                                            <Download className={isDownloading ? "animate-bounce" : ""} />
                                        </div>
                                        <span className="text-sm text-gray-400">
                                            {isDownloading ? "Saving..." : isDownloaded ? "Saved ✅" : "Download"}
                                        </span>
                                    </button>
                                    <button type="button" className="cursor-pointer flex flex-col items-center gap-2">
                                        <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                                            <Share2 />
                                        </div>
                                        <span className="text-sm text-gray-400">Share</span>
                                    </button>
                                    <button type="button" className="cursor-pointer flex flex-col items-center gap-2">
                                        <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                                            <Heart />
                                        </div>
                                        <span className="text-sm text-gray-400">Rate</span>
                                    </button>

                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {videoDetailData?.description}
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {
                watchListModalState && (
                    <WatchList videoId={videoDetailData?._id} />
                )
            }
        </>
    );
}
