import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './footer'

const AppLayout = () => {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    )
}

export default AppLayout