import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import toast from "react-hot-toast";

import {
  FaEnvelope,
  FaLock,
  FaArrowLeft,
} from "react-icons/fa";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  doc,
  getDoc,
} from "firebase/firestore";

function Login() {

  const navigate = useNavigate();

  // FORM STATE
  const [formData, setFormData] =
    useState({

      email: "",
      password: "",

    });

  // LOADING STATE
  const [loading, setLoading] =
    useState(false);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,

    });

  };

  // HANDLE LOGIN
  const handleLogin = async (e) => {

    e.preventDefault();

    // VALIDATION
    if (
      !formData.email ||
      !formData.password
    ) {

      toast.error(
        "Please fill all fields"
      );

      return;

    }

    try {

      setLoading(true);

      // LOGIN USER
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

      const user =
        userCredential.user;

      // GET USER DATA
      const userRef =
        doc(db, "users", user.uid);

      const userSnap =
        await getDoc(userRef);

      // CHECK ROLE
      if (userSnap.exists()) {

        const userData =
          userSnap.data();

        // SUCCESS TOAST
        toast.success(
          "Login Successful"
        );

        // ADMIN
        if (
          userData.role === "admin"
        ) {

          navigate("/admin");

        } else {

          // CUSTOMER
          navigate("/");

        }

      }

    } catch (err) {

      console.error(err);

      toast.error(
        "Invalid email or password"
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
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-10"
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

            Welcome Back 👋

          </h1>

          <p className="text-gray-600 text-lg">

            Login to continue shopping
            with GroceryHub.

          </p>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          {/* EMAIL */}
          <div>

            <label className="block text-gray-700 font-semibold mb-3">

              Email Address

            </label>

            <div className="flex items-center border border-gray-200 rounded-2xl px-4">

              <FaEnvelope className="text-green-600" />

              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-4 outline-none rounded-2xl"
              />

            </div>

          </div>

          {/* PASSWORD */}
          <div>

            <label className="block text-gray-700 font-semibold mb-3">

              Password

            </label>

            <div className="flex items-center border border-gray-200 rounded-2xl px-4">

              <FaLock className="text-green-600" />

              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-4 outline-none rounded-2xl"
              />

            </div>

          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white py-5 rounded-2xl text-xl font-bold shadow-2xl hover:scale-105 transition duration-300"
          >

            {loading
              ? "Logging In..."
              : "Login"
            }

          </button>

        </form>

        {/* SIGNUP LINK */}
        <p className="text-center text-gray-600 mt-8">

          Don’t have an account?{" "}

          <Link
            to="/signup"
            className="text-green-600 font-bold hover:underline"
          >

            Create Account

          </Link>

        </p>

      </motion.div>

    </section>

  );
}

export default Login;