import { useState } from "react";
import { Eye, EyeOff, Phone, Lock, User, X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { basicDetails } from "../../features/basicDetailsSlice/basicDetailsSlice";
import { profileData } from "../../features/authSlice/authSlice";
import { toast } from "react-toastify";

export default function BasicDetails({ modalOpen, setModalOpen, setStep, step, res }) {
  const dispatch = useDispatch();

  const { basicDetailsData } = useSelector((state) => state.basicDetails);

  const formik = useFormik({
    initialValues: {
      userName: "",
      email: "",
      gender: "",
      dob: "",
    },
    validationSchema: Yup.object({
      userName: Yup.string()
        .min(3, "Minimum 3 characters")
        .required("Username is required"),
      email: Yup.string()
        .email("Enter valid email")
        .required("Email is required"),

      gender: Yup.string()
        .required("Gender is required"),

      dob: Yup.string()
        .required("Date of birth is required"),

    }),

    onSubmit: async (values) => {
      try {
        const basicRes = await dispatch(basicDetails(values)).unwrap();
        if (basicRes?.success) {
          dispatch(profileData())
          setModalOpen("");
          toast.success(basicRes?.message);
          console.log(basicRes?.message, "message")
        }
        console.log("basicRes", basicRes)
      } catch (err) {
        console.error("basicDetails failed:", err);
      }
    },
  });




  return (
    <>
      {step === 3 && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
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
                  name="userName"
                  placeholder="Username"
                  className="bg-transparent outline-none w-full text-sm"
                  onChange={formik.handleChange}
                  value={formik.values.userName}
                />
              </div>
              {formik.errors.userName && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.userName}</p>
              )}
            </div>
            {/* email */}
            <div className="border border-blue-500 rounded-xl p-3 bg-white/5">
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" />
                <input
                  type="text"
                  name="email"
                  placeholder="email number"
                  className="bg-transparent outline-none w-full text-sm"
                  onChange={formik.handleChange}
                  value={formik.values.email}
                />
              </div>
              {formik.errors.email && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
              )}
            </div>

            {/* gender */}
            <div className="border border-blue-500 rounded-xl p-3 bg-white/5">
              <div className="flex items-center gap-3">
                <Lock className="text-gray-400" />
                <select name="gender" id="gender" onChange={formik.handleChange} value={formik.values.gender}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

              </div>
              {formik.errors.gender && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.gender}</p>
              )}
            </div>

            {/* dob */}
            <div className="border border-blue-500 rounded-xl p-3 bg-white/5">
              <div className="flex items-center gap-3">
                <Lock className="text-gray-400" />
                <input
                  type="date"
                  name="dob"
                  placeholder="dob"
                  className="bg-transparent outline-none w-full text-sm"
                  onChange={formik.handleChange}
                  value={formik.values.dob}
                />

              </div>
              {formik.errors.dob && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.dob}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={formik.isSubmitting || basicDetailsData?.loading}
              className={`w-full py-3 cursor-pointer rounded-xl font-semibold ${formik.isSubmitting || basicDetailsData?.loading
                ? "bg-gray-500 opacity-70 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-purple-600"
                }`}
            >
              {formik.isSubmitting || basicDetailsData?.loading ? "confirming..." : "confirm"}
            </button>

          </form>

        </div>
      </div>}
    </>
  );
}