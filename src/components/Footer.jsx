import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaArrowUp,
} from "react-icons/fa";

import { motion } from "framer-motion";

import { HashLink } from "react-router-hash-link";

import { Link } from "react-router-dom";

function Footer() {

  // SCROLL TO TOP
  const scrollToTop = () => {

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };

  return (

    <footer className="bg-gradient-to-br from-green-900 via-green-950 to-black text-white pt-20 pb-10 relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600 opacity-20 blur-3xl rounded-full"></div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 pb-16 border-b border-white/10">

          {/* BRAND */}
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
          >

            <h1 className="text-4xl font-extrabold mb-6">

              <span className="text-green-400">

                Grocery

              </span>

              Hub

            </h1>

            <p className="text-gray-300 leading-8">

              Fresh groceries delivered
              directly to your doorstep
              with quality products and
              affordable pricing.

            </p>

          </motion.div>

          {/* QUICK LINKS */}
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
          >

            <h2 className="text-2xl font-bold mb-6">

              Quick Links

            </h2>

            <ul className="space-y-4 text-gray-300">

              {/* HOME */}
              <li>

                <Link
                  to="/"
                  className="hover:text-green-400 transition duration-300"
                >

                  Home

                </Link>

              </li>

              {/* PRODUCTS */}
              <li>

                <HashLink
                  smooth
                  to="/#products"
                  className="hover:text-green-400 transition duration-300"
                >

                  Products

                </HashLink>

              </li>

              {/* CONTACT */}
              <li>

                <HashLink
                  smooth
                  to="/#contact"
                  className="hover:text-green-400 transition duration-300"
                >

                  Contact

                </HashLink>

              </li>

              {/* CART */}
              <li>

                <Link
                  to="/cart"
                  className="hover:text-green-400 transition duration-300"
                >

                  Cart

                </Link>

              </li>

            </ul>

          </motion.div>

          {/* CONTACT INFO */}
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
            }}
          >

            <h2 className="text-2xl font-bold mb-6">

              Contact Info

            </h2>

            <div className="space-y-4 text-gray-300">

              <p>

                📍 Pune, Maharashtra

              </p>

              <p>

                📞 +91 9876543210

              </p>

              <p>

                ✉️ grocery@gmail.com

              </p>

              <p>

                🕒 8 AM - 10 PM

              </p>

            </div>

          </motion.div>

          {/* SOCIAL LINKS */}
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.9,
            }}
          >

            <h2 className="text-2xl font-bold mb-6">

              Follow Us

            </h2>

            <p className="text-gray-300 leading-7 mb-6">

              Stay connected with us
              on social media for latest
              offers and grocery updates.

            </p>

            {/* SOCIAL ICONS */}
            <div className="flex gap-5">

              <a
                href="#"
                className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl hover:bg-blue-500 transition duration-300 hover:scale-110"
              >

                <FaFacebook />

              </a>

              <a
                href="#"
                className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl hover:bg-pink-500 transition duration-300 hover:scale-110"
              >

                <FaInstagram />

              </a>

              <a
                href="#"
                className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl hover:bg-green-500 transition duration-300 hover:scale-110"
              >

                <FaWhatsapp />

              </a>

            </div>

          </motion.div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10">

          <p className="text-gray-400 text-center">

            © 2026 GroceryHub.
            All rights reserved.

          </p>

          {/* SCROLL TO TOP */}
          <button
            onClick={scrollToTop}
            className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition duration-300"
          >

            <FaArrowUp />

          </button>

        </div>

      </div>

    </footer>

  );
}

export default Footer;