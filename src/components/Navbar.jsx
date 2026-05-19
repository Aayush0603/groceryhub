import { useContext, useState } from "react";

import { Link } from "react-router-dom";

import { HashLink } from "react-router-hash-link";

import {
  FaBars,
  FaTimes,
  FaShoppingCart,
} from "react-icons/fa";

import { CartContext } from "../context/CartContext";

import { AuthContext } from "../context/AuthContext";

import { signOut } from "firebase/auth";

import { auth } from "../firebase/firebase";

function Navbar() {

  const {
    totalItems,
    setCartItems,
  } = useContext(CartContext);

  const { currentUser } =
    useContext(AuthContext);

  const [menuOpen, setMenuOpen] =
    useState(false);

  // CLOSE MOBILE MENU
  const closeMenu = () => {

    setMenuOpen(false);

  };

  // LOGOUT
  const handleLogout = async () => {

    try {

      // CLEAR CART STATE
      setCartItems([]);

      // CLEAR LOCAL STORAGE
      localStorage.removeItem(
        "grocery-cart"
      );

      await signOut(auth);

    } catch (error) {

      console.error(error);

    }

  };

  return (

    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200 shadow-sm transition duration-300">

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link
          to="/"
          className="text-3xl font-extrabold tracking-tight hover:scale-105 transition duration-300"
        >

          <span className="text-green-600">

            Grocery

          </span>

          <span className="text-gray-800">

            Hub

          </span>

        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex items-center gap-8 text-lg font-medium">

          {/* HOME */}
          <li>

            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 transition duration-300"
            >

              Home

            </Link>

          </li>

          {/* PRODUCTS */}
          <li>

            <HashLink
              smooth
              to="/#products"
              className="text-gray-700 hover:text-green-600 transition duration-300"
            >

              Products

            </HashLink>

          </li>

          {/* CONTACT */}
          <li>

            <HashLink
              smooth
              to="/#contact"
              className="text-gray-700 hover:text-green-600 transition duration-300"
            >

              Contact

            </HashLink>

          </li>

          {/* MY ORDERS */}
          {currentUser && (

            <li>

              <Link
                to="/my-orders"
                className="text-gray-700 hover:text-green-600 transition duration-300"
              >

                My Orders

              </Link>

            </li>

          )}

          {/* AUTH BUTTONS */}
          {!currentUser ? (

            <>

              <li>

                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 transition duration-300"
                >

                  Login

                </Link>

              </li>

              <li>

                <Link
                  to="/signup"
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl shadow-lg transition duration-300"
                >

                  Signup

                </Link>

              </li>

            </>

          ) : (

            <>

              {/* USER */}
              <li className="text-green-700 font-semibold">

                Hello,{" "}

                {currentUser.email
                  .split("@")[0]
                }

              </li>

              {/* LOGOUT */}
              <li>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl shadow-lg transition duration-300"
                >

                  Logout

                </button>

              </li>

            </>

          )}

          {/* CART */}
          <li>

            <Link
              to="/cart"
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl shadow-xl hover:scale-105 transition duration-300"
            >

              <FaShoppingCart />

              Cart ({totalItems})

            </Link>

          </li>

        </ul>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-3xl text-gray-800"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
        >

          {menuOpen
            ? <FaTimes />
            : <FaBars />
          }

        </button>

      </div>

      {/* MOBILE MENU */}
      {menuOpen && (

        <div className="md:hidden backdrop-blur-xl bg-white/95 border-t border-gray-200 px-6 py-6 space-y-5 text-lg font-medium shadow-lg transition duration-300">

          {/* HOME */}
          <Link
            to="/"
            className="block text-gray-700 hover:text-green-600 transition"
            onClick={closeMenu}
          >

            Home

          </Link>

          {/* PRODUCTS */}
          <HashLink
            smooth
            to="/#products"
            className="block text-gray-700 hover:text-green-600 transition"
            onClick={closeMenu}
          >

            Products

          </HashLink>

          {/* CONTACT */}
          <HashLink
            smooth
            to="/#contact"
            className="block text-gray-700 hover:text-green-600 transition"
            onClick={closeMenu}
          >

            Contact

          </HashLink>

          {/* MY ORDERS */}
          {currentUser && (

            <Link
              to="/my-orders"
              className="block text-gray-700 hover:text-green-600 transition"
              onClick={closeMenu}
            >

              My Orders

            </Link>

          )}

          {/* MOBILE AUTH */}
          {!currentUser ? (

            <>

              {/* LOGIN */}
              <Link
                to="/login"
                className="block text-gray-700 hover:text-green-600 transition"
                onClick={closeMenu}
              >

                Login

              </Link>

              {/* SIGNUP */}
              <Link
                to="/signup"
                className="block bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl w-fit transition"
                onClick={closeMenu}
              >

                Signup

              </Link>

            </>

          ) : (

            <>

              {/* USER */}
              <div className="text-green-700 font-semibold">

                Hello,{" "}

                {currentUser.email
                  .split("@")[0]
                }

              </div>

              {/* LOGOUT */}
              <button
                onClick={() => {

                  handleLogout();

                  closeMenu();

                }}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl transition"
              >

                Logout

              </button>

            </>

          )}

          {/* CART */}
          <Link
            to="/cart"
            className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl w-fit transition"
            onClick={closeMenu}
          >

            <FaShoppingCart />

            Cart ({totalItems})

          </Link>

        </div>

      )}

    </nav>

  );
}

export default Navbar;