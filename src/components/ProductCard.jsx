import { useContext, useState } from "react";
import { motion } from "framer-motion";
import {
  FaShoppingCart,
  FaStar,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { CartContext } from "../context/CartContext";
import { useTranslation } from "react-i18next";

function ProductCard({ product }) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
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

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-500 border border-gray-100 flex flex-col h-full"
    >
      {/* IMAGE */}
      <div className="relative overflow-hidden aspect-[4/3] bg-green-50/30 flex items-center justify-center shrink-0 w-full">
        {!imageError && product.image ? (
          <img
            src={product.image}
            alt={t(product.i18nKeyName) || product.name}
            className="w-full h-full object-cover hover:scale-105 transition duration-700"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-green-600 gap-1.5 p-4">
            <svg className="w-10 h-10 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.116 60.116 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-60">GroceryHub</span>
          </div>
        )}

        {/* BADGE */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-green-700 shadow-sm border border-green-50">
          {t("productCard.fresh", "Fresh")}
        </div>

        {/* STOCK STATUS */}
        <div className="absolute top-3 right-3">
          {product.stock === 0 ? (
            <div className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
              {t("productCard.outOfStock", "Out")}
            </div>
          ) : product.stock <= 5 ? (
            <div className="bg-yellow-400/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
              {product.stock} Left
            </div>
          ) : (
            <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
              {t("productCard.inStock", "In Stock")}
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-white">
        <div>
          {/* PRODUCT NAME */}
          <h2 className="text-sm sm:text-base font-bold text-gray-800 line-clamp-1 text-center" title={t(product.i18nKeyName) || product.name}>
            {t(product.i18nKeyName) || product.name}
          </h2>

          {/* PRICE + RATING */}
          <div className="flex justify-between items-center mt-2">
            <h3 className="text-base sm:text-lg font-extrabold text-green-700">
              ₹{product.price}
            </h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full text-yellow-600 text-[10px] font-bold border border-yellow-100">
              <FaStar className="w-3 h-3 text-yellow-500" />
              4.9
            </div>
          </div>
        </div>

        {/* ADD TO CART BUTTON */}
        {!cartItem && (
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all duration-300
            ${
              product.stock === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white hover:shadow"
            }`}
          >
            <FaShoppingCart className="w-3 h-3" />
            {product.stock === 0
              ? t("productCard.outOfStock", "Out of Stock")
              : t("productCard.addToCart", "Add To Cart")}
          </button>
        )}

        {/* QUANTITY CONTROLS */}
        {cartItem && (
          <div className="flex items-center justify-center gap-4 py-0.5">
            <button
              onClick={() => decreaseQuantity(product.id)}
              className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm transition duration-200"
            >
              -
            </button>
            <span className="text-sm font-bold text-gray-800 min-w-[12px] text-center">
              {cartItem.quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={cartItem.quantity >= product.stock}
              className={`w-8 h-8 rounded-lg text-white font-extrabold flex items-center justify-center text-sm shadow-sm transition duration-200
              ${
                cartItem.quantity >= product.stock
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              +
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ProductCard;