import { motion } from "framer-motion";

function Loader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col items-center justify-center z-[9999] overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute w-96 h-96 bg-green-300 opacity-30 blur-3xl rounded-full"></div>

      {/* ANIMATED LOGO */}
      <motion.div
        initial={{
          scale: 0.5,
          opacity: 0,
          rotate: -180,
        }}
        animate={{
          scale: 1,
          opacity: 1,
          rotate: 0,
        }}
        transition={{
          duration: 1,
        }}
        className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl bg-white"
      >

        <img src="/images/logo.jpeg" alt="Gandhi Trading Co." className="w-full h-full rounded-full object-cover" />

      </motion.div>

      {/* BRAND NAME */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.4,
          duration: 0.8,
        }}
        className="mt-8 text-4xl font-extrabold text-gray-900"
      >

        GandhiBazaar

      </motion.h2>

      {/* SUBTEXT */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 0.8,
          duration: 0.8,
        }}
        className="mt-4 text-lg text-gray-600"
      >

        Fresh groceries delivered fast 🚚

      </motion.p>

      {/* LOADING DOTS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 1,
        }}
        className="flex gap-3 mt-8"
      >

        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>

        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-150"></div>

        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-300"></div>

      </motion.div>

    </div>
  );
}

export default Loader;