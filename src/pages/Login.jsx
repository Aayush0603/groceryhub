import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaPhoneAlt,
  FaUser,
  FaEye,
  FaEyeSlash,
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

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  // TAB STATE: 'login' or 'signup'
  const [activeTab, setActiveTab] = useState("login");

  // Determine initial tab based on route
  useEffect(() => {
    if (location.pathname === "/signup") {
      setActiveTab("signup");
    } else {
      setActiveTab("login");
    }
  }, [location.pathname]);

  // LOGIN FORM STATE
  const [loginData, setLoginData] = useState({
    loginInput: "",
    password: "",
  });

  // SIGNUP FORM STATE
  const [signupData, setSignupData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // UI STATE
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // HANDLE CHANGES
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  // HANDLE LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.loginInput || !loginData.password) {
      toast.error(t("auth.fillAllFields") || "Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      let userQuery;

      if (loginData.loginInput.includes("@")) {
        userQuery = query(collection(db, "users"), where("email", "==", loginData.loginInput));
      } else {
        userQuery = query(collection(db, "users"), where("phone", "==", loginData.loginInput));
      }

      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.empty) {
        toast.error(t("auth.userNotFound") || "User not found");
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = { uid: userDoc.id, ...userDoc.data() };

      if (userData.password !== loginData.password) {
        toast.error(t("auth.invalidPassword") || "Invalid password");
        setLoading(false);
        return;
      }

      await login(userData);
      toast.success(t("auth.loginSuccess") || "Login Successful");

      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(t("auth.loginFailed") || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  // HANDLE SIGNUP
  const handleSignup = async (e) => {
    e.preventDefault();
    if (
      !signupData.name ||
      !signupData.phone ||
      !signupData.password ||
      !signupData.confirmPassword
    ) {
      toast.error(t("auth.fillRequiredFields") || "Please fill all required fields");
      return;
    }

    if (signupData.phone.length !== 10) {
      toast.error(t("auth.phoneInvalid") || "Phone number must be 10 digits");
      return;
    }

    if (signupData.password.length < 6) {
      toast.error(t("auth.passwordShort") || "Password must be at least 6 characters");
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error(t("auth.passwordMismatch") || "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const phoneQuery = query(collection(db, "users"), where("phone", "==", signupData.phone));
      const phoneSnapshot = await getDocs(phoneQuery);

      if (!phoneSnapshot.empty) {
        toast.error(t("auth.phoneExists") || "Phone number already registered");
        setLoading(false);
        return;
      }

      if (signupData.email) {
        const emailQuery = query(collection(db, "users"), where("email", "==", signupData.email));
        const emailSnapshot = await getDocs(emailQuery);

        if (!emailSnapshot.empty) {
          toast.error(t("auth.emailExists") || "Email already registered");
          setLoading(false);
          return;
        }
      }

      const docRef = await addDoc(collection(db, "users"), {
        name: signupData.name,
        phone: signupData.phone,
        email: signupData.email || "",
        password: signupData.password,
        role: "customer",
        savedAddresses: [],
        createdAt: serverTimestamp(),
      });

      const userData = {
        uid: docRef.id,
        name: signupData.name,
        phone: signupData.phone,
        email: signupData.email || "",
        role: "customer",
      };

      await login(userData);
      toast.success(t("auth.signupSuccess") || "Account Created Successfully");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(t("auth.signupFailed") || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center px-4 py-8 md:py-12 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 my-auto"
      >
        {/* BACK BUTTON */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 mb-6 transition duration-300 text-base"
        >
          <FaArrowLeft className="text-sm" />
          {t("auth.backToHome") || "Back To Home"}
        </Link>

        {/* TAB HEADER */}
        <div className="flex w-full mb-8 bg-gray-100 rounded-full p-1 relative">
          <button
            onClick={() => {
              setActiveTab("login");
              navigate("/login");
            }}
            className={`flex-1 py-3 text-lg font-bold rounded-full transition-all duration-300 z-10 ${
              activeTab === "login" ? "text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("auth.loginTab") || "Login"}
          </button>
          <button
            onClick={() => {
              setActiveTab("signup");
              navigate("/signup");
            }}
            className={`flex-1 py-3 text-lg font-bold rounded-full transition-all duration-300 z-10 ${
              activeTab === "signup" ? "text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("auth.signupTab") || "Sign Up"}
          </button>
          
          {/* TAB BACKGROUND PILL */}
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-green-600 rounded-full transition-transform duration-300 ease-in-out shadow-md ${
              activeTab === "signup" ? "translate-x-[calc(100%+0.5rem)]" : "translate-x-0"
            }`}
          ></div>
        </div>

        {/* TAB CONTENT WITH ANIMATION */}
        <AnimatePresence mode="wait">
          {activeTab === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* TITLE */}
              <div className="text-center mb-6">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                  {t("auth.welcomeBack") || "Welcome Back 👋"}
                </h1>
                <p className="text-gray-500 text-base">
                  {t("auth.loginDesc") || "Login using mobile number or email."}
                </p>
              </div>

              {/* LOGIN FORM */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-base">
                    {t("auth.mobileOrEmail") || "Mobile Number / Email"}
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-4 bg-gray-50/50 focus-within:border-green-500 transition duration-200">
                    {loginData.loginInput.includes("@") ? (
                      <FaEnvelope className="text-green-600 text-base" />
                    ) : (
                      <FaPhoneAlt className="text-green-600 text-base" />
                    )}
                    <input
                      type="text"
                      name="loginInput"
                      placeholder={t("auth.enterMobileOrEmail") || "Enter mobile number or email"}
                      value={loginData.loginInput}
                      onChange={handleLoginChange}
                      className="w-full p-3.5 outline-none rounded-xl bg-transparent text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-base">
                    {t("auth.password") || "Password"}
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-4 bg-gray-50/50 focus-within:border-green-500 transition duration-200">
                    <FaLock className="text-green-600 text-base" />
                    <input
                      type="password"
                      name="password"
                      placeholder={t("auth.enterPassword") || "Enter password"}
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className="w-full p-3.5 outline-none rounded-xl bg-transparent text-base"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white py-4 rounded-xl text-lg font-bold shadow-md hover:scale-[1.02] transition duration-200 mt-2"
                >
                  {loading ? (t("auth.loggingIn") || "Logging In...") : (t("auth.loginTab") || "Login")}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* TITLE */}
              <div className="text-center mb-6">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                  {t("auth.createAccount") || "Create Account 🛒"}
                </h1>
                <p className="text-gray-500 text-base">
                  {t("auth.signupDesc") || "Join GroceryHub and start ordering groceries."}
                </p>
              </div>

              {/* SIGNUP FORM */}
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-base">
                    {t("auth.fullName") || "Full Name *"}
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-4 bg-gray-50/50 focus-within:border-green-500 transition duration-200">
                    <FaUser className="text-green-600 text-base" />
                    <input
                      type="text"
                      name="name"
                      placeholder={t("auth.enterName") || "Enter your name"}
                      value={signupData.name}
                      onChange={handleSignupChange}
                      className="w-full p-3 outline-none rounded-xl bg-transparent text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-base">
                    {t("auth.mobileNumber") || "Mobile Number *"}
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-4 bg-gray-50/50 focus-within:border-green-500 transition duration-200">
                    <FaPhoneAlt className="text-green-600 text-base" />
                    <input
                      type="text"
                      name="phone"
                      placeholder={t("auth.enterMobile") || "Enter mobile number"}
                      value={signupData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          setSignupData({ ...signupData, phone: value });
                        }
                      }}
                      className="w-full p-3 outline-none rounded-xl bg-transparent text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-base">
                    {t("auth.emailOptional") || "Email Address (Optional)"}
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-4 bg-gray-50/50 focus-within:border-green-500 transition duration-200">
                    <FaEnvelope className="text-green-600 text-base" />
                    <input
                      type="email"
                      name="email"
                      placeholder={t("auth.enterEmail") || "Enter email address"}
                      value={signupData.email}
                      onChange={handleSignupChange}
                      className="w-full p-3 outline-none rounded-xl bg-transparent text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-base">
                      {t("auth.password") || "Password *"}
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-xl px-4 bg-gray-50/50 focus-within:border-green-500 transition duration-200">
                      <FaLock className="text-green-600 text-base" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder={t("auth.enterPassword") || "Enter password"}
                        value={signupData.password}
                        onChange={handleSignupChange}
                        className="w-full p-3 outline-none rounded-xl bg-transparent text-base animate-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 pl-2 focus:outline-none"
                      >
                        {showPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-base">
                      {t("auth.confirmPassword") || "Confirm Password *"}
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-xl px-4 bg-gray-50/50 focus-within:border-green-500 transition duration-200">
                      <FaLock className="text-green-600 text-base" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder={t("auth.confirmPlaceholder") || "Confirm password"}
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        className="w-full p-3 outline-none rounded-xl bg-transparent text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-500 pl-2 focus:outline-none"
                      >
                        {showConfirmPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white py-4 rounded-xl text-lg font-bold shadow-md hover:scale-[1.02] transition duration-200 mt-4"
                >
                  {loading ? (t("auth.creatingAccount") || "Creating Account...") : (t("auth.createButton") || "Create Account")}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

export default Login;