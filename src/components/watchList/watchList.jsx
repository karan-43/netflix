import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getWatchList, addWatchListUser, addVideoWatchList, watchListModalOpen, deleteWatchList } from '../../features/watchlistSlice/watchlistSlice';
import { useNavigate } from 'react-router-dom';


const WatchList = ({ videoId }) => {
    const navigate = useNavigate()
    const [addWatch, setAddWatch] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: ""
    })



    const handleChange = (e) => {
        let { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const { watchlist, watchListModalState, addWatchList, addWatchListUserData } = useSelector((state) => state.watchlist);

    const addWatchListId = addWatchList?.data?._id

    const dispatch = useDispatch();

    useEffect(() => {
        if (watchListModalState) {
            dispatch(getWatchList());
        }
    }, [watchListModalState, dispatch]);

    const handleAddWatchList = async () => {
        try {
            const res = await dispatch(addWatchListUser(formData)).unwrap();
            if (res) {
                dispatch(getWatchList());
            }
            setAddWatch(false);
            setFormData({
                name: "",
                description: ""
            });

        } catch (err) {
            console.error("Add failed:", err);
            alert(err?.message)
        }
    };

    const handleAddVideo = async (watchlistId) => {
        navigate(`/watchlist-videos/${watchlistId}`)
        try {
            const data = { watchlistId, videoId }
            const res = await dispatch(addVideoWatchList(data)).unwrap();

            if (res) {
                dispatch(getWatchList({ addWatchListId: addWatchListId }));
            }
            dispatch(watchListModalOpen(false));
        }
        catch (err) {
            alert(err?.message)
        }
    }


    const handleDelete = async (id) => {
        try {
            const res = await dispatch(deleteWatchList(id)).unwrap();
            if (res) {
                dispatch(getWatchList());
                console.log(res, "delete RES")
            }
        }
        catch {

        }
    }


    return (
        <>
            <div
                onClick={() => dispatch(watchListModalOpen(false))}
                className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 ${watchListModalState ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
            />

            <div
                className={`fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-lg z-50 transform transition-transform duration-300
        ${watchListModalState ? "translate-y-0" : "translate-y-full"}`}
            >
                <div className="flex justify-center py-2">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>
                <div className="w-full relative view">
                    <button
                        onClick={() => dispatch(watchListModalOpen(false))}
                        className="absolute top-2 right-4 bg-gray-200 hover:bg-gray-300 text-gray-800 transition py-2 px-2 rounded-full z-10"
                    >
                        <X className='size-5' />
                    </button>

                    <div className="py-4">
                        <button onClick={() => setAddWatch(true)} className='cursor-pointer bg-[#E50914] hover:bg-red-700 transition text-white px-5 py-2.5 rounded-full font-semibold shadow-md'>+ Add Watchlist</button>
                    </div>

                    <div className="flex flex-col gap-y-4 w-full max-h-[50vh] min-h-[300px] overflow-y-auto p-2 mt-2 pb-10">
                        {
                            watchlist?.data?.length > 0 ? watchlist?.data?.map((item, idx) => (
                                <div key={idx} className='bg-white flex justify-between items-center gap-3 shadow-md border border-gray-100 py-3 px-4 rounded-xl text-black'>
                                    <div className="flex-1">
                                        <h5 className='font-bold text-xl text-gray-900 leading-tight'>{item?.name || item?.title}</h5>
                                        <p className='font-medium text-sm text-gray-500 mt-1 line-clamp-2'>{item?.description}</p>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <span className="size-6 flex justify-center items-center text-white bg-gray-400 rounded-full">
                                            {item?.videos?.length}
                                        </span>
                                        <button onClick={() => handleAddVideo(item?._id)} type='button' className='cursor-pointer bg-[#E50914] hover:bg-red-700 shadow-sm py-2 px-4 text-sm font-semibold text-white flex justify-center items-center rounded-full transition shrink-0'>
                                            Add Video
                                        </button>
                                        <button onClick={() => handleDelete(item?._id)} type='button' className='cursor-pointer bg-[#E50914] hover:bg-red-700 shadow-sm py-2 px-4 text-sm font-semibold text-white flex justify-center items-center rounded-full transition shrink-0'>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )) : <p className='text-2xl font-bold text-center text-gray-500 mt-10 flex justify-center items-center'>{watchlist?.loading ? <svg className="mr-3 -ml-1 size-12 animate-spin text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'No watchlist found'}</p>
                        }
                    </div>

                    {
                        addWatch && <div className='w-full bg-white z-20 flex flex-col gap-y-4 justify-start p-6 absolute inset-0 rounded-t-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] text-black'>
                            <div className="flex justify-between w-full items-center mb-2">
                                <h3 className="text-2xl font-bold text-gray-900">Create Watchlist</h3>
                                <button onClick={() => setAddWatch(false)} className='cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full p-2 transition'>
                                    <X className='size-5' />
                                </button>
                            </div>
                            <input type="text" name='name' className='w-full border-2 focus:border-red-500 h-12 border-gray-300 p-3 rounded-xl outline-none font-medium text-lg focus:ring-0 transition' value={formData.name} onChange={handleChange} placeholder='Playlist Name' />
                            <textarea name='description' className='w-full border-2 focus:border-red-500 min-h-[100px] border-gray-300 p-3 rounded-xl outline-none font-medium resize-none focus:ring-0 transition' value={formData.description} onChange={handleChange} placeholder='Description (optional)' />
                            <button onClick={handleAddWatchList} className='cursor-pointer w-full bg-[#E50914] hover:bg-red-700 transition text-white p-3.5 rounded-xl font-bold text-xl mt-2 shadow-lg'> {addWatchListUserData.loading ? <svg className="mr-3 -ml-1 size-12 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Save Watchlist'}</button>
                        </div>
                    }
                </div>
            </div >
        </>
    )
}

export default WatchList