import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layouts/AppLayout'
import Home from './pages/home/Home'
import VideoDetail from './pages/videoDetail/VideoDetail'
import { ToastContainer } from 'react-toastify';
import WatchListVideos from './pages/watchListVideos/WatchListVideos'
import Profile from './pages/profile/profile'
import FavoriteVideos from './pages/favoriteVideos/FavoriteVideos'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path='/video/:id' element={<VideoDetail />} />
            <Route path='/watchlist-videos/:id' element={<WatchListVideos />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/favourites' element={<FavoriteVideos />} />
          </Route>
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </>
  )
}

export default App
