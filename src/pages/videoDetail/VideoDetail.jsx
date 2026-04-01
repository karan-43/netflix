import { ArrowLeft, Play, SkipBack, SkipForward, Cast, Settings, Maximize, Plus, Download, Share2, Heart } from "lucide-react";
import { useParams } from "react-router-dom";
import { getVideoDetail } from "../../features/videoDetailSlice/videoDetailSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { openDB } from "idb";

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

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getVideoDetail(id))
        const loadOfflineVideo = async () => {
            try {
                const db = await getDB();
                const stored = await db.get("videos", id);

                if (stored) {
                    const key = await getEncryptionKey(db);
                    const videoBlob = await decryptToBlob(stored, key);
                    const localUrl = URL.createObjectURL(videoBlob);
                    setOfflineVideo(localUrl);
                }
            } catch (err) {
                console.error("Failed to load offline video:", err);
            }
        };

        loadOfflineVideo();
    }, [id])

    const { videoDetail } = useSelector((state) => state.videoDetail);
    const videoDetailData = videoDetail?.data;



    const downloadVideo = async (url) => {
        if (!url || isDownloading || isDownloaded) return;

        try {
            setIsDownloading(true);

            // Fetch the video — mode:cors requires server to allow it
            const res = await fetch(url, { mode: "cors" });
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
            const blob = await res.blob();

            const db = await getDB();
            const key = await getEncryptionKey(db);
            const encrypted = await encryptBlob(blob, key);
            // Only store { iv, data } — never the raw blob
            await db.put("videos", encrypted, id);

            setIsDownloaded(true);
            alert("Video encrypted & saved for offline viewing ✅");
        } catch (err) {
            console.error("Download failed:", err);
            alert("Download failed. The video server may not allow cross-origin access.");
        } finally {
            setIsDownloading(false);
        }
    };
    return (
        <div className="min-h-screen bg-[#020b1c] text-white flex flex-col">
            <div className="view">
                <div className="flex flex-wrap justify-between w-full">
                    <div className="w-full">
                        {/* controlsList blocks the browser's built-in download button */}
                        <video
                            src={offlineVideo || videoDetailData?.videoUrl}
                            className="w-full h-full object-cover"
                            controls
                            autoPlay
                            muted
                            controlsList="nodownload noremoteplayback"
                            disablePictureInPicture
                            onContextMenu={(e) => e.preventDefault()}
                        />
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
                                <button type="button" className="cursor-pointer flex flex-col items-center gap-2">
                                    <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                                        <Plus />
                                    </div>
                                    <span className="text-sm text-gray-400">Watchlist</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => downloadVideo(videoDetailData?.videoUrl_mp4)}
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
    );
}
