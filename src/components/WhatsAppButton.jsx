import { FaWhatsapp } from "react-icons/fa";

import { motion } from "framer-motion";

function WhatsAppButton() {

  const phoneNumber = "919172607711";

  const whatsappLink =
    `https://wa.me/${phoneNumber}`;

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.5,
        delay: 1,
      }}
      className="fixed bottom-6 right-6 z-50 group"
    >

      {/* TOOLTIP */}
      <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-2 rounded-xl text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none shadow-lg">

        Chat with us

      </div>

      {/* GLOW EFFECT */}
      <div className="absolute inset-0 rounded-full bg-green-500 blur-2xl opacity-40 animate-pulse"></div>

      {/* BUTTON */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-2xl hover:scale-110 transition duration-300"
      >

        <FaWhatsapp className="text-3xl md:text-4xl" />

      </a>

    </motion.div>
  );
}

export default WhatsAppButton;