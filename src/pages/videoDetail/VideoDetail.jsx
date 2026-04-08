import {
    Plus, Download, Share2, Heart
} from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { getVideoDetail } from "../../features/videoDetailSlice/videoDetailSlice";
import { useEffect, useState, useRef } from "react";
import { openDB } from "idb";
import WatchList from "../../components/watchList/watchList";
import { watchListModalOpen } from "../../features/watchlistSlice/watchlistSlice";
import { useDispatch, useSelector } from "react-redux";
import { addVideoToContinueWatching } from "../../features/continueWatchingSlice/continueWatchingSlice";
import VideoPlayer from "../../components/videoPlayer/VideoPlayer";

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
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const startTimeParam = searchParams.get('t');
    const startTime = startTimeParam && !isNaN(parseFloat(startTimeParam)) ? parseFloat(startTimeParam) : null;

    // We only need to track the latest time for unmount progress saving
    const lastTimeRef = useRef(startTime || 0);
    const videoDurationRef = useRef(0);

    const dispatch = useDispatch();

    const { videoDetail } = useSelector((state) => state.videoDetail);
    const videoDetailData = videoDetail?.data;

    const { watchListModalState, watchlist } = useSelector((state) => state.watchlist);

    const { user, token } = useSelector((state) => state.auth);
    const userId = user?.data?._id || user?.data?.userName;

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
            const meta = (await db.get("videos", `${userId}_${id}_meta`)) || {
                downloaded: 0,
                total: 0,
                title: videoDetailData?.title,
                thumbnail: videoDetailData?.thumbnail,
                description: videoDetailData?.description,
                videoId: id
            };
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

            const updatedMeta = {
                ...meta,
                total: totalSize || meta.total
            };

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
                        await db.put("videos", { ...updatedMeta, downloaded: blob.size, total: blob.size }, `${userId}_${id}_meta`);
                        break;
                    }

                    const encrypted = await encryptBlob(blob, key);

                    await db.put("videos", encrypted, `${userId}_${id}_chunk_${start}`);
                    start += chunkSize;

                    await db.put("videos", { ...updatedMeta, downloaded: Math.min(start, totalSize) }, `${userId}_${id}_meta`);
                }
            } else {
                // Fallback for missing Content-Length (fetch whole video)
                const res = await fetch(url);
                if (!res.ok) throw new Error("Video failed to fetch");

                const blob = await res.blob();
                const encrypted = await encryptBlob(blob, key);

                await db.put("videos", encrypted, `${userId}_${id}`);
                await db.put("videos", { ...updatedMeta, downloaded: blob.size, total: blob.size }, `${userId}_${id}_meta`);
            }

            setIsDownloaded(true);
            alert("Download completed \u2705");
            window.location.reload();

        } catch (err) {
            console.error("Download failed:", err);
            alert("Download failed. The server may not allow cross-origin requests or range headers.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleContinueWatching = (time, duration) => {
        if (!token || !id || isNaN(time) || isNaN(duration) || duration <= 0) return;

        const progressPercent = Math.round((time / duration) * 100);

        dispatch(addVideoToContinueWatching({
            videoId: id,
            watchDuration: Math.floor(time),
            progress: progressPercent
        }));
    };

    // Callback from VideoPlayer to sync time updates
    const onTimeUpdate = (time, duration) => {
        lastTimeRef.current = time;
        videoDurationRef.current = duration;
    };

    // Debounce continue watching updates (every 10 seconds)
    useEffect(() => {
        if (!token) return;

        const interval = setInterval(() => {
            handleContinueWatching(lastTimeRef.current, videoDurationRef.current);
        }, 10000); // 10 seconds

        return () => {
            clearInterval(interval);
            // Save final position on unmount
            if (lastTimeRef.current > 0) {
                handleContinueWatching(lastTimeRef.current, videoDurationRef.current);
            }
        };
    }, [id, token]);

    return (
        <>
            <div className="min-h-screen bg-[#020b1c] text-white flex flex-col">
                <div className="view">
                    <div className="flex flex-wrap justify-between w-full">

                        {/* Replaced legacy video element with modular VideoPlayer component */}
                        <VideoPlayer
                            videoData={videoDetailData}
                            offlineVideo={offlineVideo}
                            startTime={startTime}
                            onTimeUpdate={onTimeUpdate}
                        />

                        <div className="w-full md:pt-12">
                            <div className="w-full flex flex-col gap-y-8">
                                <div className="flex flex-col gap-y-2">
                                    <h2 className="md:text-3xl text-xl font-semibold">{videoDetailData?.title}</h2>
                                    <p className="text-gray-400 text-sm">
                                        {videoDetailData?.releaseDate ? new Date(videoDetailData.releaseDate).toLocaleDateString() : ""} | {videoDetailData?.language} | {videoDetailData?.category?.name}
                                    </p>
                                </div>
                                <div className="w-full flex gap-6">
                                    <button onClick={() => dispatch(watchListModalOpen(true))} type="button" className="cursor-pointer flex flex-col items-center gap-2">
                                        <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                                            <Plus />
                                        </div>
                                        <span className="text-sm text-gray-400">{watchlist?.loading ? "Loading..." : "Watchlist"}</span>
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
                                            {isDownloading ? "Saving..." : isDownloaded ? "Saved \u2705" : "Download"}
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
