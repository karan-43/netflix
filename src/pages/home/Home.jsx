import React, { useEffect } from 'react'
import CategoryTabs from '../../components/categoryTabs/CategoryTabs'
import { useDispatch, useSelector } from 'react-redux'
import { getVideo } from '../../features/homeSlice/homeSlice'
import HeroBanner from '../../components/heroBanner/HeroBanner'
import ContinueWatching from '../../components/continueWatching/ContinueWatching'
import VideoCard from '../../components/videoCard/VideoCard'

const Home = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getVideo());
    }, [])

    const { homeVideos } = useSelector((state) => state.home);

    const homeVideoData = homeVideos?.data;

    console.log(homeVideoData, "homeVideoData")
    return (
        <>
            <section className='py-6 w-full relative'>
                <div className="view">
                    <CategoryTabs categoriesItem={homeVideoData?.categories} />
                </div>
            </section>
            <section className='bg-[#020711] w-full relative'>
                <HeroBanner bannerData={homeVideoData?.banners} />
            </section>
            <section className='bg-[#020711] py-6 w-full relative'>
                <div className="view">
                    <ContinueWatching continueWatchingData={homeVideoData?.continueWatching} />
                </div>
            </section>
            <section className='bg-[#020711] py-6 w-full relative'>
                <div className="view flex flex-col gap-y-10">
                    {

                        homeVideoData?.sections?.map((items, idx) => (
                            <div key={idx}>
                                <VideoCard items={items} />
                            </div>
                        ))

                    }
                </div>
            </section>
        </>
    )
}

export default Home