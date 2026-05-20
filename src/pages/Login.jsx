import {
  useState,
  useContext,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";

import toast from "react-hot-toast";

import {
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaPhoneAlt,
} from "react-icons/fa";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import { AuthContext } from "../context/AuthContext";

function Login() {

  const navigate =
    useNavigate();

  const { login } =
    useContext(AuthContext);

  // FORM STATE
  const [formData, setFormData] =
    useState({

      loginInput: "",
      password: "",

    });

  // LOADING
  const [loading, setLoading] =
    useState(false);

  // HANDLE CHANGE
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
      !formData.loginInput ||
      !formData.password
    ) {

      toast.error(
        "Please fill all fields"
      );

      return;

    }

    try {

      setLoading(true);

      let userQuery;

      // CHECK IF EMAIL
      if (
        formData.loginInput.includes(
          "@"
        )
      ) {

        userQuery =
          query(
            collection(
              db,
              "users"
            ),
            where(
              "email",
              "==",
              formData.loginInput
            )
          );

      }

      // MOBILE LOGIN
      else {

        userQuery =
          query(
            collection(
              db,
              "users"
            ),
            where(
              "phone",
              "==",
              formData.loginInput
            )
          );

      }

      // GET USER
      const querySnapshot =
        await getDocs(
          userQuery
        );

      // USER NOT FOUND
      if (
        querySnapshot.empty
      ) {

        toast.error(
          "User not found"
        );

        setLoading(false);

        return;

      }

      // USER DATA
      const userDoc =
        querySnapshot.docs[0];

      const userData =
        {

          uid:
            userDoc.id,

          ...userDoc.data(),

        };

      // PASSWORD CHECK
      if (
        userData.password !==
        formData.password
      ) {

        toast.error(
          "Invalid password"
        );

        setLoading(false);

        return;

      }

      // LOGIN USER
      login(userData);

      toast.success(
        "Login Successful"
      );

      // ADMIN
      if (
        userData.role ===
        "admin"
      ) {

        navigate("/admin");

      }

      // CUSTOMER
      else {

        navigate("/");

      }

    } catch (error) {

      console.error(error);

      toast.error(
        "Login Failed"
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

            Login using mobile number
            or email.

          </p>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          {/* LOGIN INPUT */}
          <div>

            <label className="block text-gray-700 font-semibold mb-3">

              Mobile Number / Email

            </label>

            <div className="flex items-center border border-gray-200 rounded-2xl px-4">

              {formData.loginInput.includes(
                "@"
              ) ? (

                <FaEnvelope className="text-green-600" />

              ) : (

                <FaPhoneAlt className="text-green-600" />

              )}

              <input
                type="text"
                name="loginInput"
                placeholder="Enter mobile number or email"
                value={formData.loginInput}
                onChange={handleChange}
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
              : "Login"}

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