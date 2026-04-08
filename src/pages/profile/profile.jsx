import React, { useState } from "react";
import { useSelector } from "react-redux";
import { User, Mail, Shield, Bell, CreditCard, Settings, LogOut, ChevronRight, Camera, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeToken } from "../../features/authSlice/authSlice";
import Downloads from "../../components/downloads/downloads";

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState("settings");

    console.log(user, "user")
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(removeToken());
        navigate("/");
    };

    const userData = user?.data || {};

    const profileSections = [
        {
            title: "Account Settings",
            items: [
                { icon: <User className="w-5 h-5" />, label: "Personal Information", desc: "Update your name and personal details" },
                { icon: <Mail className="w-5 h-5" />, label: "Email & Communication", desc: "Manage your contact preferences" },
                { icon: <Shield className="w-5 h-5" />, label: "Security", desc: "Password, two-step verification" },
            ]
        },
        {
            title: "Subscription & Billing",
            items: [
                { icon: <CreditCard className="w-5 h-5" />, label: "Membership Plan", desc: "Premium Ultra HD Plan" },
                { icon: <Bell className="w-5 h-5" />, label: "Notifications", desc: "Manage push notifications and alerts" },
            ]
        },
        {
            title: "App Preferences",
            items: [
                { icon: <Settings className="w-5 h-5" />, label: "Playback Settings", desc: "Data usage, video quality" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#020b1c] text-white pt-10 pb-20">
            <div className="view max-w-4xl mx-auto px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8 bg-[#0a162d]/50 p-8 rounded-3xl border border-gray-800 backdrop-blur-sm">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold shadow-2xl shadow-blue-500/20">
                            {userData.userName ? userData.userName.charAt(0).toUpperCase() : <User className="w-16 h-16" />}
                        </div>
                        <label htmlFor="profilePic" className="cursor-pointer absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full border-4 border-[#020b1c] hover:bg-blue-500 transition">
                            <Camera className="w-5 h-5" />
                            <input type="file" id="profilePic" className="hidden" />
                        </label>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold mb-2">{userData.userName || "Guest User"}</h1>
                        <p className="text-gray-400 mb-4">{userData.email || "No email provided"}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-4 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-sm font-medium">
                                Premium Member
                            </span>
                            <span className="px-4 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-sm font-medium">
                                Active Plan
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition group"
                    >
                        <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        <span className="font-semibold">Sign Out</span>
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-4 mb-8 p-1 bg-[#0a162d]/50 rounded-2xl border border-gray-800 w-fit mx-auto md:mx-0">
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`flex items-center cursor-pointer gap-2 px-6 py-2.5 rounded-xl font-medium transition ${activeTab === "settings" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-white"}`}
                    >
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                    <button
                        onClick={() => setActiveTab("downloads")}
                        className={`flex items-center cursor-pointer gap-2 px-6 py-2.5 rounded-xl font-medium transition ${activeTab === "downloads" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-white"}`}
                    >
                        <Download className="w-4 h-4" />
                        Downloads
                    </button>
                </div>

                {activeTab === "settings" ? (
                    <div className="grid gap-8">
                        {profileSections.map((section, idx) => (
                            <div key={idx} className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-400 px-2">{section.title}</h2>
                                <div className="grid gap-3">
                                    {section.items.map((item, iIdx) => (
                                        <div
                                            key={iIdx}
                                            className="flex items-center justify-between p-5 bg-[#0a162d]/30 border border-gray-800 rounded-2xl hover:bg-[#0a162d]/60 hover:border-gray-700 transition cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gray-800/50 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{item.label}</h3>
                                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition transform group-hover:translate-x-1" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-400 px-2">My Offline Library</h2>
                        <Downloads />
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600 text-sm italic">
                        Logged in as {userData.userName || "Guest"}. Need help? Visit our Help Center.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;