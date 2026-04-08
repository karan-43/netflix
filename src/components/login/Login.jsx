import { useEffect, useState } from "react";
import { Eye, EyeOff, Phone, Lock, User, X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { loginData } from "../../features/loginSlice/loginSlice";
import { toast } from "react-toastify";
import { setToken } from "../../features/authSlice/authSlice"
import Register from "../register/Register";

export default function Login({ setModalOpen, modalOpen }) {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { login } = useSelector((state) => state.login);
  const formik = useFormik({
    initialValues: {
      mobile: "",
      password: "",
    },
    validationSchema: Yup.object({
      mobile: Yup.string().min(10, "Minimum 10 digits").max(10, "Maximum 10 digits").required("Mobile is required"),
      password: Yup.string()
        .min(6, "Minimum 6 characters")
        .required("Password is required"),
    }),

    onSubmit: async (values) => {
      try {
        const res = await dispatch(loginData(values)).unwrap();
        if (res) {
          console.log(res, "login");
          dispatch(setToken(res?.data?.token));
          localStorage.setItem("token", res?.data?.token);
          toast.success(res?.message);
          setModalOpen("");

        }
      } catch (err) {
        console.error("login failed:", err);
        toast.error(err?.message);
      }
    },
  });


  if (modalOpen === "step1") {
    return <Register />
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="w-full max-w-md bg-[#020b1c] text-white rounded-2xl p-6 relative">
          <button onClick={() => setModalOpen("")} className="cursor-pointer absolute top-4 right-4 text-gray-400">
            <X className="size-5 text-white" />
          </button>

          <h2 className="text-2xl font-semibold mb-6 mt-6">
            Login Your Account
          </h2>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="border border-blue-500 rounded-xl p-3 bg-white/5">
              <div className="flex items-center gap-3">
                <User className="text-gray-400" />
                <input
                  type="text"
                  name="mobile"
                  placeholder="mobile"
                  className="bg-transparent outline-none w-full text-sm"
                  onChange={formik.handleChange}
                  value={formik.values.mobile}
                />
              </div>
              {formik.errors.mobile && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.mobile}</p>
              )}
            </div>


            {/* Password */}
            <div className="border border-blue-500 rounded-xl p-3 bg-white/5">
              <div className="flex items-center gap-3">
                <Lock className="text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="bg-transparent outline-none w-full text-sm"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {formik.errors.password && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
              )}
            </div>


            {/* Submit */}
            <button
              type="submit"
              disabled={formik.isSubmitting || login?.loading}
              className={`w-full py-3 cursor-pointer rounded-xl font-semibold ${formik.isSubmitting || login?.loading
                ? "bg-gray-500 opacity-70 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-purple-600"
                }`}
            >
              {formik.isSubmitting || login?.loading ? "Login..." : "Login"}
            </button>

          </form>

          {/* Footer */}
          <p className="text-center text-gray-400 text-sm mt-4">
            Don't have an account?{" "}
            <button type="button" onClick={() => setModalOpen("step1")} className="text-blue-500 cursor-pointer">Register</button>
          </p>

        </div>
      </div>
    </>
  );
}