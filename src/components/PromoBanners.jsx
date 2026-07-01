import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const ROW1_BANNERS = [
  { id: 1, image: "/images/offers/aerial.jpeg" },
  { id: 2, image: "/images/offers/aerial 1.jpeg" },
  { id: 3, image: "/images/offers/aerial 2.jpeg" },
  { id: 4, image: "/images/offers/aerial 3.jpeg" },
  { id: 5, image: "/images/offers/fena.jpeg" },
  { id: 6, image: "/images/offers/ghadi.jpeg" },
];

const ROW2_BANNERS = [
  { id: 7, image: "/images/offers/beauty.jpeg" },
  { id: 8, image: "/images/offers/loncha.jpeg" },
  { id: 9, image: "/images/offers/material.jpeg" },
];

const ROW3_BANNERS = [
  { id: 10, image: "/images/offers/shampoo.jpeg" },
  { id: 11, image: "/images/offers/suhana.jpeg" },
  { id: 12, image: "/images/offers/tide.jpeg" },
];

const Row = ({ banners, direction = "left", speed = 3500 }) => {
  // Duplicate banners to allow for continuous scrolling illusion
  const duplicatedBanners = [...banners, ...banners, ...banners, ...banners];
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollInterval;
    
    const startScroll = () => {
      scrollInterval = setInterval(() => {
        const card = container.querySelector('[data-card]');
        if (!card) return;
        
        // Dynamic card width + gap (approx 16px to 24px)
        const gap = window.innerWidth >= 640 ? 24 : 16;
        const stepWidth = card.clientWidth + gap;
        
        if (direction === "left") {
          if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 20) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            container.scrollBy({ left: stepWidth, behavior: 'smooth' });
          }
        } else {
          if (container.scrollLeft <= 20) {
            // Instantly jump to near-end so we can scroll smoothly backwards
            container.scrollTo({ left: container.scrollWidth - container.clientWidth, behavior: 'auto' });
            setTimeout(() => {
              container.scrollBy({ left: -stepWidth, behavior: 'smooth' });
            }, 50);
          } else {
            container.scrollBy({ left: -stepWidth, behavior: 'smooth' });
          }
        }
      }, speed); // Autoscroll interval
    };

    startScroll();

    const stopScroll = () => clearInterval(scrollInterval);

    container.addEventListener('mouseenter', stopScroll);
    container.addEventListener('mouseleave', startScroll);
    container.addEventListener('touchstart', stopScroll, { passive: true });

    return () => {
      clearInterval(scrollInterval);
      container.removeEventListener('mouseenter', stopScroll);
      container.removeEventListener('mouseleave', startScroll);
      container.removeEventListener('touchstart', stopScroll);
    };
  }, [direction, speed]);

  useEffect(() => {
    if (direction === "right" && containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [direction]);

  return (
    <div className="mb-6 w-full overflow-hidden">
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 pl-4 sm:pl-6 pb-2 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {duplicatedBanners.map((banner, index) => (
          <div
            key={index}
            data-card
            className="relative w-[85vw] max-w-[800px] h-[350px] md:h-[500px] rounded-3xl overflow-hidden shadow-sm flex-shrink-0 bg-transparent transition-transform duration-300 group snap-center"
          >
            <img 
              src={banner.image} 
              alt="Special Offer"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

function PromoBanners() {
  const { t } = useTranslation();

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
            {t("home.promobanners.exclusive", "Exclusive")} <span className="text-green-600">{t("home.promobanners.offersDeals", "Offers & Deals")}</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("home.promobanners.subtitle", "Grab the best discounts on your favorite products today!")}
          </p>
        </motion.div>

        <Row banners={ROW1_BANNERS} direction="left" speed={3500} />
        <Row banners={ROW2_BANNERS} direction="right" speed={4000} />
        <Row banners={ROW3_BANNERS} direction="left" speed={4500} />
      </div>
    </section>
  );
}

export default PromoBanners;
