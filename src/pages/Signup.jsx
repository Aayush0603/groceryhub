import { useState, useContext } from "react";

import { Link, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import toast from "react-hot-toast";

import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhoneAlt,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
} from "react-icons/fa";

import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import { AuthContext } from "../context/AuthContext";

function Signup() {

  const navigate = useNavigate();

  const { login } =
    useContext(AuthContext);

  // FORM STATE
  const [formData, setFormData] =
    useState({

      name: "",

      phone: "",

      email: "",

      password: "",

      confirmPassword: "",

    });

  // LOADING
  const [loading, setLoading] =
    useState(false);

  // PASSWORD VISIBILITY
  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  // HANDLE CHANGE
  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,

    });

  };

  // SIGNUP
  const handleSignup = async (e) => {

    e.preventDefault();

    // REQUIRED FIELDS
    if (
      !formData.name ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {

      toast.error(
        "Please fill all required fields"
      );

      return;

    }

    // PHONE VALIDATION
    if (
      formData.phone.length !== 10
    ) {

      toast.error(
        "Phone number must be 10 digits"
      );

      return;

    }

    // PASSWORD LENGTH
    if (
      formData.password.length < 6
    ) {

      toast.error(
        "Password must be at least 6 characters"
      );

      return;

    }

    // PASSWORD MATCH
    if (
      formData.password !==
      formData.confirmPassword
    ) {

      toast.error(
        "Passwords do not match"
      );

      return;

    }

    try {

      setLoading(true);

      // CHECK DUPLICATE PHONE
      const phoneQuery =
        query(
          collection(db, "users"),
          where(
            "phone",
            "==",
            formData.phone
          )
        );

      const phoneSnapshot =
        await getDocs(
          phoneQuery
        );

      if (
        !phoneSnapshot.empty
      ) {

        toast.error(
          "Phone number already registered"
        );

        setLoading(false);

        return;

      }

      // CHECK DUPLICATE EMAIL
      if (formData.email) {

        const emailQuery =
          query(
            collection(
              db,
              "users"
            ),
            where(
              "email",
              "==",
              formData.email
            )
          );

        const emailSnapshot =
          await getDocs(
            emailQuery
          );

        if (
          !emailSnapshot.empty
        ) {

          toast.error(
            "Email already registered"
          );

          setLoading(false);

          return;

        }

      }

      // SAVE USER
      const docRef =
        await addDoc(
          collection(
            db,
            "users"
          ),
          {

            name:
              formData.name,

            phone:
              formData.phone,

            email:
              formData.email ||
              "",

            password:
              formData.password,

            role:
              "customer",

            // EMPTY ADDRESSES
            savedAddresses: [],

            createdAt:
              serverTimestamp(),

          }
        );

      // USER DATA
      const userData = {

        uid: docRef.id,

        name:
          formData.name,

        phone:
          formData.phone,

        email:
          formData.email ||
          "",

        role:
          "customer",

      };

      // LOGIN USER
      login(userData);

      toast.success(
        "Account Created Successfully"
      );

      // REDIRECT
      navigate("/");

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to create account"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center px-6 py-20">

      <motion.div
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-10"
      >

        {/* BACK BUTTON */}
        <Link
          to="/"
          className="inline-flex items-center gap-3 text-green-700 font-semibold hover:text-green-800 mb-8 transition duration-300"
        >

          <FaArrowLeft />

          Back To Home

        </Link>

        {/* TITLE */}
        <div className="text-center mb-10">

          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">

            Create Account 🛒

          </h1>

          <p className="text-gray-600 text-lg">

            Join GroceryHub and
            start ordering groceries.

          </p>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSignup}
          className="space-y-6"
        >

          {/* NAME */}
          <div>

            <label className="block text-gray-700 font-semibold mb-3">

              Full Name *

            </label>

            <div className="flex items-center border border-gray-200 rounded-2xl px-4">

              <FaUser className="text-green-600" />

              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-4 outline-none rounded-2xl"
              />

            </div>

          </div>

          {/* PHONE */}
          <div>

            <label className="block text-gray-700 font-semibold mb-3">

              Mobile Number *

            </label>

            <div className="flex items-center border border-gray-200 rounded-2xl px-4">

              <FaPhoneAlt className="text-green-600" />

              <input
                type="text"
                name="phone"
                placeholder="Enter mobile number"
                value={formData.phone}
                onChange={(e) => {

                  const value =
                    e.target.value.replace(
                      /\D/g,
                      ""
                    );

                  if (
                    value.length <= 10
                  ) {

                    setFormData({

                      ...formData,

                      phone: value,

                    });

                  }

                }}
                className="w-full p-4 outline-none rounded-2xl"
              />

            </div>

          </div>

          {/* EMAIL */}
          <div>

            <label className="block text-gray-700 font-semibold mb-3">

              Email Address (Optional)

            </label>

            <div className="flex items-center border border-gray-200 rounded-2xl px-4">

              <FaEnvelope className="text-green-600" />

              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-4 outline-none rounded-2xl"
              />

            </div>

          </div>

          {/* PASSWORD */}
          <div>

            <label className="block text-gray-700 font-semibold mb-3">

              Password *

            </label>

            <div className="flex items-center border border-gray-200 rounded-2xl px-4">

              <FaLock className="text-green-600" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-4 outline-none rounded-2xl"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="text-gray-500"
              >

                {showPassword
                  ? <FaEyeSlash />
                  : <FaEye />
                }

              </button>

            </div>

          </div>

          {/* CONFIRM PASSWORD */}
          <div>

            <label className="block text-gray-700 font-semibold mb-3">

              Confirm Password *

            </label>

            <div className="flex items-center border border-gray-200 rounded-2xl px-4">

              <FaLock className="text-green-600" />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-4 outline-none rounded-2xl"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="text-gray-500"
              >

                {showConfirmPassword
                  ? <FaEyeSlash />
                  : <FaEye />
                }

              </button>

            </div>

          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white py-5 rounded-2xl text-xl font-bold shadow-2xl hover:scale-105 transition duration-300"
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

          </button>

        </form>

        {/* LOGIN LINK */}
        <p className="text-center text-gray-600 mt-8">

          Already have an account?{" "}

          <Link
            to="/login"
            className="text-green-600 font-bold hover:underline"
          >

            Login

          </Link>

        </p>

      </motion.div>

    </section>

  );

}

export default Signup;