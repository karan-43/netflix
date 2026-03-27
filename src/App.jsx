import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layouts/AppLayout'
import Home from './pages/home/Home'
import VideoDetail from './pages/videoDetail/VideoDetail'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path='/video/:id' element={<VideoDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
