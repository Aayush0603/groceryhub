import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Hero() {
  const { t } = useTranslation();

  const galleryItems = [
    {
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
      label: "Fresh Vegetables 🌿",
    },
    {
      image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80",
      label: "Organic Fruits 🍎",
    },
    {
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80",
      label: "Supermarket Aisles 🛒",
    },
    {
      image: "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&w=600&q=80",
      label: "Daily Essentials 🥛",
    },
  ];

  const [order, setOrder] = useState([0, 1, 2, 3]);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setOrder((prev) => {
      const next = [...prev];
      const first = next.shift();
      next.push(first);
      return next;
    });
  };

  const handleCardClick = (index) => {
    if (order[0] !== index) {
      handleNext();
    }
  };

  return (
    <section className="min-h-[70vh] bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-center">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{
            opacity: 0,
            x: -80,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
          }}
        >
          {/* BADGE */}
          <div className="inline-block bg-green-100 text-green-700 px-5 py-2 rounded-full text-sm font-semibold mb-4 shadow-sm">
            {t("hero.badge", "Fresh Grocery Delivery 🚚")}
          </div>

          {/* HEADING */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            {t("hero.heading1", "Fresh Food")}
            <span className="text-green-600">
              {t("hero.heading2", " Delivered ")}
            </span>
            {t("hero.heading3", "To Your Doorstep")}
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-4 text-lg text-gray-600 leading-8 max-w-2xl">
            {t("hero.description", "Order fresh vegetables, fruits, dairy products, snacks, and all your daily grocery essentials directly from your trusted local grocery store.")}
          </p>

          {/* BUTTONS */}
          <div className="mt-6 flex flex-wrap gap-5">
            {/* SHOP NOW */}
            <Link
              to="/products"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:scale-105 transition duration-300"
            >
              {t("hero.shopNow", "Shop Now")}
            </Link>

            {/* CONTACT BUTTON */}
            <HashLink
              smooth
              to="/#contact"
              className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-8 py-4 rounded-2xl text-lg font-semibold shadow-md hover:scale-105 transition duration-300"
            >
              {t("hero.contactUs", "Contact Us")}
            </HashLink>
          </div>


        </motion.div>

        {/* RIGHT IMAGE GALLERY */}
        <div className="relative flex items-center justify-center w-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[580px] px-6">
          {/* GLOW EFFECT */}
          <div className="absolute -top-10 -left-10 w-80 h-80 bg-green-300 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

          <div className="relative w-full max-w-[380px] sm:max-w-[460px] md:max-w-[520px] aspect-[4/5] sm:aspect-square">
            {order.map((itemIdx, position) => {
              let xOffset = "0%";
              let yOffset = 0;
              let scale = 1;
              let opacity = 1;
              let zIndex = 30;
              let rotateY = 0;

              if (position === 0) { // Center
                xOffset = "0%";
                scale = 1;
                opacity = 1;
                zIndex = 30;
                rotateY = 0;
              } else if (position === 1) { // Right
                xOffset = "45%";
                scale = 0.8;
                opacity = 0.6;
                zIndex = 20;
                rotateY = -15;
              } else if (position === order.length - 1) { // Left
                xOffset = "-45%";
                scale = 0.8;
                opacity = 0.6;
                zIndex = 20;
                rotateY = 15;
              } else { // Hidden (Back)
                xOffset = "0%";
                scale = 0.5;
                opacity = 0;
                zIndex = 10;
                rotateY = 0;
              }

              const item = galleryItems[itemIdx];

              return (
                <motion.div
                  key={itemIdx}
                  layout
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{
                    x: xOffset,
                    y: yOffset,
                    scale,
                    opacity,
                    zIndex,
                    rotateY,
                  }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 25,
                  }}
                  onClick={() => handleCardClick(itemIdx)}
                  className="absolute top-[10%] left-[10%] w-[80%] h-[80%] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white cursor-pointer select-none"
                  style={{
                    transformOrigin: "center center",
                    perspective: 1000,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-full h-full object-cover pointer-events-none"
                  />

                  {/* LABEL BADGE */}
                  <div
                    className={`absolute bottom-5 left-5 right-5 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-white font-bold text-sm sm:text-base text-center transition-all duration-300 ${position === 0
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3"
                      }`}
                  >
                    {item.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;