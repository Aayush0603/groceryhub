import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const BANNERS_DATA = [
  // Row 1
  { id: 1, text: "50% OFF Fresh Fruits", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&q=80", color: "from-orange-400 to-red-500" },
  { id: 2, text: "Buy 1 Get 1 Free on Dairy", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&q=80", color: "from-blue-400 to-indigo-500" },
  { id: 3, text: "Fresh Organic Vegetables", image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&q=80", color: "from-green-400 to-emerald-600" },
  { id: 4, text: "20% OFF on Snacks", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd08c?w=600&q=80", color: "from-yellow-400 to-orange-500" },
  // Row 2
  { id: 5, text: "Daily Essentials Combo", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80", color: "from-purple-400 to-pink-500" },
  { id: 6, text: "Super Saver Pack", image: "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=600&q=80", color: "from-teal-400 to-cyan-500" },
  { id: 7, text: "Weekend Special Deals", image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&q=80", color: "from-red-400 to-rose-500" },
  { id: 8, text: "Fresh Bakery Items", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80", color: "from-amber-400 to-yellow-600" },
  // Row 3
  { id: 9, text: "Premium Dry Fruits", image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?w=600&q=80", color: "from-stone-400 to-stone-600" },
  { id: 10, text: "Household Cleaning 30% OFF", image: "https://images.unsplash.com/photo-1584824486516-0555a07fc511?w=600&q=80", color: "from-sky-400 to-blue-500" },
  { id: 11, text: "Beverages & Drinks Combo", image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&q=80", color: "from-fuchsia-400 to-purple-600" },
  { id: 12, text: "Healthy Breakfast Range", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80", color: "from-lime-400 to-green-500" },
];

const Row = ({ banners, direction = "left", speed = 35 }) => {
  // We duplicate the banners array to allow for smooth infinite scrolling
  const duplicatedBanners = [...banners, ...banners, ...banners, ...banners];

  return (
    <div className="flex overflow-hidden w-full mb-6 py-2">
      <motion.div
        className="flex gap-6 pl-6 w-max"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
      >
        {duplicatedBanners.map((banner, index) => (
          <div
            key={index}
            className={`relative w-[280px] h-[160px] md:w-[400px] md:h-[220px] rounded-3xl overflow-hidden shadow-xl flex-shrink-0 bg-gradient-to-br ${banner.color} hover:scale-105 transition-transform duration-300 cursor-pointer`}
          >
            <div className="absolute inset-0 bg-black/30 mix-blend-multiply z-10" />
            <img 
              src={banner.image} 
              alt={banner.text}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-70"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center">
              <h3 className="text-white text-2xl md:text-3xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] whitespace-normal leading-tight">
                {banner.text}
              </h3>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

function PromoBanners() {
  const { t } = useTranslation();

  const row1 = BANNERS_DATA.slice(0, 4);
  const row2 = BANNERS_DATA.slice(4, 8);
  const row3 = BANNERS_DATA.slice(8, 12);

  return (
    <section className="py-16 bg-gradient-to-br from-white via-green-50 to-green-100 overflow-hidden">
      <div className="max-w-[100vw] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 px-6"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Exclusive <span className="text-green-600">Offers & Deals</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Grab the best discounts on your favorite products today!
          </p>
        </motion.div>

        <Row banners={row1} direction="left" speed={40} />
        <Row banners={row2} direction="right" speed={35} />
        <Row banners={row3} direction="left" speed={45} />
      </div>
    </section>
  );
}

export default PromoBanners;
