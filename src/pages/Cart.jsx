import { useContext } from "react";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import {
  FaTrash,
} from "react-icons/fa";

import { CartContext } from "../context/CartContext";

function Cart() {

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

    <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-32 overflow-hidden">

      <div className="max-w-7xl mx-auto px-6">

        {/* PAGE TITLE */}
        <motion.h1
          initial={{
            opacity: 0,
            y: -30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-5xl font-extrabold text-gray-900 mb-14"
        >

          Your Cart 🛒

        </motion.h1>

        {/* EMPTY CART */}
        {cartItems.length === 0 ? (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-16 text-center"
          >

            <h2 className="text-4xl font-bold text-gray-800 mb-6">

              Your Cart is Empty

            </h2>

            <p className="text-gray-600 text-lg">

              Add fresh grocery products
              to start shopping.

            </p>

          </motion.div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* LEFT SIDE */}
            <div className="lg:col-span-2 space-y-8">

              {cartItems.map((item) => (

                <motion.div
                  key={item.id}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-3xl shadow-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition duration-300"
                >

                  {/* PRODUCT INFO */}
                  <div className="flex items-center gap-5">

                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-2xl shadow-md"
                    />

                    <div>

                      <h2 className="text-3xl font-bold text-gray-800">

                        {item.name}

                      </h2>

                      <p className="text-green-700 text-2xl font-bold mt-2">

                        ₹{item.price}

                      </p>

                      <p className="text-gray-500 mt-2">

                        Premium quality grocery product

                      </p>

                    </div>

                  </div>

                  {/* CONTROLS */}
                  <div className="flex flex-col items-center gap-5">

                    {/* QUANTITY */}
                    <div className="flex items-center gap-4">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                        className="w-12 h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-2xl shadow-lg transition duration-300"
                      >
                        -
                      </button>

                      <span className="text-3xl font-bold text-gray-800">

                        {item.quantity}

                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                        className="w-12 h-12 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-2xl shadow-lg transition duration-300"
                      >
                        +
                      </button>

                    </div>

                    {/* REMOVE BUTTON */}
                    <button
                      onClick={() =>
                        removeProduct(item.id)
                      }
                      className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-2xl transition duration-300"
                    >

                      <FaTrash />

                      Remove

                    </button>

                  </div>

                </motion.div>

              ))}

            </div>

            {/* ORDER SUMMARY */}
            <motion.div
              initial={{
                opacity: 0,
                x: 50,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="bg-white rounded-3xl shadow-2xl p-8 h-fit sticky top-32"
            >

              <h2 className="text-4xl font-bold text-gray-900 mb-8">

                Order Summary

              </h2>

              {/* TOTAL ITEMS */}
              <div className="flex justify-between items-center mb-6">

                <span className="text-xl text-gray-600">

                  Total Items

                </span>

                <span className="text-2xl font-bold text-gray-800">

                  {totalItems}

                </span>

              </div>

              {/* TOTAL PRICE */}
              <div className="flex justify-between items-center mb-10">

                <span className="text-xl text-gray-600">

                  Total Price

                </span>

                <span className="text-4xl font-extrabold text-green-700">

                  ₹{totalPrice}

                </span>

              </div>

              {/* CHECKOUT BUTTON */}
              <Link
                to="/checkout"
                className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl text-xl font-bold shadow-2xl hover:scale-105 transition duration-300"
              >

                Proceed To Checkout

              </Link>

              {/* CLEAR CART */}
              <button
                onClick={clearCart}
                className="w-full mt-5 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl text-lg font-semibold transition duration-300"
              >

                Clear Cart

              </button>

            </motion.div>

          </div>

        )}

      </div>

    </section>

  );
}

export default Cart;