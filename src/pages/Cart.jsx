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
          className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
              {t("cart.yourCart") || "Your Cart 🛒"}
            </h1>
            <p className="text-gray-500 mt-2 text-base md:text-lg">
              {t("cart.reviewItems") || "Review your selected items and checkout"}
            </p>
          </div>
          {cartItems.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearCart}
              className="mt-4 md:mt-0 flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-5 py-2.5 rounded-full transition-all duration-300 shadow-sm border border-red-100"
            >
              <FaTrash className="w-3.5 h-3.5" />
              {t("cart.clearCart") || "Clear Cart"}
            </motion.button>
          )}
        </motion.div>

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

              <Link to="/">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              
              {/* LEFT SIDE: ITEMS LIST */}
              <div className="lg:col-span-2 space-y-6">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      whileHover={{ y: -3 }}
                      className="group bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl p-4 sm:p-4.5 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-5 transition-all duration-300"
                    >
                      {/* ELEMENT 1: PRODUCT DISPLAY & TEXT */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="relative w-20 h-20 sm:w-22 sm:h-22 overflow-hidden rounded-2xl border border-gray-100 shadow-sm shrink-0 bg-green-50/30 flex items-center justify-center">
                          {!imageErrors[item.id] && item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-green-600 p-2">
                              <svg className="w-8 h-8 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.116 60.116 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center sm:text-left">
                          {/* Veg Logo & Product Name */}
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <span 
                              className="w-4 h-4 border border-green-600 flex items-center justify-center p-[2px] rounded-sm shrink-0 shadow-sm bg-white" 
                              title="100% Vegetarian Food Logo"
                            >
                              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                            </span>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                              {t(item.i18nKeyName) || item.name}
                            </h3>
                          </div>

                          {/* Category Badge & Unit Price */}
                          <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-1.5 flex-wrap">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 shadow-sm">
                              {t(item.i18nKeyCategory) || item.category}
                            </span>
                            <span className="text-sm font-semibold text-gray-500">
                              ₹{item.price} / {t("cart.unit") || "unit"}
                            </span>
                          </div>

                          {/* Subtext */}
                          <p className="text-xs text-gray-400 mt-1.5 italic font-medium">
                            {t("cart.premiumQuality") || "Premium quality grocery product"}
                          </p>
                        </div>
                      </div>

                      {/* ELEMENT 2: QUANTITY CONTROL PILL */}
                      <div className="flex items-center justify-center shrink-0">
                        <div className="flex items-center bg-gray-50 border border-gray-200/80 rounded-full p-1.5 shadow-inner select-none">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => decreaseQuantity(item.id)}
                            className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-white text-gray-600 hover:bg-gray-100 hover:text-red-500 shadow-sm border border-gray-100 font-bold text-lg transition-all"
                          >
                            -
                          </motion.button>
                          
                          <span className="w-10 text-center text-base font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => increaseQuantity(item.id)}
                            className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-white text-gray-600 hover:bg-gray-100 hover:text-green-600 shadow-sm border border-gray-100 font-bold text-lg transition-all"
                          >
                            +
                          </motion.button>
                        </div>
                      </div>

                      {/* ELEMENT 3: SUBTOTAL & ACTION */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full md:w-auto border-t border-gray-50 md:border-0 pt-3 md:pt-0 shrink-0">
                        <div className="text-right sm:text-right">
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                            {t("cart.subtotal") || "Subtotal"}
                          </p>
                          <p className="text-2xl font-extrabold text-green-700">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: "#fef2f2" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeProduct(item.id)}
                          className="w-11 h-11 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 border border-transparent hover:border-red-100 transition-all duration-300 shadow-none hover:shadow-md"
                          title={t("cart.remove") || "Remove"}
                        >
                          <FaTrash className="w-4 h-4" />
                        </motion.button>
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
                  className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-2xl p-8"
                >
                  <h2 className="text-3xl font-black text-gray-900 border-b border-gray-100 pb-5 mb-6">
                    {t("cart.orderSummary") || "Order Summary"}
                  </h2>

                  <div className="space-y-4">
                    {/* TOTAL ITEMS COUNT */}
                    <div className="flex justify-between items-center text-base">
                      <span className="text-gray-500 font-semibold">
                        {t("cart.totalItems") || "Total Items"}
                      </span>
                      <span className="text-lg font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                        {totalItems}
                      </span>
                    </div>

                    {/* DELIVERY INFO */}
                    <div className="flex justify-between items-center text-base border-b border-gray-50 pb-4">
                      <span className="text-gray-500 font-semibold">
                        Delivery
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                          {t("cart.freeDelivery") || "Free Delivery"}
                        </span>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">
                          {t("cart.freeDeliveryDesc") || "For all orders today"}
                        </p>
                      </div>
                    </div>

                    {/* TOTAL PRICE */}
                    <div className="flex justify-between items-end pt-2 pb-6">
                      <span className="text-lg text-gray-600 font-bold">
                        {t("cart.totalPrice") || "Total Price"}
                      </span>
                      <div className="text-right">
                        <span className="text-4xl font-black text-green-700 tracking-tight">
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
                      className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white py-4.5 rounded-2xl text-xl font-bold shadow-xl shadow-green-600/20 hover:shadow-green-700/30 transition-all duration-300 cursor-pointer"
                    >
                      {t("cart.proceedToCheckout") || "Proceed To Checkout"}
                      <FaArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </motion.div>

                {/* TRUST BADGES SECTION */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white/50 rounded-3xl border border-gray-100 shadow-md p-6 grid grid-cols-1 gap-4"
                >
                  {/* Badge 1: Fresh */}
                  <div className="flex items-start gap-4 p-3 bg-emerald-50/40 rounded-2xl border border-emerald-100/30">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                      <FaLeaf className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800">
                        {t("cart.badgeFresh") || "100% Fresh & Organic"}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {t("cart.badgeFreshDesc") || "Handpicked organic products"}
                      </p>
                    </div>
                  </div>

                  {/* Badge 2: Safe */}
                  <div className="flex items-start gap-4 p-3 bg-emerald-50/40 rounded-2xl border border-emerald-100/30">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                      <FaShieldAlt className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800">
                        {t("cart.badgeSafe") || "Safe & Hygienic"}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {t("cart.badgeSafeDesc") || "Contactless home delivery"}
                      </p>
                    </div>
                  </div>

                  {/* Badge 3: Secure */}
                  <div className="flex items-start gap-4 p-3 bg-emerald-50/40 rounded-2xl border border-emerald-100/30">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                      <FaLock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800">
                        {t("cart.badgeSecure") || "Secure Checkout"}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {t("cart.badgeSecureDesc") || "Razorpay & Encrypted payments"}
                      </p>
                    </div>
                  </div>
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