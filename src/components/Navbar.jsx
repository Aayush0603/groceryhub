import {
  useContext,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { HashLink } from "react-router-hash-link";

import {
  FaBars,
  FaTimes,
  FaShoppingCart,
} from "react-icons/fa";

import toast from "react-hot-toast";

import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    totalItems,
    setCartItems,
  } = useContext(CartContext);

  const {
    currentUser,
    logout,
  } = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);

  // CLOSE MOBILE MENU
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // LOGOUT
  const handleLogout = () => {
    try {
      // CLEAR CART STATE
      setCartItems([]);
      // LOGOUT USER
      logout();
      toast.success(t("nav.loggedOut"));
      // REDIRECT
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error(t("nav.logoutFailed"));
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100 shadow-md transition-all duration-300">
      <div className="w-full xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 py-5 flex justify-between items-center gap-4">
        {/* LOGO (LEFT) */}
        <Link
          to="/"
          className="text-2xl lg:text-3xl font-extrabold tracking-tight hover:scale-105 transition duration-300 select-none flex items-center shrink-0"
        >
          <span className="text-green-600">Grocery</span>
          <span className="text-gray-800">Hub</span>
        </Link>

        {/* DESKTOP MENU - CORE NAVIGATION LINKS (CENTER) */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-4 lg:gap-8 xl:gap-10 text-sm lg:text-[18px] font-bold text-gray-700 mx-4">
          <Link
            to="/"
            className="hover:text-green-600 transition duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-0 hover:after:w-full after:bg-green-600 after:transition-all after:duration-300"
          >
            {t("nav.home")}
          </Link>
          <HashLink
            smooth
            to="/#products"
            className="hover:text-green-600 transition duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-0 hover:after:w-full after:bg-green-600 after:transition-all after:duration-300"
          >
            {t("nav.products")}
          </HashLink>
          <HashLink
            smooth
            to="/#contact"
            className="hover:text-green-600 transition duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-0 hover:after:w-full after:bg-green-600 after:transition-all after:duration-300"
          >
            {t("nav.contact")}
          </HashLink>
          {currentUser && (
            <Link
              to="/my-orders"
              className="hover:text-green-600 transition duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-0 hover:after:w-full after:bg-green-600 after:transition-all after:duration-300 whitespace-nowrap"
            >
              {t("nav.myOrders")}
            </Link>
          )}
          {currentUser && (
            <Link
              to="/profile"
              className="hover:text-green-600 transition duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-0 hover:after:w-full after:bg-green-600 after:transition-all after:duration-300"
            >
              {t("nav.profile")}
            </Link>
          )}
        </div>

        {/* DESKTOP ACTIONS - BUTTONS & SWITCHERS (RIGHT) */}
        <div className="hidden md:flex items-center gap-3 lg:gap-5 shrink-0">
          <LanguageSwitcher />

          <div className="h-6 w-[1px] bg-gray-200 mx-0.5"></div>

          {!currentUser ? (
            <>
              {/* LOGIN */}
              <Link
                to="/login"
                className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm lg:text-[17px] px-4 py-2 lg:px-6 lg:py-3 rounded-full shadow-md hover:shadow-lg transition duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                {t("nav.login")}
              </Link>
            </>
          ) : (
            <>
              {/* USER */}
              <span className="text-gray-700 text-sm lg:text-[17px] font-bold max-w-[120px] lg:max-w-[150px] xl:max-w-[180px] truncate" title={`${t("nav.hello")} ${currentUser.name || currentUser.phone || "User"}`}>
                {t("nav.hello")} <span className="text-green-600 font-bold">{(currentUser.name ? currentUser.name.trim().split(" ")[0] : (currentUser.phone || "User"))}</span>
              </span>
              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold text-sm lg:text-[17px] px-4 py-2 lg:px-5 lg:py-2.5 rounded-full shadow-md hover:shadow-lg transition duration-200 hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              >
                {t("nav.logout")}
              </button>
            </>
          )}

          {/* CART */}
          <Link
            to="/cart"
            className="flex items-center gap-2 lg:gap-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm lg:text-[17px] px-4 py-2 lg:px-6 lg:py-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 shrink-0"
          >
            <FaShoppingCart className="text-base lg:text-lg" />
            <span className="whitespace-nowrap">{t("nav.cart")} ({totalItems})</span>
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-2xl text-gray-800 p-1.5 hover:bg-gray-100 rounded-lg transition duration-200"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden backdrop-blur-xl bg-white/95 border-t border-gray-100 px-6 py-6 space-y-4 text-base font-semibold shadow-lg transition-all duration-300">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-50">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">{t("nav.language") || "Language"}</span>
            <LanguageSwitcher />
          </div>

          <div className="space-y-3.5">
            {/* HOME */}
            <Link
              to="/"
              className="block text-gray-700 hover:text-green-600 py-1 transition duration-200"
              onClick={closeMenu}
            >
              {t("nav.home")}
            </Link>
            {/* PRODUCTS */}
            <HashLink
              smooth
              to="/#products"
              className="block text-gray-700 hover:text-green-600 py-1 transition duration-200"
              onClick={closeMenu}
            >
              {t("nav.products")}
            </HashLink>
            {/* CONTACT */}
            <HashLink
              smooth
              to="/#contact"
              className="block text-gray-700 hover:text-green-600 py-1 transition duration-200"
              onClick={closeMenu}
            >
              {t("nav.contact")}
            </HashLink>
            {/* MY ORDERS */}
            {currentUser && (
              <Link
                to="/my-orders"
                className="block text-gray-700 hover:text-green-600 py-1 transition duration-200"
                onClick={closeMenu}
              >
                {t("nav.myOrders")}
              </Link>
            )}
            {/* PROFILE */}
            {currentUser && (
              <Link
                to="/profile"
                className="block text-gray-700 hover:text-green-600 py-1 transition duration-200"
                onClick={closeMenu}
              >
                {t("nav.profile")}
              </Link>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            {!currentUser ? (
              <>
                {/* LOGIN */}
                <Link
                  to="/login"
                  className="block text-center bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-full w-full shadow-sm transition duration-200"
                  onClick={closeMenu}
                >
                  {t("nav.login")}
                </Link>
              </>
            ) : (
              <>
                {/* USER */}
                <div className="text-gray-600 text-sm font-semibold text-center py-1">
                  {t("nav.hello")} <span className="text-green-600 font-bold">{currentUser.name || currentUser.phone || "User"}</span>
                </div>
                {/* LOGOUT */}
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-full shadow-sm transition duration-200"
                >
                  {t("nav.logout")}
                </button>
              </>
            )}
            {/* CART */}
            <Link
              to="/cart"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-full w-full shadow-sm transition duration-200"
              onClick={closeMenu}
            >
              <FaShoppingCart className="text-base" />
              <span>{t("nav.cart")} ({totalItems})</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;