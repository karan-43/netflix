import { Bell, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import Register from "../register/Register";
import { useDispatch, useSelector } from "react-redux";
import { profileData } from "../../features/authSlice/authSlice";

const Header = () => {
    const dispatch = useDispatch();
    const { token, user } = useSelector((state) => state.auth);
    const [modalOpen, setModalOpen] = useState("");
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

                        {
                            token && user?.data && !user?.data?.userName ?
                                (< button type="button" onClick={() => setModalOpen("step1")} className="w-10 h-10 rounded-xl border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition">
                                    <User className="text-white w-5 h-5" />
                                </button>)
                                : (
                                    <button type="button" className="text-white bg-gradient-to-r font-semibold from-blue-500 to-purple-500 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-800 transition">{user?.data?.userName[0].toUpperCase()}</button>
                                )
                        }

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

                    </div>
                </div>
            </div >

            {modalOpen === "step1" && <Register setModalOpen={setModalOpen} modalOpen={modalOpen} />
            }
        </>
    )
}

export default Header