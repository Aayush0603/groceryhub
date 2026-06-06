import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import ProductCard from "./ProductCard";

import { motion } from "framer-motion";

import {
  FaSearch,
  FaLeaf,
  FaMicrophone,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

function Products() {
  const { t, i18n } = useTranslation();

  // PRODUCTS STATE
  const [products, setProducts] =
    useState([]);

  // LOADING STATE
  const [loading, setLoading] =
    useState(true);

  // CATEGORY STATE
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  // SEARCH STATE
  const [searchTerm, setSearchTerm] =
    useState("");

  // VOICE SEARCH STATE
  const [isListening, setIsListening] =
  useState(false);

  // FETCH PRODUCTS
  useEffect(() => {

    const fetchProducts = async () => {

      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        let fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // AUTO-UPDATE MISSING IMAGES IN FIRESTORE & IN MEMORY
        const targetImages = {
          "milk 500 ml": "/images/milk_500ml.png",
          "sunflower oil": "/images/sunflower_oil.png",
          "mustard oil": "/images/mustard_oil.png",
          "milk 1l": "/images/milk_1l.png"
        };

        fetchedProducts = await Promise.all(fetchedProducts.map(async (item) => {
          const lowerName = item.name.trim().toLowerCase();
          if (targetImages[lowerName]) {
            const expectedUrl = targetImages[lowerName];
            if (!item.image || item.image.includes("placeholder") || item.image !== expectedUrl) {
              console.log(`Auto-updating ${item.name} image URL to ${expectedUrl}`);
              await updateDoc(doc(db, "products", item.id), {
                image: expectedUrl
              });
              return { ...item, image: expectedUrl };
            }
          }
          return item;
        }));

        setProducts(fetchedProducts);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }

    };

    fetchProducts();

  }, []);

  // CATEGORY LIST
  const categories = [
    "All",
    "Grains",
    "Fruits",
    "Dairy",
    "Oil",
    "Vegetables",
    "Snacks",
  ];

  // VOICE SEARCH
const startVoiceSearch = () => {

  // CHECK SUPPORT
  const SpeechRecognition =

    window.SpeechRecognition ||

    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {

    alert(
      "Voice search is not supported in this browser"
    );

    return;

  }

  // CREATE INSTANCE
  const recognition =
    new SpeechRecognition();

  // LANGUAGE
  recognition.lang = i18n.language === "hi" ? "hi-IN" : i18n.language === "mr" ? "mr-IN" : "en-IN";

  recognition.continuous =
    false;

  recognition.interimResults =
    false;

  // START LISTENING
  setIsListening(true);

  recognition.start();

  // RESULT
  recognition.onresult =
    (event) => {

      const transcript =
        event.results[0][0]
          .transcript;

      setSearchTerm(
        transcript
      );

      setIsListening(false);

    };

  // ERROR
  recognition.onerror =
    (event) => {

      console.error(event);

      setIsListening(false);

    };

  // END
  recognition.onend =
    () => {

      setIsListening(false);

    };

};

  // FILTER PRODUCTS
  const filteredProducts = products.filter(
    (product) => {

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      return (
        matchesCategory &&
        matchesSearch
      );

    }
  );

  // LOADING UI
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-3xl font-bold text-green-600">

        {t("productsSection.loading", "Loading Products...")}

      </div>

    );

  }

  return (

    <section
      id="products"
      className="py-12 bg-gradient-to-br from-white via-green-50 to-green-100 transition duration-500 overflow-hidden"
    >

      <div className="max-w-7xl mx-auto px-6">

        {/* TOP LABEL */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 bg-green-100 text-green-700 px-5 py-2 rounded-full font-semibold shadow-sm mb-4"
        >

          <FaLeaf />

          {t("productsSection.badge", "Fresh Grocery Collection")}

        </motion.div>

        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            {t("productsSection.explore", "Explore Our")}
            <span className="text-green-600">
              {t("productsSection.freshProducts", " Fresh Products")}
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-lg text-gray-600 leading-relaxed sm:leading-8">
            {t("productsSection.description", "Browse fresh vegetables, fruits, dairy, grains, snacks, and everyday essentials delivered directly to your doorstep.")}
          </p>
        </motion.div>

        {/* SEARCH BAR */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-2xl mx-auto mb-8 px-1"
        >
          {/* SEARCH ICON */}
          <FaSearch className="absolute top-1/2 left-6 -translate-y-1/2 text-gray-400 text-base sm:text-xl z-10" />

          {/* INPUT */}
          <input
            type="text"
            placeholder={t("productsSection.searchPlaceholder", "Search grocery products or use voice...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full shadow-lg py-3.5 sm:py-5 pl-12 sm:pl-16 pr-16 sm:pr-20 text-sm sm:text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
          />

          {/* MIC BUTTON */}
          <button
            onClick={startVoiceSearch}
            className={`absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md transition duration-300
            ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-green-600 hover:bg-green-700 hover:scale-105 text-white"
            }`}
          >
            <div title="Tap and speak product name" className="text-xs sm:text-base">
              <FaMicrophone />
            </div>
          </button>
        </motion.div>

        {/* CATEGORY FILTER BAR */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex overflow-x-auto gap-2.5 sm:gap-4 pb-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth items-center justify-start md:justify-center border-b border-gray-100/50"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-base font-semibold shadow-sm transition-all duration-300 border shrink-0
              ${
                selectedCategory === category
                  ? "bg-green-600 text-white border-green-600 shadow-green-200/50 hover:bg-green-700"
                  : "bg-white text-gray-600 hover:bg-green-50 border-gray-100 hover:border-green-200"
              }`}
            >
              {category === "All" ? t("productsSection.all", "All") : t(`products.categories.${category.toLowerCase()}`, category)}
            </button>
          ))}
        </motion.div>

        {/* PRODUCTS GRID */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
          className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-2 sm:gap-6"
        >

          {filteredProducts.map((product) => (

            <ProductCard
              key={product.id}
              product={product}
            />

          ))}

        </motion.div>

      </div>

    </section>
  );
}

export default Products;