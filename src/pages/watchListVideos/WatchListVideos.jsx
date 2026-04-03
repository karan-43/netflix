import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getWatchList, removeVideoWatchList } from '../../features/watchlistSlice/watchlistSlice';
import { ArrowLeft, X } from 'lucide-react';

const WatchListVideos = () => {
    const { id } = useParams();
    const { watchlist } = useSelector((state) => state.watchlist);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!watchlist?.data || watchlist?.data?.length === 0) {
            dispatch(getWatchList());
        }
    }, [dispatch, watchlist?.data]);

    const currentWatchlist = watchlist?.data?.find(item => item._id === id);

    const handleRemove = (videoId) => {
        dispatch(removeVideoWatchList({ videoId, watchlistId: id }));
    }

    if (watchlist?.loading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-screen bg-[#020b1c]">
                <svg className="animate-spin size-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    if (!currentWatchlist) {
        return <div className="p-8 min-h-screen bg-[#020b1c] text-white text-center py-20 text-xl font-semibold">Watchlist Folder not found.</div>;
    }

    const videos = currentWatchlist?.videos || [];

    return (
        <div className="p-8 min-h-screen bg-[#020b1c] text-white">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
                <ArrowLeft size={20} /> Back to Home
            </Link>

            <h1 className="text-4xl font-bold mb-2">{currentWatchlist?.name || currentWatchlist?.title || 'Watchlist'}</h1>
            <p className="text-gray-400 mb-6">{currentWatchlist?.description}</p>


            {videos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {videos.map((videoEntry, idx) => {
                        const video = videoEntry?.videoId || videoEntry;
                        return (
                            <Link to={`/video/${video?._id}`} key={idx} className="w-full relative shrink-0 cursor-pointer group rounded-lg overflow-hidden relative shadow-lg bg-gray-900 border border-gray-800 flex flex-col hover:border-gray-600 transition">
                                <img
                                    className='w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105'
                                    src={video?.thumbnail || "https://via.placeholder.com/300x169?text=No+Thumbnail"}
                                    alt={video?.title || "Video"}
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-3 pt-10 text-sm font-semibold truncate leading-tight text-white pointer-events-none z-10">
                                    {video?.title || 'Unknown Video'}
                                </div>
                                <button type='button' onClick={() => handleRemove(video?._id)} className="cursor-pointer bg-black/50 hover:bg-black/70 rounded-full p-1 absolute top-2 right-2 z-20">
                                    <X size={20} className='text-white' />
                                </button>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-20 text-lg border-2 border-dashed border-gray-800 rounded-2xl mx-auto max-w-2xl bg-gray-900/30">
                    <p className="mb-2 text-xl font-semibold">Folder is empty</p>
                    <p>No videos saved in this folder yet.</p>
                </div>
            )}
        </div>
    )
}

export default WatchListVideos;