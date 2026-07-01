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

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  const cardsData = [
    {
      id: "location",
      icon: <FaMapMarkerAlt />,
      title: t("contact.location", "Location"),
      value: (
        <div className="flex flex-col items-center">
          <span className="mb-2 text-center text-gray-700 leading-relaxed font-semibold">
            {t("contact.locationValue", "Market Yard, Mayani Road, Kanda Market, Dahiwadi")}
          </span>
          <a
            href="https://maps.app.goo.gl/7nZWvsK7vRGZRiKNA"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:text-amber-700 font-bold underline text-sm mt-1 inline-flex items-center gap-1.5 transition-colors duration-200 group/link"
          >
            <span>{t("contact.viewOnMap", "View on Map")}</span>
            <span className="group-hover/link:translate-x-0.5 transition-transform duration-200">🗺️</span>
          </a>
        </div>
      ),
      theme: {
        border: "border-t-4 border-t-amber-500 hover:border-amber-500/80 hover:shadow-amber-200/60",
        iconBg: "bg-amber-100 text-amber-600",
        glow: "shadow-amber-100/40",
      },
    },
    {
      id: "phone",
      icon: <FaPhoneAlt />,
      title: t("contact.phone", "Phone"),
      value: "+91 9172607711",
      theme: {
        border: "border-t-4 border-t-emerald-500 hover:border-emerald-500/80 hover:shadow-emerald-200/60",
        iconBg: "bg-emerald-100 text-emerald-600",
        glow: "shadow-emerald-100/40",
      },
    },

    {
      id: "hours",
      icon: <FaClock />,
      title: t("contact.openHours", "Open Hours"),
      value: (
        <>
          9 AM to 8 PM <br />
          Saturday Holiday
        </>
      ),
      theme: {
        border: "border-t-4 border-t-rose-500 hover:border-rose-500/80 hover:shadow-rose-200/60",
        iconBg: "bg-rose-100 text-rose-600",
        glow: "shadow-rose-100/40",
      },
    },
  ];

  return (
    <section
      id="contact"
      className="relative py-16 sm:py-24 bg-gradient-to-br from-slate-50 via-white to-green-50/30 overflow-hidden"
    >
      {/* BACKGROUND GLOW BLOBS */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* TOP LABEL */}
        <div className="text-center mb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 px-6 py-2 rounded-full text-xs sm:text-sm font-bold shadow-md tracking-wider uppercase border border-emerald-200/50"
          >
            {t("contact.badge", "Contact Information")}
          </motion.div>
        </div>

        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight">
            {t("contact.getIn", "Get In")}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500 font-black">
              {t("contact.touch", " Touch")}
            </span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t("contact.description", "Have questions about products, delivery, or orders? Contact us anytime and we’ll help you quickly.")}
          </p>
        </motion.div>

        {/* CONTACT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cardsData.map((card, i) => (
            <motion.div
              key={card.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl hover:shadow-2xl p-6 sm:p-8 text-center transition-all duration-300 flex flex-col items-center justify-center ${card.theme.border} ${card.theme.glow}`}
            >
              {/* ICON CONTAINER WITH ANIMATION */}
              <motion.div 
                whileHover={{ scale: 1.15, rotate: 5 }}
                className={`w-16 h-16 sm:w-20 sm:h-20 ${card.theme.iconBg} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 shadow-md transition-all duration-300`}
              >
                {card.icon}
              </motion.div>

              <h2 className="text-lg sm:text-xl font-extrabold text-gray-800 mb-2 sm:mb-3">
                {card.title}
              </h2>

              <div className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
                {card.value}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Contact;