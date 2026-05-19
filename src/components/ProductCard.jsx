import { useContext } from "react";

import { motion } from "framer-motion";

import {
  FaShoppingCart,
  FaStar,
} from "react-icons/fa";

import { CartContext } from "../context/CartContext";

function ProductCard({ product }) {

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

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-500 border border-gray-100"
    >

      {/* IMAGE */}
      <div className="relative overflow-hidden">

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-72 object-cover hover:scale-105 transition duration-700"
        />

        {/* BADGE */}
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-full text-sm font-semibold text-green-700 shadow-lg">

          Fresh

        </div>

      </div>

      {/* CONTENT */}
      <div className="p-6">

        {/* PRODUCT NAME */}
        <h2 className="text-2xl font-bold text-gray-800">

          {product.name}

        </h2>

        {/* DESCRIPTION */}
        <p className="mt-3 text-gray-500 leading-7 text-sm">

          Fresh premium grocery product
          delivered directly to your home.

        </p>

        {/* PRICE + RATING */}
        <div className="flex justify-between items-center mt-6">

          <h3 className="text-3xl font-extrabold text-green-700">

            ₹{product.price}

          </h3>

          <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full text-yellow-700 text-sm font-semibold">

            <FaStar />

            4.9

          </div>

        </div>

        {/* ADD TO CART BUTTON */}
        {!cartItem && (

          <button
            onClick={() => addToCart(product)}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-lg font-semibold flex items-center justify-center gap-3 shadow-lg transition duration-300"
          >

            <FaShoppingCart />

            Add To Cart

          </button>

        )}

        {/* QUANTITY CONTROLS */}
        {cartItem && (

          <div className="mt-6 flex items-center justify-center gap-5">

            <button
              onClick={() => decreaseQuantity(product.id)}
              className="w-12 h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-2xl shadow-lg transition duration-300"
            >
              -
            </button>

            <span className="text-2xl font-bold text-gray-800">

              {cartItem.quantity}

            </span>

            <button
              onClick={() => increaseQuantity(product.id)}
              className="w-12 h-12 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-2xl shadow-lg transition duration-300"
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