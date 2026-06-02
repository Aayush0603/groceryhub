import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

function Contact() {
  const { t } = useTranslation();
  return (
    <section
      id="contact"
      className="py-12 bg-gradient-to-br from-green-100 via-white to-green-50 transition duration-500 overflow-hidden"
    >

      <div className="max-w-7xl mx-auto px-6">

        {/* TOP LABEL */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block bg-green-100 text-green-700 px-5 py-2 rounded-full font-semibold shadow-sm mb-4"
        >

          {t("contact.badge", "Contact Information")}

        </motion.div>

        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8"
        >

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900">

            {t("contact.getIn", "Get In")}
            <span className="text-green-600">
              {t("contact.touch", " Touch")}
            </span>

          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-8">

            {t("contact.description", "Have questions about products, delivery, or orders? Contact us anytime and we’ll help you quickly.")}

          </p>

        </motion.div>

        {/* CONTACT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* LOCATION */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white/80 backdrop-blur-xl border border-transparent rounded-3xl shadow-xl p-6 text-center transition-all duration-300 hover:shadow-2xl hover:border-green-500/80"
          >

            <div className="w-16 h-16 mx-auto bg-green-100 text-green-700 rounded-full flex items-center justify-center text-2xl mb-4">

              <FaMapMarkerAlt />

            </div>

            <h2 className="text-[22px] font-bold text-gray-800 mb-2.5">

              {t("contact.location", "Location")}

            </h2>

            <p className="text-gray-600 leading-relaxed">

              {t("contact.locationValue", "Pune, Maharashtra, India")}

            </p>

          </motion.div>

          {/* PHONE */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white/80 backdrop-blur-xl border border-transparent rounded-3xl shadow-xl p-6 text-center transition-all duration-300 hover:shadow-2xl hover:border-green-500/80"
          >

            <div className="w-16 h-16 mx-auto bg-green-100 text-green-700 rounded-full flex items-center justify-center text-2xl mb-4">

              <FaPhoneAlt />

            </div>

            <h2 className="text-[22px] font-bold text-gray-800 mb-2.5">

              {t("contact.phone", "Phone")}

            </h2>

            <p className="text-gray-600 leading-relaxed">

              +91 9172607711

            </p>

          </motion.div>

          {/* EMAIL */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white/80 backdrop-blur-xl border border-transparent rounded-3xl shadow-xl p-6 text-center transition-all duration-300 hover:shadow-2xl hover:border-green-500/80"
          >

            <div className="w-16 h-16 mx-auto bg-green-100 text-green-700 rounded-full flex items-center justify-center text-2xl mb-4">

              <FaEnvelope />

            </div>

            <h2 className="text-[22px] font-bold text-gray-800 mb-2.5">

              {t("contact.email", "Email")}

            </h2>

            <p className="text-gray-600 leading-relaxed break-words">

              grocery@gmail.com

            </p>

          </motion.div>

          {/* OPEN HOURS */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white/80 backdrop-blur-xl border border-transparent rounded-3xl shadow-xl p-6 text-center transition-all duration-300 hover:shadow-2xl hover:border-green-500/80"
          >

            <div className="w-16 h-16 mx-auto bg-green-100 text-green-700 rounded-full flex items-center justify-center text-2xl mb-4">

              <FaClock />

            </div>

            <h2 className="text-[22px] font-bold text-gray-800 mb-2.5">

              {t("contact.openHours", "Open Hours")}

            </h2>

            <p className="text-gray-600 leading-relaxed">

              {t("contact.daily", "Daily")} <br />

              {t("contact.time", "8 AM - 10 PM")}

            </p>

          </motion.div>

        </div>

      </div>

    </section>
  );
}

export default Contact;