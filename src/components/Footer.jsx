import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaArrowUp,
} from "react-icons/fa";

import { motion } from "framer-motion";

import { HashLink } from "react-router-hash-link";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();

  // SCROLL TO TOP
  const scrollToTop = () => {

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };

  return (

    <footer className="bg-gradient-to-br from-green-900 via-green-950 to-black text-white pt-12 pb-8 relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600 opacity-20 blur-3xl rounded-full"></div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 pb-6 border-b border-white/10">

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

            <h1 className="text-4xl font-extrabold mb-4">

              <span className="text-green-400">

                Gandhi

              </span>

              Bazaar

            </h1>

            <p className="text-gray-300 leading-7">

              {t("footer.description", "Fresh groceries delivered directly to your doorstep with quality products and affordable pricing.")}

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

            <h2 className="text-2xl font-bold mb-4">

              {t("footer.quickLinks", "Quick Links")}

            </h2>

            <ul className="space-y-2 text-gray-300">

              {/* HOME */}
              <li>

                <Link
                  to="/"
                  className="hover:text-green-400 transition duration-300"
                >

                  {t("nav.home", "Home")}

                </Link>

              </li>

              {/* PRODUCTS */}
              <li>

                <Link
                  to="/products"
                  className="hover:text-green-400 transition duration-300"
                >

                  {t("nav.products", "Products")}

                </Link>

              </li>

              {/* CONTACT */}
              <li>

                <HashLink
                  smooth
                  to="/#contact"
                  className="hover:text-green-400 transition duration-300"
                >

                  {t("nav.contact", "Contact")}

                </HashLink>

              </li>

              {/* CART */}
              <li>

                <Link
                  to="/cart"
                  className="hover:text-green-400 transition duration-300"
                >

                  {t("nav.cart", "Cart")}

                </Link>

              </li>

            </ul>

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

            <h2 className="text-2xl font-bold mb-4">

              {t("footer.followUs", "Follow Us")}

            </h2>

            <p className="text-gray-300 leading-7 mb-4">

              {t("footer.followDescription", "Stay connected with us on social media for latest offers and grocery updates.")}

            </p>

            {/* SOCIAL ICONS */}
            <div className="flex gap-5">

              <a
                href="#"
                className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition duration-300 hover:scale-110"
              >

                <FaFacebook />

              </a>

              <a
                href="https://www.instagram.com/gandhitradingc?igsh=Y2x5OWlqYzAwbHg2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl text-[#E1306C] hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white transition duration-300 hover:scale-110"
              >

                <FaInstagram />

              </a>

              <a
                href="#"
                className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl text-[#25D366] hover:bg-[#25D366] hover:text-white transition duration-300 hover:scale-110"
              >

                <FaWhatsapp />

              </a>

            </div>

          </motion.div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6">

          <p className="text-gray-400 text-center">

            {t("footer.rights", "© 2026 GandhiBazaar. All rights reserved.")}

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