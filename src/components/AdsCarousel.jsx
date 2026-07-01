import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ADS_DATA = [
  {
    id: 1,
    titleKey: "home.ads.ad1Title",
    defaultTitle: "Weekend Hair Makeover",
    subtitleKey: "home.ads.ad1Subtitle",
    defaultSubtitle: "Powered by: L'ORÉAL PARIS",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500&q=80",
    bgColor: "bg-[#EAE4F2]",
    textColor: "text-gray-900",
    buttonKey: "home.ads.shopNow",
    defaultButton: "Shop now",
  },
  {
    id: 2,
    titleKey: "home.ads.ad2Title",
    defaultTitle: "Get 50% Off on Groceries",
    subtitleKey: "home.ads.ad2Subtitle",
    defaultSubtitle: "Limited Time Offer",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80",
    bgColor: "bg-[#1C1C1C]",
    textColor: "text-white",
    buttonKey: "home.ads.explore",
    defaultButton: "Explore",
  },
  {
    id: 3,
    titleKey: "home.ads.ad3Title",
    defaultTitle: "Fresh Fruits Everyday",
    subtitleKey: "home.ads.ad3Subtitle",
    defaultSubtitle: "Farm to your doorstep",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&q=80",
    bgColor: "bg-[#F3EFE9]",
    textColor: "text-gray-900",
    buttonKey: "home.ads.shopNow",
    defaultButton: "Shop now",
  }
];

function AdsCarousel() {
  const { t } = useTranslation();
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

        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 20) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: stepWidth, behavior: 'smooth' });
        }
      }, 3500); // Autoscroll every 3.5 seconds
    };

    startScroll();

    const stopScroll = () => clearInterval(scrollInterval);

    container.addEventListener('mouseenter', stopScroll);
    container.addEventListener('mouseleave', startScroll);
    // Support touch devices
    container.addEventListener('touchstart', stopScroll, { passive: true });

    return () => {
      clearInterval(scrollInterval);
      container.removeEventListener('mouseenter', stopScroll);
      container.removeEventListener('mouseleave', startScroll);
      container.removeEventListener('touchstart', stopScroll);
    };
  }, []);

  return (
    <div className="mb-10 w-full overflow-hidden">
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1 pt-1"
      >
        {ADS_DATA.map((ad) => (
          <motion.div
            key={ad.id}
            data-card
            whileHover={{ scale: 1.02 }}
            className={`min-w-[280px] sm:min-w-[450px] md:min-w-[500px] h-44 sm:h-56 rounded-[2rem] snap-center shrink-0 ${ad.bgColor} flex overflow-hidden shadow-sm border border-black/5 relative cursor-pointer group`}
          >
            {/* Content */}
            <div className="w-[55%] p-5 sm:p-8 flex flex-col justify-center h-full z-10 relative">
              <h2 className={`text-xl sm:text-2xl md:text-3xl font-black ${ad.textColor} leading-tight mb-2 sm:mb-3`}>
                {t(ad.titleKey, ad.defaultTitle)}
              </h2>
              <p className={`text-[11px] sm:text-sm font-semibold ${ad.textColor} opacity-80 mb-4 sm:mb-6`}>
                {t(ad.subtitleKey, ad.defaultSubtitle)}
              </p>
              <button className={`${ad.textColor === 'text-white' ? 'bg-white text-black hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'} text-[11px] sm:text-sm font-bold py-2 sm:py-2.5 px-4 sm:px-6 rounded-xl w-max transition-colors shadow-md`}>
                {t(ad.buttonKey, ad.defaultButton)}
              </button>
            </div>

            {/* Image Box */}
            <div className="w-[45%] h-full absolute right-0 top-0 overflow-hidden">
              <img src={ad.image} alt={ad.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent mix-blend-overlay"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AdsCarousel;
