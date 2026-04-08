import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { openDB } from "idb";
import { Play, Trash2, Download, Clock } from "lucide-react";
import { Link } from "react-router-dom";

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

const Downloads = () => {
    const { user } = useSelector((state) => state.auth);
    const userId = user?.data?._id || user?.data?.userName;
    const [downloadedVideos, setDownloadedVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDownloads = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const db = await getDB();
                const allKeys = await db.getAllKeys("videos");
                const userMetaKeys = allKeys.filter(key =>
                    typeof key === "string" &&
                    key.startsWith(`${userId}_`) &&
                    key.endsWith("_meta")
                );

                const downloads = [];
                for (const key of userMetaKeys) {
                    const meta = await db.get("videos", key);
                    if (meta) {
                        downloads.push(meta);
                    }
                }
                setDownloadedVideos(downloads);
            } catch (err) {
                console.error("Failed to fetch downloads:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDownloads();
    }, [userId]);

    const removeDownload = async (videoId) => {
        if (!window.confirm("Are you sure you want to remove this download?")) return;

        try {
            const db = await getDB();
            const allKeys = await db.getAllKeys("videos");

            // Find all keys related to this video (meta, chunks, or full video)
            const keysToRemove = allKeys.filter(key =>
                typeof key === "string" &&
                key.startsWith(`${userId}_${videoId}`)
            );

            const tx = db.transaction("videos", "readwrite");
            for (const key of keysToRemove) {
                await tx.store.delete(key);
            }
            await tx.done;

            setDownloadedVideos(prev => prev.filter(v => v.videoId !== videoId));
        } catch (err) {
            console.error("Failed to remove download:", err);
            alert("Failed to remove download.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="text-center py-12 text-gray-400">
                <Download className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Please login to view your downloads.</p>
            </div>
        );
    }

    if (downloadedVideos.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
                <Download className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No downloads yet</p>
                <p className="text-sm">Videos you download for offline viewing will appear here.</p>
                <Link to="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition font-medium">
                    Browse Videos
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {downloadedVideos.map((video, idx) => {
                const progress = video.total ? Math.round((video.downloaded / video.total) * 100) : 0;
                const isComplete = progress >= 100;

                return (
                    <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#0a162d]/40 border border-gray-800 rounded-2xl hover:bg-[#0a162d]/60 hover:border-gray-700 transition group"
                    >
                        <div className="relative w-full sm:w-40 aspect-video rounded-xl overflow-hidden shrink-0">
                            <img
                                src={video.thumbnail || "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=640"}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {isComplete && (
                                <Link
                                    to={`/video/${video.videoId}`}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
                                        <Play className="w-5 h-5 fill-current" />
                                    </div>
                                </Link>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="font-semibold text-lg truncate">{video.title || "Unknown Title"}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1 mb-2">{video.description}</p>
                                </div>
                                <button
                                    onClick={() => removeDownload(video.videoId)}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                    title="Remove Download"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mt-2 text-xs flex items-center justify-between gap-4">
                                <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${isComplete ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <span className={isComplete ? 'text-green-500' : 'text-blue-400'}>
                                    {isComplete ? 'Downloaded' : `${progress}%`}
                                </span>
                            </div>

                            <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-600 uppercase tracking-wider font-bold">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {video.total ? (video.total / (1024 * 1024)).toFixed(1) : "?"} MB
                                </span>
                                <span>•</span>
                                <span>Offline Protected</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Downloads;