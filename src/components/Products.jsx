import { useEffect, useState, useContext } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaLeaf,
  FaMicrophone,
  FaArrowRight,
  FaArrowLeft,
  FaShareAlt
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function Products() {
  const { t, i18n } = useTranslation();
  const { totalItems } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [topFilter, setTopFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("none");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        let fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

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

  const categories = [
    "All",
    "Grains",
    "Fruits",
    "Dairy",
    "Oil",
    "Vegetables",
    "Snacks",
  ];

  const GROCERY_CATEGORIES = [
    { name: "Vegetables", label: "Vegetables", image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=300&q=80", color: "bg-emerald-50" },
    { name: "Fruits", label: "Fruits", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&q=80", color: "bg-orange-50" },
    { name: "Grains", label: "Atta, Rice & Dal", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80", color: "bg-amber-50" },
    { name: "Oil", label: "Oil & Ghee", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80", color: "bg-yellow-50" },
    { name: "Dairy", label: "Dairy & Eggs", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&q=80", color: "bg-blue-50" },
  ];

  const SNACKS_CATEGORIES = [
    { name: "Snacks", label: "Chips & Namkeen", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd08c?w=300&q=80", color: "bg-red-50" },
  ];
  
  const SIDEBAR_CATEGORIES = [...GROCERY_CATEGORIES, ...SNACKS_CATEGORIES];

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language === "hi" ? "hi-IN" : i18n.language === "mr" ? "mr-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    setIsListening(true);
    recognition.start();
    recognition.onresult = (event) => {
      setSearchTerm(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = (event) => {
      console.error(event);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOption === "price_asc") return Number(a.price) - Number(b.price);
      if (sortOption === "price_desc") return Number(b.price) - Number(a.price);
      return 0;
    });

  const isCategoryView = selectedCategory === "All" && searchTerm === "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-3xl font-bold text-green-600">
        {t("productsSection.loading", "Loading Products...")}
      </div>
    );
  }

  return (
    <section id="products" className="py-4 bg-white transition duration-500 overflow-hidden min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* SEARCH BAR (Top Anchored, Only visible in Category View) */}
        {isCategoryView && (
          <div className="relative max-w-2xl mx-auto mb-3 px-1">
            <FaSearch className="absolute top-1/2 left-6 -translate-y-1/2 text-gray-400 text-base sm:text-xl z-10" />
            <input
              type="text"
              placeholder={t("productsSection.searchPlaceholder", "Search for atta, dal, coke and more")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl shadow-sm py-4 sm:py-5 pl-12 sm:pl-16 pr-16 sm:pr-20 text-sm sm:text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition duration-300"
            />
            <button
              onClick={startVoiceSearch}
              className={`absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition duration-300 ${
                isListening ? "bg-red-100 text-red-600 animate-pulse" : "text-gray-500 hover:text-green-600 hover:bg-green-50"
              }`}
            >
              <FaMicrophone className="text-lg" />
            </button>
          </div>
        )}

        {/* HORIZONTAL CATEGORY FILTER BAR (Only visible in Category View) */}
        {isCategoryView && (
          <div className="flex overflow-x-auto gap-5 pb-1 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth items-center justify-start md:justify-center border-b border-gray-100/80" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setTopFilter(category)}
                className={`flex flex-col items-center justify-center min-w-auto px-1 pb-2 border-b-2 transition-all duration-300 ${
                  topFilter === category
                    ? "border-green-600 text-green-700 font-extrabold"
                    : "border-transparent text-gray-500 hover:text-gray-800 font-semibold"
                }`}
              >
                <span className="text-[13px] sm:text-sm text-center">
                  {category === "All" ? t("productsSection.all", "All") : t(`products.categories.${category.toLowerCase()}`, category)}
                </span>
              </button>
            ))}
          </div>
        )}

        {isCategoryView ? (
          /* CATEGORY SECTIONS VIEW */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            
            {/* GROCERY & KITCHEN */}
            {(topFilter === "All" || GROCERY_CATEGORIES.some(c => c.name === topFilter)) && (
              <div className="mb-6 mt-4">
                <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-3 px-1">Grocery & Kitchen</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-6">
                  {GROCERY_CATEGORIES.filter(c => topFilter === "All" || c.name === topFilter).map((cat, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelectedCategory(cat.name); setSearchTerm(""); }}
                      className={`rounded-2xl cursor-pointer overflow-hidden flex flex-col h-full ${cat.color} border border-black/5 hover:shadow-md transition-all`}
                    >
                      <div className="w-full aspect-[4/3] p-2 pb-0 flex items-center justify-center">
                      <img src={cat.image} alt={cat.label} className="w-full h-full object-contain rounded-xl mix-blend-multiply" />
                    </div>
                    <div className="p-2 sm:p-3 text-center bg-white/40 backdrop-blur-sm mt-auto border-t border-black/5">
                      <h3 className="text-[11px] sm:text-sm font-bold text-gray-800 leading-tight">
                        {cat.label}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            )}

            {/* SNACKS & DRINKS */}
            {(topFilter === "All" || SNACKS_CATEGORIES.some(c => c.name === topFilter)) && (
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-3 px-1">Snacks & Drinks</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-6">
                  {SNACKS_CATEGORIES.filter(c => topFilter === "All" || c.name === topFilter).map((cat, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelectedCategory(cat.name); setSearchTerm(""); }}
                      className={`rounded-2xl cursor-pointer overflow-hidden flex flex-col h-full ${cat.color} border border-black/5 hover:shadow-md transition-all`}
                    >
                      <div className="w-full aspect-[4/3] p-2 pb-0 flex items-center justify-center">
                      <img src={cat.image} alt={cat.label} className="w-full h-full object-contain rounded-xl mix-blend-multiply" />
                    </div>
                    <div className="p-2 sm:p-3 text-center bg-white/40 backdrop-blur-sm mt-auto border-t border-black/5">
                      <h3 className="text-[11px] sm:text-sm font-bold text-gray-800 leading-tight">
                        {cat.label}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            )}

          </motion.div>
        ) : (
          /* PRODUCT LISTING VIEW (SPLIT LAYOUT) */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-start w-full gap-3 md:gap-5">
            
            {/* LEFT SIDEBAR CATEGORIES */}
            <div className="w-[72px] sm:w-24 shrink-0 flex flex-col gap-0.5 py-1 border-r border-gray-100 min-h-[500px]">
              {SIDEBAR_CATEGORIES.map(cat => (
                <button 
                  key={cat.name} 
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex flex-col items-center justify-center w-full py-3 sm:py-4 border-l-4 transition-all ${
                    selectedCategory === cat.name 
                    ? 'border-green-600 bg-green-50/30' 
                    : 'border-transparent opacity-70 hover:opacity-100 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${cat.color} flex items-center justify-center overflow-hidden mb-2 shadow-sm`}>
                    <img src={cat.image} alt={cat.label} className="w-8 h-8 sm:w-10 sm:h-10 object-contain mix-blend-multiply" />
                  </div>
                  <span className={`text-[10px] sm:text-[12px] text-center leading-tight px-1 ${
                    selectedCategory === cat.name ? 'font-black text-gray-900' : 'font-medium text-gray-600'
                  }`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0 py-2">
              
              {/* TOP HEADER */}
              <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                    }} 
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                  >
                    <FaArrowLeft className="text-gray-700" />
                  </button>
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-tight">
                      {searchTerm !== "" ? `Search Results` : `${SIDEBAR_CATEGORIES.find(c => c.name === selectedCategory)?.label || selectedCategory}`}
                    </h2>
                    <p className="text-[10px] text-green-700 font-bold hidden sm:block">Delivering to Home</p>
                  </div>
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 transition">
                    <FaSearch className="text-sm" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 transition">
                    <FaShareAlt className="text-sm" />
                  </button>
                </div>
              </div>

              {/* FILTERS ROW */}
              <div className="flex overflow-x-auto gap-2 pb-3 mb-2 scroll-smooth" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                <button className="text-[11px] sm:text-xs font-semibold border border-gray-200 rounded-lg px-2.5 sm:px-3 py-1.5 bg-white text-gray-700 whitespace-nowrap shadow-sm hover:bg-gray-50 transition">
                  <span className="flex items-center gap-1">
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    Filters
                  </span>
                </button>
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)} 
                  className="text-[11px] sm:text-xs font-semibold border border-gray-200 rounded-lg px-2.5 sm:px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-green-500 shadow-sm transition appearance-none cursor-pointer w-[90px] sm:w-[105px] text-ellipsis overflow-hidden"
                >
                  <option value="none">↑↓ Sort</option>
                  <option value="price_asc">Low to High</option>
                  <option value="price_desc">High to Low</option>
                </select>
                <button className="text-[11px] sm:text-xs font-semibold border border-gray-200 rounded-lg px-2.5 sm:px-3 py-1.5 bg-white text-gray-700 whitespace-nowrap shadow-sm hover:bg-gray-50 transition">
                  Brand
                </button>
              </div>

              {/* PRODUCTS GRID */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedCategory + searchTerm} 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                      <p className="text-lg font-bold">No products found.</p>
                      <button onClick={() => {setSearchTerm(""); setSelectedCategory("All");}} className="mt-4 text-green-600 font-bold hover:underline">
                        Back to Categories
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5 pb-20 w-full">
                      {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </motion.div>
        )}

        {/* GO TO CART POPUP */}
        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
            >
              <Link to="/cart">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 bg-green-600 text-white px-6 py-3.5 rounded-full font-extrabold shadow-[0_0_20px_rgba(34,197,94,0.6)] border-2 border-green-400 hover:bg-green-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.8)] transition-all duration-300 group"
                >
                  <span className="text-sm sm:text-base">{t("productsSection.goToCart", "Go to Cart")}</span>
                  <span className="bg-white text-green-600 px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm shadow-inner">{totalItems}</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="text-white group-hover:text-green-100"
                  >
                    <FaArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}

export default Products;