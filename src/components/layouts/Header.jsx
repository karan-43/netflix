import { Bell, Heart, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import Register from "../register/Register";
import { useDispatch, useSelector } from "react-redux";
import { profileData } from "../../features/authSlice/authSlice";
import Login from "../login/Login";
import { removeToken } from "../../features/authSlice/authSlice";
import { clearWatchlist } from "../../features/watchlistSlice/watchlistSlice";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, user, loading } = useSelector((state) => state.auth);
    const [modalOpen, setModalOpen] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { watchlist } = useSelector((state) => state.watchlist);

    console.log(token, user, "Dgdfgdfgdfg")
    useEffect(() => {
        if (token && user?.data && !user?.data?.userName) {
            setModalOpen("step1");
        }
    }, [token, user?.data]);

    useEffect(() => {
        if (token) {
            dispatch(profileData());
        }
    }, [token]);


    const handleLogout = () => {
        dispatch(removeToken());
        setIsDropdownOpen(false);
        dispatch(clearWatchlist());
    }
    return (

        <>
            <div className="w-full bg-[#020b1c] py-6">
                <div className="view flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <h1 className="text-white text-xl font-semibold">Streamify</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {
                                (!token || !user?.data?.userName) ?
                                    (
                                        <div className="relative">
                                            <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-10 h-10 rounded-xl border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition">
                                                <User className="text-white w-5 h-5" />
                                            </button>
                                        </div>
                                    )
                                    : (
                                        <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`text-white bg-gradient-to-r font-semibold from-blue-500 to-purple-500 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-800 transition ${(!user?.data?.userName || loading) ? "animate-pulse" : ""}`}>
                                            {user?.data?.userName ? user?.data?.userName?.charAt(0)?.toUpperCase() : ""}
                                        </button>
                                    )
                            }

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-[#020b1c] rounded-xl shadow-lg border border-gray-600 overflow-hidden z-50">
                                    {
                                        !token ? (
                                            <div className="py-1">
                                                <button
                                                    onClick={() => {
                                                        setModalOpen("login");
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition text-sm font-medium"
                                                >
                                                    Login
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setModalOpen("step1");
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition text-sm font-medium"
                                                >
                                                    Register
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="py-1">
                                                <button
                                                    onClick={() => {
                                                        navigate("/profile");
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition text-sm font-medium"
                                                >
                                                    Profile
                                                </button>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition text-sm font-medium"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        )
                                    }
                                </div>
                            )}
                        </div>

                        {/* Search Icon */}
                        <div className="w-10 h-10 rounded-xl border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition">
                            <Search className="text-white w-5 h-5" />
                        </div>

                        {/* Notification Icon */}
                        <div className="relative w-10 h-10 rounded-xl border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition">
                            <Bell className="text-white w-5 h-5" />

                            {/* Red Dot */}
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                        </div>
                        <Link to="/favourites" className="relative w-10 h-10 rounded-xl border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition">
                            <Heart className="text-white w-5 h-5" />
                        </Link>

                    </div>
                </div>
            </div >

            {modalOpen === "step1" && <Register setModalOpen={setModalOpen} modalOpen={modalOpen} />
            }
            {
                modalOpen === "login" && <Login setModalOpen={setModalOpen} modalOpen={modalOpen} />
            }
        </>
    )
}

export default Header