import { motion } from "framer-motion";

import {
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaRupeeSign,
} from "react-icons/fa";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

function AdminDashboard() {

  // STATES
  const [productCount, setProductCount] =
    useState(0);

  const [orderCount, setOrderCount] =
    useState(0);

  const [customerCount, setCustomerCount] =
    useState(0);

  const [totalRevenue, setTotalRevenue] =
    useState(0);

  // FETCH REALTIME DATA
  useEffect(() => {

    // PRODUCTS
    const unsubscribeProducts =
      onSnapshot(

        collection(
          db,
          "products"
        ),

        (snapshot) => {

          setProductCount(
            snapshot.size
          );

        }
      );

    // USERS
    const unsubscribeUsers =
      onSnapshot(

        collection(
          db,
          "users"
        ),

        (snapshot) => {

          setCustomerCount(
            snapshot.size
          );

        }
      );

    // ORDERS
    const unsubscribeOrders =
      onSnapshot(

        collection(
          db,
          "orders"
        ),

        (snapshot) => {

          const orders =
            snapshot.docs.map(
              (doc) =>
                doc.data()
            );

          setOrderCount(
            orders.length
          );

          // TOTAL REVENUE
          let revenue = 0;

          orders.forEach(
            (order) => {

              revenue +=
                order.finalTotal || 0;

            }
          );

          setTotalRevenue(
            revenue
          );

        }
      );

    return () => {

      unsubscribeProducts();

      unsubscribeUsers();

      unsubscribeOrders();

    };

  }, []);

  // DASHBOARD STATS
  const stats = [

    {
      title: "Total Products",
      value: productCount,
      icon: <FaBoxOpen />,
      color: "bg-blue-500",
    },

    {
      title: "Total Orders",
      value: orderCount,
      icon: <FaShoppingCart />,
      color: "bg-green-500",
    },

    {
      title: "Customers",
      value: customerCount,
      icon: <FaUsers />,
      color: "bg-purple-500",
    },

    {
      title: "Revenue",
      value: `₹${totalRevenue}`,
      icon: <FaRupeeSign />,
      color: "bg-orange-500",
    },

  ];

  return (

    <section className="min-h-screen bg-gray-100 p-6 lg:p-10">

      {/* HEADER */}
      <div className="mb-12">

        <h1 className="text-5xl font-extrabold text-gray-900">

          Admin Dashboard 📊

        </h1>

        <p className="text-gray-600 mt-3 text-lg">

          Quick overview of your grocery business.

        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

        {stats.map(
          (item, index) => (

            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 40,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay:
                  index * 0.1,
              }}
              className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition duration-300"
            >

              {/* ICON */}
              <div className={`w-16 h-16 rounded-2xl ${item.color} text-white flex items-center justify-center text-3xl mb-6`}>

                {item.icon}

              </div>

              {/* TITLE */}
              <h2 className="text-gray-500 text-lg mb-3">

                {item.title}

              </h2>

              {/* VALUE */}
              <h1 className="text-5xl font-extrabold text-gray-900">

                {item.value}

              </h1>

            </motion.div>

          )
        )}

      </div>

    </section>

  );

}

export default AdminDashboard;