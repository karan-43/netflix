import { Bell, Search } from "lucide-react";

const Header = () => {
    return (

        <div className="w-full bg-[#020b1c] py-6">
            <div className="view flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <h1 className="text-white text-xl font-semibold">Streamify</h1>
                </div>
                <div className="flex items-center gap-4">

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
        </div>
    )
}

export default Header