import React, { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import {
    X, RotateCcw, RotateCw, Play, Pause, Sun, Lock, Layers,
    MessageSquare, StepForward, Gauge, Maximize, Minimize,
    ThumbsDown, ThumbsUp, Flag
} from "lucide-react";

const VideoPlayer = ({ videoData, offlineVideo, startTime, onTimeUpdate }) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(startTime || 0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [brightness, setBrightness] = useState(1);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const videoRef = useRef(null);
    const currentTimeRef = useRef(startTime || 0);
    const controlsTimeout = useRef(null);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

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

            if (!videoData) return;

            if (videoData.trailerUrl) {
                if (Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });

                    hls.loadSource(videoData.trailerUrl);
                    if (videoRef.current) hls.attachMedia(videoRef.current);

                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        videoRef.current.muted = true;
                        videoRef.current.play().catch(err => {
                            console.log("Autoplay blocked:", err);
                        });
                    });
                } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
                    videoRef.current.src = videoData.trailerUrl;
                    videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
                }
            } else if (videoData.trailerUrl_mp4) {
                if (videoRef.current) {
                    videoRef.current.src = videoData.trailerUrl_mp4;
                    videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
                }
            }
        };

        setupPlayer();

        return () => {
            if (hls) hls.destroy();
        };
    }, [videoData, offlineVideo]);

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
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div
            id="video-container"
            className="relative w-full aspect-video md:h-[70vh] bg-black group overflow-hidden select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleMouseMove}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                onClick={togglePlay}
                onTimeUpdate={() => {
                    const time = videoRef.current?.currentTime || 0;
                    setCurrentTime(time);
                    currentTimeRef.current = time;
                    if (onTimeUpdate) onTimeUpdate(time, duration);
                }}
                onLoadedMetadata={() => {
                    const videoDuration = videoRef.current?.duration || 0;
                    setDuration(videoDuration);

                    const resumeTime = startTime !== null ? startTime : (videoData?.userWatchHistory?.watchDuration || 0);
                    if (resumeTime > 0 && videoRef.current) {
                        videoRef.current.currentTime = resumeTime;
                    }
                }}
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
                        <div className="size-12 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-base md:text-lg tracking-wide shadow-sm">
                                1. {videoData?.title || 'Name of Episode'}
                            </span>
                            <span className="text-xs text-gray-300 font-medium tracking-wide">
                                {Math.floor(videoData?.duration / 60)}h {Math.floor(videoData?.duration % 60)}min
                            </span>
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
                        <span className="min-w-[100px] text-right font-medium tracking-wider whitespace-nowrap">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

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
    );
};

export default VideoPlayer;
