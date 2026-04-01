import { useEffect, useState } from "react";
import { Eye, EyeOff, Phone, Lock, User, X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { registerData } from "../../features/registerSlice/registerSlice.js"
import { useDispatch, useSelector } from "react-redux";
import Otp from "../otp/Otp.jsx";
import BasicDetails from "../basicDetails/BasicDetails.jsx";

export default function Register({ modalOpen, setModalOpen }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1);

  const dispatch = useDispatch();
  const { register } = useSelector((state) => state.register);
  const { otp } = useSelector((state) => state.otp);
  const { user, token } = useSelector((state) => state.auth);


  useEffect(() => {
    if (user?.data && !user?.data?.userName && token) {
      setStep(3);
    }
  }, [user, token]);



  const formik = useFormik({
    initialValues: {
      username: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, "Minimum 3 characters")
        .required("Username is required"),
      mobile: Yup.string()
        .matches(/^[0-9]{10}$/, "Enter valid 10 digit number")
        .required("Mobile number is required"),

      password: Yup.string()
        .min(6, "Minimum 6 characters")
        .required("Password is required"),

      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm your password"),

      terms: Yup.boolean().oneOf([true], "You must accept terms"),
    }),

    onSubmit: async (values) => {
      try {
        const res = await dispatch(registerData(values)).unwrap();
        if (res) {
          setStep(2);
          console.log(res, "resgistervgsvdsg");
        }
      } catch (err) {
        console.error("Registration failed:", err);
      }
    },
  });

  if (step === 2) {
    return <Otp modalOpen={modalOpen} setStep={setStep} step={step} setModalOpen={setModalOpen} mobile={formik.values.mobile} />;
  }

  if (step === 3) {
    return <BasicDetails res={otp?.data} modalOpen={modalOpen} setStep={setStep} step={step} setModalOpen={setModalOpen} />;
  }




  return (
    <>

      {step === 1 && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="w-full max-w-md bg-[#020b1c] text-white rounded-2xl p-6 relative">
          <button onClick={() => setModalOpen("")} className="cursor-pointer absolute top-4 right-4 text-gray-400">
            <X className="size-5 text-white" />
          </button>

          <h2 className="text-2xl font-semibold mb-6 mt-6">
            Create your account
          </h2>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Mobile */}
            <div className="border border-blue-500 rounded-xl p-3 bg-white/5">
              <div className="flex items-center gap-3">
                <User className="text-gray-400" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="bg-transparent outline-none w-full text-sm"
                  onChange={formik.handleChange}
                  value={formik.values.username}
                />
              </div>
              {formik.errors.username && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.username}</p>
              )}
            </div>
            {/* Mobile */}
            <div className="border border-blue-500 rounded-xl p-3 bg-white/5">
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" />
                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile number"
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

            {/* Confirm Password */}
            <div className="border border-blue-500 rounded-xl p-3 bg-white/5">
              <div className="flex items-center gap-3">
                <Lock className="text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="bg-transparent outline-none w-full text-sm"
                  onChange={formik.handleChange}
                  value={formik.values.confirmPassword}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {formik.errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                name="terms"
                checked={formik.values.terms}
                onChange={formik.handleChange}
                className="accent-blue-500"
              />
              <span>
                I agree to{" "}
                <span className="text-blue-500">Terms & Conditions</span>
              </span>
            </div>
            {formik.errors.terms && (
              <p className="text-red-500 text-xs">{formik.errors.terms}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={formik.isSubmitting || register?.loading}
              className={`w-full py-3 cursor-pointer rounded-xl font-semibold ${formik.isSubmitting || register?.loading
                ? "bg-gray-500 opacity-70 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-purple-600"
                }`}
            >
              {formik.isSubmitting || register?.loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          {/* Footer */}
          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account?{" "}
            <span className="text-blue-500 cursor-pointer">Log in</span>
          </p>

        </div>
      </div>}
    </>
  );
}