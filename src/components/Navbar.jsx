import {
  useContext,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { HashLink } from "react-router-hash-link";

import {
  FaBars,
  FaTimes,
  FaShoppingCart,
  FaHome,
  FaBox,
  FaPhone,
  FaHistory,
  FaUser,
  FaSignOutAlt,
  FaLeaf,
  FaHeart
} from "react-icons/fa";

import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    totalItems,
    setCartItems,
  } = useContext(CartContext);

  const {
    currentUser,
    logout,
  } = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // CLOSE MOBILE MENU
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // LOGOUT
  const handleLogout = () => {
    setIsLoggingOut(true);
    // Delay slightly to play the premium logging out animation
    setTimeout(() => {
      try {
        // CLEAR CART STATE
        setCartItems([]);
        // LOGOUT USER
        logout();
        toast.success(t("nav.loggedOut") || "Logged out successfully!");
        // REDIRECT
        navigate("/login");
      } catch (error) {
        console.error(error);
        toast.error(t("nav.logoutFailed") || "Failed to log out.");
      } finally {
        setIsLoggingOut(false);
      }
    }, 1500);
  };

  // Navigation Items with Icons for mobile
  const navItems = [
    { label: t("nav.home") || "Home", to: "/", type: "link", icon: FaHome },
    { label: t("nav.products") || "Products", to: "/products", type: "link", icon: FaBox },
    { label: t("nav.favorites", "Favourite Items"), to: "/favorites", type: "link", icon: FaHeart },
    { label: t("nav.contact") || "Contact", to: "/#contact", type: "hash", icon: FaPhone },
    ...(currentUser ? [
      { label: t("nav.myOrders") || "My Orders", to: "/my-orders", type: "link", icon: FaHistory },
      { label: t("nav.profile") || "Profile", to: "/profile", type: "link", icon: FaUser }
    ] : [])
  ];

  // Helper to determine if a route is active
  const isActive = (item) => {
    if (item.type === "hash") {
      const hash = item.to.substring(item.to.indexOf("#"));
      return location.pathname === "/" && location.hash === hash;
    }
    return location.pathname === item.to && !location.hash;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/75 border-b border-gray-100/60 shadow-sm transition-all duration-300">
        <div className="w-full xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 py-3.5 flex justify-between items-center gap-4">
          
          {/* LOGO (LEFT) */}
          <Link
            to="/"
            className="flex items-center gap-2.5 select-none shrink-0 group"
          >
            <img src="/images/logo.jpeg" alt="Gandhi Trading Co." className="h-12 w-12 rounded-full shadow-md group-hover:scale-110 transition-all duration-300" />
            <span className="text-xl lg:text-2xl font-black tracking-tight text-gray-900 group-hover:text-green-600 transition-colors duration-300">
              <span className="text-green-600">Gandhi</span>Bazaar
            </span>
          </Link>

          {/* DESKTOP MENU - CORE NAVIGATION LINKS (CENTER) */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-1.5 lg:gap-3 xl:gap-4 font-bold text-gray-700 mx-4">
            {navItems.map((item) => {
              const isCurrent = isActive(item);
              const linkClass = `px-4 py-2 rounded-full font-extrabold text-[15px] lg:text-[17px] transition-all duration-300 relative select-none whitespace-nowrap ${
                isCurrent
                  ? "text-green-700 bg-green-50 border border-green-100/50 shadow-sm"
                  : "text-gray-600 hover:text-green-600 hover:bg-gray-50/50"
              }`;

              if (item.type === "hash") {
                return (
                  <HashLink key={item.to} smooth to={item.to} className={linkClass}>
                    {item.label}
                  </HashLink>
                );
              }
              return (
                <Link key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* DESKTOP ACTIONS - BUTTONS & SWITCHERS (RIGHT) */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 shrink-0">
            <LanguageSwitcher />

            <div className="h-6 w-[1px] bg-gray-200/80 mx-0.5"></div>

            {!currentUser ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-sm lg:text-[16px] px-5 py-2.5 rounded-full shadow-md shadow-green-500/10 transition duration-300"
                >
                  {t("nav.login") || "Login"}
                </Link>
              </motion.div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-green-50/80 px-3.5 py-1.5 rounded-full border border-green-100 shrink-0">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-black">
                    {(currentUser.name ? currentUser.name[0] : (currentUser.phone ? currentUser.phone[0] : "U")).toUpperCase()}
                  </div>
                  <span className="text-gray-700 text-sm lg:text-[15px] font-bold truncate max-w-[100px] lg:max-w-[120px] whitespace-nowrap" title={`${t("nav.hello")} ${currentUser.name || currentUser.phone || "User"}`}>
                    {t("nav.hello") || "Hello,"} <span className="text-green-700 font-extrabold">{(currentUser.name ? currentUser.name.trim().split(" ")[0] : (currentUser.phone || "User"))}</span>
                  </span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-sm lg:text-[15px] px-4 py-2.5 rounded-full shadow-md shadow-red-500/10 transition-all duration-300 shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <FaSignOutAlt className="w-3.5 h-3.5" />
                  {t("nav.logout") || "Logout"}
                </motion.button>
              </div>
            )}

            {/* CART */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
              <Link
                to="/cart"
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-sm lg:text-[16px] px-4 py-2.5 rounded-full shadow-md shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300"
              >
                <FaShoppingCart className="text-base" />
                <span className="whitespace-nowrap">{t("nav.cart") || "Cart"} ({totalItems})</span>
              </Link>
            </motion.div>
          </div>

          {/* MOBILE ACTIONS */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              className="text-gray-800 p-2.5 hover:bg-gray-100 active:scale-95 border border-gray-200/80 rounded-xl transition duration-200 bg-gray-50 flex items-center justify-center text-xl shadow-sm cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden absolute top-full left-0 w-full backdrop-blur-xl bg-white/95 border-b border-gray-100 px-6 py-5 space-y-4 text-base font-semibold shadow-xl rounded-b-3xl z-40 overflow-hidden"
            >
              {/* USER GREETING (TOP) */}
              {currentUser && (
                <div className="flex items-center gap-3 mb-1 pb-3.5 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-extrabold text-lg shrink-0 border border-green-200/50">
                    {(currentUser.name ? currentUser.name[0] : (currentUser.phone ? currentUser.phone[0] : "U")).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0 whitespace-nowrap">
                    <span className="text-gray-500 font-bold text-sm tracking-wider">{t("nav.hello") || "Hello,"}</span>
                    <span className="text-gray-900 font-black text-lg truncate">
                      {currentUser.name || currentUser.phone || "User"}
                    </span>
                  </div>
                </div>
              )}

              {/* NAVIGATION LINKS */}
              <div className="flex flex-col space-y-1">
                {navItems.map((item) => {
                  const isCurrent = isActive(item);
                  const Icon = item.icon;
                  
                  return (
                    <div key={item.to}>
                      {item.type === "hash" ? (
                        <HashLink
                          smooth
                          to={item.to}
                          onClick={closeMenu}
                          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 font-bold ${
                            isCurrent
                              ? "text-green-700 bg-green-50 border border-green-100/50"
                              : "text-gray-700 hover:text-green-600 hover:bg-gray-50/50 border border-transparent"
                          }`}
                        >
                          {Icon && <Icon className={`text-lg ${isCurrent ? "text-green-600" : "text-gray-400"}`} />}
                          <span className="text-base">{item.label}</span>
                        </HashLink>
                      ) : (
                        <Link
                          to={item.to}
                          onClick={closeMenu}
                          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 font-bold ${
                            isCurrent
                              ? "text-green-700 bg-green-50 border border-green-100/50"
                              : "text-gray-700 hover:text-green-600 hover:bg-gray-50/50 border border-transparent"
                          }`}
                        >
                          {Icon && <Icon className={`text-lg ${isCurrent ? "text-green-600" : "text-gray-400"}`} />}
                          <span className="text-base">{item.label}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 flex gap-3">
                {/* CART (SIDE BY SIDE) */}
                <Link
                  to="/cart"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-green-500/10 transition duration-200 active:scale-98"
                  onClick={closeMenu}
                >
                  <FaShoppingCart className="text-base" />
                  <span className="text-sm">{t("nav.cart") || "Cart"} ({totalItems})</span>
                </Link>

                {!currentUser ? (
                  <Link
                    to="/login"
                    className="flex-1 block text-center bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-2xl shadow-md transition duration-200 active:scale-98"
                    onClick={closeMenu}
                  >
                    <span className="text-sm">{t("nav.login") || "Login"}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      closeMenu();
                      handleLogout();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3 rounded-2xl shadow-sm transition duration-200 active:scale-98 cursor-pointer"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span className="text-sm">{t("nav.logout") || "Logout"}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* LOGOUT ANIMATION OVERLAY */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 text-center border border-gray-100"
            >
              <div className="relative w-16 h-16 mb-4">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-red-100 border-t-red-600"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-2 bg-red-50/80 rounded-full flex items-center justify-center text-red-600">
                  <FaSignOutAlt className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Signing Out
              </h3>
              <p className="text-gray-500 text-sm font-semibold">
                Please wait while we secure your account...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;