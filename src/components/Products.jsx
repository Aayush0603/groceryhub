import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import ProductCard from "./ProductCard";

import { motion } from "framer-motion";

import {
  FaSearch,
  FaLeaf,
  FaMicrophone,
} from "react-icons/fa";

function Products() {

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

  // VOICE LANGUAGE
  const [voiceLanguage, setVoiceLanguage] =
  useState("en-IN");

  // FETCH PRODUCTS
  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const querySnapshot =
          await getDocs(
            collection(db, "products")
          );

        const fetchedProducts =
          querySnapshot.docs.map((doc) => ({

            id: doc.id,

            ...doc.data(),

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
  recognition.lang =
  voiceLanguage;

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

        Loading Products...

      </div>

    );

  }

  return (

    <section
      id="products"
      className="py-28 bg-gradient-to-br from-white via-green-50 to-green-100 transition duration-500 overflow-hidden"
    >

      <div className="max-w-7xl mx-auto px-6">

        {/* TOP LABEL */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 bg-green-100 text-green-700 px-5 py-2 rounded-full font-semibold shadow-sm mb-6"
        >

          <FaLeaf />

          Fresh Grocery Collection

        </motion.div>

        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-14"
        >

          <div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">

              Explore Our
              <span className="text-green-600">
                {" "}Fresh Products
              </span>

            </h1>

            <p className="mt-5 text-lg text-gray-600 max-w-2xl leading-8">

              Browse fresh vegetables,
              fruits, dairy, grains,
              snacks, and everyday essentials
              delivered directly to your doorstep.

            </p>

          </div>

          {/* PRODUCT COUNT */}
          <div className="bg-white backdrop-blur-xl rounded-3xl shadow-xl px-8 py-6 border border-gray-100">

            <h2 className="text-5xl font-extrabold text-green-700">

              {filteredProducts.length}

            </h2>

            <p className="text-gray-600 mt-2">

              Products Available

            </p>

          </div>

        </motion.div>


        {/* LANGUAGE SELECTOR */}
<div className="flex justify-center mb-6">

  <select
    value={voiceLanguage}
    onChange={(e) =>
      setVoiceLanguage(
        e.target.value
      )
    }
    className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-lg outline-none text-gray-700 font-semibold"
  >

    <option value="en-IN">
      English
    </option>

    <option value="hi-IN">
      हिंदी
    </option>

    <option value="mr-IN">
      मराठी
    </option>

  </select>

</div>

        {/* SEARCH BAR */}
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.8 }}
  className="relative max-w-2xl mx-auto mb-14"
>

  {/* SEARCH ICON */}
  <FaSearch className="absolute top-1/2 left-6 -translate-y-1/2 text-gray-400 text-xl z-10" />

  {/* INPUT */}
  <input
    type="text"
    placeholder="Search grocery products or use voice..."
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(
        e.target.value
      )
    }
    className="w-full bg-white border border-gray-200 rounded-3xl shadow-xl py-5 pl-16 pr-20 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
  />

  {/* MIC BUTTON */}
  <button
    onClick={
      startVoiceSearch
    }
    className={`absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition duration-300

    ${
      isListening

        ? "bg-red-500 text-white animate-pulse"

        : "bg-green-600 hover:bg-green-700 hover:scale-110 text-white"
    }`}
  >

    <div title="Tap and speak product name">

  <FaMicrophone />

</div>
  </button>

</motion.div>

        {/* CATEGORY BUTTONS */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap justify-center gap-5 mb-16"
        >

          {categories.map((category) => (

            <button
              key={category}
              onClick={() =>
                setSelectedCategory(category)
              }
              className={`px-7 py-3 rounded-2xl text-lg font-semibold shadow-lg transition duration-300
              ${
                selectedCategory === category
                  ? "bg-green-600 text-white scale-105"
                  : "bg-white text-gray-700 hover:bg-green-100"
              }`}
            >

              {category}

            </button>

          ))}

        </motion.div>

        {/* PRODUCTS GRID */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
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