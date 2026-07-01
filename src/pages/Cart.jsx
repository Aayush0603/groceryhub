import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaTrash,
  FaLeaf,
  FaShieldAlt,
  FaLock,
  FaArrowRight,
  FaShoppingBag,
} from "react-icons/fa";
import { CartContext } from "../context/CartContext";

function Cart() {
  const { t } = useTranslation();
  const [imageErrors, setImageErrors] = useState({});

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeProduct,
    clearCart,
    totalItems,
    totalPrice,
  } = useContext(CartContext);

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-emerald-50/30 pt-28 pb-16 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col border-b border-gray-100 pb-2.5 mb-2.5 gap-0.5"
        >
          <div className="flex flex-row items-center justify-between">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2 md:gap-3">
              {t("cart.yourCart") || "Your Cart 🛒"}
            </h1>
            {cartItems.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearCart}
                className="flex items-center justify-center gap-2 text-sm md:text-[16px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-4 md:px-6 py-2.5 md:py-3 rounded-full transition-all duration-300 shadow-sm border border-red-100 shrink-0 cursor-pointer"
              >
                <FaTrash className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {t("cart.clearCart") || "Clear Cart"}
              </motion.button>
            )}
          </div>
          <p className="text-gray-500 text-sm md:text-lg mt-0.5">
            {t("cart.reviewItems") || "Review your selected items and checkout"}
          </p>
        </motion.div>

        {/* TRUST BADGES SECTION (SYMBOLIC ONLY - CENTER ALIGNED) */}
        {cartItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-4 px-1"
          >
            <div className="flex items-center justify-center text-emerald-700 bg-emerald-50/50 p-2.5 rounded-full border border-emerald-100/80 shadow-sm hover:scale-105 transition duration-200" title={t("cart.badgeFresh") || "100% Fresh"}>
              <FaLeaf className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-center text-emerald-700 bg-emerald-50/50 p-2.5 rounded-full border border-emerald-100/80 shadow-sm hover:scale-105 transition duration-200" title={t("cart.badgeSafe") || "Safe & Hygienic"}>
              <FaShieldAlt className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-center text-emerald-700 bg-emerald-50/50 p-2.5 rounded-full border border-emerald-100/80 shadow-sm hover:scale-105 transition duration-200" title={t("cart.badgeSecure") || "Secure Checkout"}>
              <FaLock className="w-4 h-4" />
            </div>
          </motion.div>
        )}

        {/* MAIN BODY */}
        <AnimatePresence mode="wait">
          {cartItems.length === 0 ? (
            
            /* EMPTY STATE CARD */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-2xl p-12 md:p-20 text-center max-w-2xl mx-auto flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-8 border border-green-100 shadow-inner"
              >
                <FaShoppingBag className="w-10 h-10" />
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                {t("cart.emptyCartTitle") || "Your Cart is Empty"}
              </h2>
              
              <p className="text-gray-500 text-lg mb-8 max-w-md">
                {t("cart.emptyCartDesc") || "Add fresh grocery products to start shopping."}
              </p>

              <Link to="/products">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg shadow-green-600/20 hover:shadow-green-700/30 transition-all duration-300"
                >
                  {t("hero.shopNow") || "Shop Now"}
                  <FaArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </motion.div>

          ) : (

            /* GRID CONTENT */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
              
              {/* LEFT SIDE: ITEMS LIST */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      whileHover={{ y: -2 }}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md p-2.5 sm:p-3 flex flex-row items-center gap-3 sm:gap-4 transition-all duration-300 relative"
                    >
                      {/* PRODUCT IMAGE */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-xl border border-gray-100 shadow-sm shrink-0 bg-green-50/30 flex items-center justify-center">
                        {!imageErrors[item.id] && item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-green-600 p-2">
                            <svg className="w-5 h-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.116 60.116 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* PRODUCT DETAILS */}
                      <div className="flex-1 min-w-0 flex flex-row items-center justify-between gap-2 h-16 sm:h-20">
                        
                        {/* Name & Unit Price */}
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border border-green-600 flex items-center justify-center p-[1px] rounded-sm shrink-0 bg-white">
                              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                              {t(item.i18nKeyName) || item.name}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-100">
                              {t(item.i18nKeyCategory) || item.category}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 font-medium">
                              ₹{item.price}/{t("cart.unit") || "unit"}
                            </span>
                          </div>
                        </div>

                        {/* Quantity, Subtotal & Remove */}
                        <div className="flex flex-col items-end justify-center gap-2 shrink-0">
                          <div className="flex items-center gap-3">
                            <p className="text-base sm:text-lg font-extrabold text-gray-900">
                              ₹{item.price * item.quantity}
                            </p>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => removeProduct(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                              title={t("cart.remove") || "Remove"}
                            >
                              <FaTrash className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                          
                          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5 shadow-sm h-7 sm:h-8">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => decreaseQuantity(item.id)}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-white text-gray-600 hover:text-red-500 rounded-md font-bold text-sm shadow-sm border border-gray-100"
                            >
                              -
                            </motion.button>
                            
                            <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => increaseQuantity(item.id)}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-white text-gray-600 hover:text-green-600 rounded-md font-bold text-sm shadow-sm border border-gray-100"
                            >
                              +
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* RIGHT SIDE: ORDER SUMMARY */}
              <div className="space-y-6 sticky top-28">
                
                {/* GLASS SUMMARY BOX */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-2xl p-4 md:p-5"
                >
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 border-b border-gray-100 pb-3 mb-3">
                    {t("cart.orderSummary") || "Order Summary"}
                  </h2>

                  <div className="space-y-3">
                    {/* TOTAL ITEMS COUNT */}
                    <div className="flex justify-between items-center text-base md:text-lg">
                      <span className="text-gray-500 font-semibold">
                        {t("cart.totalItems") || "Total Items"}
                      </span>
                      <span className="text-base md:text-lg font-bold text-gray-800 bg-gray-50 px-2.5 py-0.5 rounded-lg border border-gray-100">
                        {totalItems}
                      </span>
                    </div>

                    {/* DELIVERY INFO */}
                    <div className="flex justify-between items-center text-base md:text-lg border-b border-gray-50 pb-2.5">
                      <span className="text-gray-500 font-semibold">
                        Delivery
                      </span>
                      <div className="text-right">
                        <span className="text-xs md:text-sm font-extrabold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                          Free Delivery (0-3km)
                        </span>
                        <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-0.5">
                          ₹15/km beyond 3km (Max 7km)
                        </p>
                      </div>
                    </div>

                    {/* TOTAL PRICE */}
                    <div className="flex justify-between items-end pt-1 pb-3">
                      <span className="text-lg md:text-xl text-gray-600 font-bold">
                        {t("cart.totalPrice") || "Total Price"}
                      </span>
                      <div className="text-right">
                        <span className="text-3xl md:text-4xl font-black text-green-700 tracking-tight">
                          ₹{totalPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CHECKOUT BTN */}
                  <Link to="/checkout" className="block w-full">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl md:rounded-2xl text-lg font-bold shadow-lg shadow-green-600/20 hover:shadow-green-700/30 transition-all duration-300 cursor-pointer"
                    >
                      {t("cart.proceedToCheckout") || "Proceed To Checkout"}
                      <FaArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default Cart;