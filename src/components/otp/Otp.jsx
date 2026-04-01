import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp } from "../../features/otpSlice/otpSlice";
import { toast } from 'react-toastify';
import { setToken } from "../../features/authSlice/authSlice";
import { X } from "lucide-react";


export default function Otp({ modalOpen, setModalOpen, mobile, setStep, step }) {
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [timer, setTimer] = useState(29);
    const inputRefs = useRef([]);
    const dispatch = useDispatch();
    const { otp: otpState } = useSelector((state) => state.otp);
    const token = useSelector((state) => state.auth.token);

    const { basicDetailsData } = useSelector((state) => state.basicDetails);


    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (e, index) => {
        let value = e.target.value;
        if (/[^0-9]/.test(value)) return;

        // Take only the last character if multiple are pasted
        value = value.slice(-1);

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // move to next input if there's a value
        if (value && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerifyOtp = async () => {
        console.log(otp.join(""), mobile, "otp verification");
        try {
            const res = await dispatch(verifyOtp({
                otp: otp.join(""),
                mobile: mobile,
            })).unwrap();

            if (res) {
                console.log(res, "otp verification success");
                dispatch(setToken(res.data.token));
                localStorage.setItem("token", res.data.token);
                setStep(3);
                toast.success(res?.message);
            }
        } catch (err) {
            console.error("OTP Verification failed", err);
        }
    };

    return (
        <>
            {
                step === 2 && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="w-full max-w-md bg-[#020b1c] text-white rounded-2xl p-6 relative">
                        <button
                            onClick={() => setModalOpen("")}
                            className="cursor-pointer absolute top-4 left-4 text-gray-400"
                        >
                            <X className="size-5 text-white" />
                        </button>

                        <h2 className="text-2xl font-semibold mb-3 mt-6">
                            Enter your code
                        </h2>

                        <p className="text-gray-400 text-sm mb-10 leading-relaxed pr-4">
                            We have sent a 4-digit OTP to the Mobile number {mobile || "you provided"}
                        </p>

                        <div className="flex items-center gap-4 mb-8 justify-center">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    name="otp"
                                    maxLength={1}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    value={data}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1b1e2a] text-white text-center text-2xl font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={otpState?.loading}
                            className={`w-full text-white py-3 rounded-xl ${otpState?.loading
                                ? "bg-gray-500 cursor-not-allowed opacity-70"
                                : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                                }`}
                        >
                            {otpState?.loading ? "Verifying..." : "Verify OTP"}
                        </button>

                        <div className="text-gray-400 text-sm mt-5">
                            Resend OTP in <span className="text-white">00:{timer < 10 ? `0${timer}` : timer}</span>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}