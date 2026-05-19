import { motion } from "framer-motion";

import { HashLink } from "react-router-hash-link";

function Hero() {

  return (

    <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center overflow-hidden">

      <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{
            opacity: 0,
            x: -80,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
          }}
        >

          {/* BADGE */}
          <div className="inline-block bg-green-100 text-green-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">

            Fresh Grocery Delivery 🚚

          </div>

          {/* HEADING */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">

            Fresh Food

            <span className="text-green-600">

              {" "}Delivered{" "}

            </span>

            To Your Doorstep

          </h1>

          {/* DESCRIPTION */}
          <p className="mt-8 text-lg text-gray-600 leading-8 max-w-2xl">

            Order fresh vegetables,
            fruits, dairy products,
            snacks, and all your
            daily grocery essentials
            directly from your trusted
            local grocery store.

          </p>

          {/* BUTTONS */}
          <div className="mt-10 flex flex-wrap gap-5">

            {/* SHOP NOW */}
            <HashLink
              smooth
              to="/#products"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:scale-105 transition duration-300"
            >

              Shop Now

            </HashLink>

            {/* CONTACT BUTTON */}
            <HashLink
              smooth
              to="/#contact"
              className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-8 py-4 rounded-2xl text-lg font-semibold shadow-md hover:scale-105 transition duration-300"
            >

              Contact Us

            </HashLink>

          </div>

          {/* STATS */}
          <div className="mt-14 flex flex-wrap gap-10">

            <div>

              <h2 className="text-4xl font-extrabold text-green-700">

                500+

              </h2>

              <p className="text-gray-600 mt-2">

                Products

              </p>

            </div>

            <div>

              <h2 className="text-4xl font-extrabold text-green-700">

                1000+

              </h2>

              <p className="text-gray-600 mt-2">

                Happy Customers

              </p>

            </div>

            <div>

              <h2 className="text-4xl font-extrabold text-green-700">

                24/7

              </h2>

              <p className="text-gray-600 mt-2">

                Support

              </p>

            </div>

          </div>

        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{
            opacity: 0,
            x: 80,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="relative"
        >

          {/* GLOW EFFECT */}
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-green-300 rounded-full blur-3xl opacity-30"></div>

          {/* IMAGE */}
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e"
            alt="Groceries"
            className="relative w-full rounded-3xl shadow-2xl hover:scale-105 transition duration-500"
          />

        </motion.div>

      </div>

    </section>

  );
}

export default Hero;