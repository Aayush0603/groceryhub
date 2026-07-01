import { useContext, useState } from "react";
import { motion } from "framer-motion";
import {
  FaHeart,
  FaRegHeart,
  FaStar,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { CartContext } from "../context/CartContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { useTranslation } from "react-i18next";

function ProductCard({ product }) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
  } = useContext(CartContext);

  // FIND PRODUCT IN CART
  const cartItem = cartItems.find(
    (item) => item.id === product.id
  );

  // HANDLE ADD TO CART
  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error(t("productCard.outOfStockMsg", "Product is out of stock"));
      return;
    }
    addToCart(product);
  };

  // HANDLE INCREASE
  const handleIncrease = () => {
    if (cartItem.quantity >= product.stock) {
      toast.error(t("productCard.maxStockMsg", "Maximum stock reached"));
      return;
    }
    increaseQuantity(product.id);
  };

  // Mock data for the new UI elements
  const originalPrice = product.price ? Math.round(Number(product.price) * 1.1) : 0;
  const discount = "10% OFF on MRP";
  const weight = "200 g"; // Placeholder

  // Generate consistent pseudo-random values based on product ID string
  const hashCode = (str) => {
    let hash = 0;
    if (str) {
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash & hash;
      }
    }
    return Math.abs(hash);
  };
  
  const hash = hashCode(product.id || "default");
  const rating = (3.5 + (hash % 16) / 10).toFixed(1);
  const reviewsCount = 50 + (hash % 151);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 border border-gray-100 flex flex-col h-full w-full relative"
    >
      {/* WISHLIST HEART ICON */}
      <button 
        onClick={() => toggleFavorite(product)}
        className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm shadow-sm hover:bg-gray-100 transition"
      >
        {isFavorite(product.id) ? <FaHeart className="text-red-500 text-sm" /> : <FaRegHeart className="text-gray-400 text-sm" />}
      </button>

      {/* IMAGE CONTAINER */}
      <div className="relative overflow-hidden aspect-[4/3] bg-white flex items-center justify-center shrink-0 w-full p-2 border-b border-gray-50">
        {!imageError && product.image ? (
          <img
            src={product.image}
            alt={t(product.i18nKeyName) || product.name}
            className="w-full h-full object-contain hover:scale-105 transition duration-700"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-green-600 gap-1 p-2">
            <svg className="w-8 h-8 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.116 60.116 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
        )}

        {/* VEG ICON (Green Dot) */}
        <div className="absolute bottom-2 right-2 w-4 h-4 border border-green-600 bg-white flex items-center justify-center rounded-[2px] shadow-sm">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
        </div>

        {/* AD TAG / BADGE */}
        {product.stock <= 5 && product.stock > 0 && (
           <div className="absolute top-0 left-0 bg-teal-100 text-teal-800 px-2 py-0.5 text-[9px] font-extrabold rounded-br-lg">
             Few left
           </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-1.5 sm:p-2 flex flex-col flex-1 justify-between gap-1 bg-white text-left">
        
        {/* WEIGHT & ADD BUTTON ROW */}
        <div className="flex items-center justify-between mb-0.5 h-8">
          <span className="text-[10px] sm:text-xs font-bold text-gray-700">{weight}</span>
          
          <div className="w-[70px] shrink-0">
            {!cartItem ? (
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full flex flex-col items-center justify-center border rounded-md py-1 transition-all
                  ${product.stock === 0
                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "border-green-600 bg-green-50/50 hover:bg-green-100/50 text-green-700 shadow-sm"
                  }`}
              >
                <span className="font-extrabold text-[12px] leading-tight">
                  {product.stock === 0 ? "OUT" : "ADD"}
                </span>
              </button>
            ) : (
              <div className="w-full flex items-center justify-between bg-green-600 text-white rounded-md overflow-hidden shadow-sm h-[32px]">
                <button
                  onClick={() => decreaseQuantity(product.id)}
                  className="w-1/3 flex items-center justify-center font-bold hover:bg-green-700 transition"
                >
                  -
                </button>
                <span className="w-1/3 text-center text-[12px] font-bold">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={cartItem.quantity >= product.stock}
                  className={`w-1/3 flex items-center justify-center font-bold hover:bg-green-700 transition ${
                    cartItem.quantity >= product.stock ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PRICES */}
        <div className="flex items-end gap-1.5 leading-none mb-0.5 mt-1">
          <span className="text-base sm:text-lg font-black text-gray-900">₹{product.price}</span>
          <span className="text-[11px] sm:text-xs text-gray-500 line-through font-semibold mb-0.5">₹{originalPrice}</span>
        </div>

        {/* OFFERS */}
        <div className="text-[10px] sm:text-[11px] font-bold text-blue-600 leading-tight mb-0.5">
          {discount}
        </div>

        {/* PRODUCT NAME */}
        <h2 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-0" title={t(product.i18nKeyName) || product.name}>
          {t(product.i18nKeyName) || product.name}
        </h2>

        {/* BADGES / TAGS */}
        <div className="mt-auto pt-0.5">
          <span className="inline-block bg-orange-50 text-orange-800 border border-orange-100 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-sm mb-1">
            Premium Quality
          </span>
          
          {/* RATING */}
          <div className="flex items-center gap-1 mb-1">
            <div className="flex items-center bg-green-50 px-1 py-0.5 rounded-[3px] border border-green-100 gap-0.5">
              <span className="text-[10px] font-black text-green-700 leading-none">{rating}</span>
              <FaStar className="text-[9px] text-yellow-500" />
            </div>
            <span className="text-[10px] text-gray-500 font-medium">({reviewsCount})</span>
          </div>

          {/* DELIVERY TIME */}
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-gray-500 mt-0.5">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z"></path></svg>
            <span>10 mins</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default ProductCard;