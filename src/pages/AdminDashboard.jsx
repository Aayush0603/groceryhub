import { motion } from "framer-motion";

import {
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaRupeeSign,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
} from "react-icons/fa";

import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import toast from "react-hot-toast";

function AdminDashboard() {

  // DASHBOARD STATES
  const [productCount, setProductCount] =
    useState(0);

  const [orderCount, setOrderCount] =
    useState(0);

  const [customerCount, setCustomerCount] =
    useState(0);

  const [totalRevenue, setTotalRevenue] =
    useState(0);

  const [orders, setOrders] =
    useState([]);

  // STORE PREVIOUS ORDER IDS
  const previousOrderIds =
  useRef([]);

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

          const fetchedOrders =
            snapshot.docs.map(
              (doc) => ({

                id: doc.id,

                ...doc.data(),

              })
            );

          // LATEST FIRST
          fetchedOrders.sort(
            (a, b) => {

              const aTime =
                a.createdAt?.seconds || 0;

              const bTime =
                b.createdAt?.seconds || 0;

              return (
                bTime - aTime
              );

            }
          );

// CURRENT ORDER IDS
const currentOrderIds =
  fetchedOrders.map(
    (order) => order.id
  );

// CHECK NEW ORDERS
const newOrders =
  currentOrderIds.filter(
    (id) =>

      !previousOrderIds.current.includes(
        id
      )
  );

// SHOW NOTIFICATION
if (
  previousOrderIds.current.length > 0 &&
  newOrders.length > 0
) {

  toast.success(
    "🔔 New order received"
  );

}

// SAVE IDS
previousOrderIds.current =
  currentOrderIds;
  
          setOrders(
            fetchedOrders
          );

          setOrderCount(
            fetchedOrders.length
          );

          // TOTAL REVENUE
          let revenue = 0;

          fetchedOrders.forEach(
            (order) => {

              revenue +=
                Number(
                  order.finalTotal
                ) || 0;

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

  // UPDATE ORDER STATUS
  const updateOrderStatus =
    async (
      orderId,
      newStatus
    ) => {

      try {

        await updateDoc(

          doc(
            db,
            "orders",
            orderId
          ),

          {

            status:
              newStatus,

          }

        );

        toast.success(
          `Order marked as ${newStatus}`
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to update order"
        );

      }

    };

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

          Manage your grocery business in realtime.

        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">

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

      {/* ORDERS SECTION */}
      <div>

        <div className="flex items-center gap-4 mb-10">

          <FaShoppingCart className="text-4xl text-green-600" />

          <h2 className="text-4xl font-extrabold text-gray-900">

            Live Orders

          </h2>

        </div>

        {orders.length === 0 ? (

          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">

            <h2 className="text-3xl font-bold text-gray-700">

              No Orders Yet

            </h2>

          </div>

        ) : (

          <div className="space-y-8">

            {orders.map(
              (order, index) => (

                <motion.div
                  key={order.id}
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
                      index * 0.05,
                  }}
                  className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                >

                  {/* TOP */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

                    <div>

                      <h2 className="text-3xl font-extrabold text-gray-900 mb-3">

                        {order.customerInfo?.name}

                      </h2>

                      <p className="text-gray-600 text-lg">

                        📞 {order.customerInfo?.phone}

                      </p>

                      <p className="text-gray-600 text-lg mt-2">

                        📍 {order.customerInfo?.address}

                      </p>

                    </div>

                    {/* STATUS */}
                    <div className="flex flex-col items-start lg:items-end gap-3">

                      <div className={`px-5 py-3 rounded-2xl font-bold text-white

                      ${
                        order.status === "Pending"

                          ? "bg-yellow-500"

                          : order.status === "Accepted"

                          ? "bg-blue-500"

                          : order.status === "Preparing"

                          ? "bg-orange-500"

                          : order.status === "Out for Delivery"

                          ? "bg-purple-500"

                          : order.status === "Delivered"

                          ? "bg-green-600"

                          : "bg-red-500"
                      }`}>

                        {order.status || "Pending"}

                      </div>

                      <p className="text-gray-500">

                        {order.orderDate} • {order.orderTime}

                      </p>

                    </div>

                  </div>

                  {/* PRODUCTS */}
                  <div className="mb-8">

                    <h3 className="text-2xl font-bold text-gray-900 mb-5">

                      Ordered Products

                    </h3>

                    <div className="space-y-4">

                      {order.cartItems?.map(
                        (
                          item,
                          idx
                        ) => (

                          <div
                            key={idx}
                            className="flex items-center justify-between bg-gray-100 rounded-2xl px-6 py-4"
                          >

                            <div>

                              <h4 className="text-xl font-bold text-gray-900">

                                {item.name}

                              </h4>

                              <p className="text-gray-600">

                                Quantity:
                                {" "}
                                {item.quantity}

                              </p>

                            </div>

                            <h3 className="text-2xl font-extrabold text-green-700">

                              ₹
                              {item.price *
                                item.quantity}

                            </h3>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                  {/* PAYMENT */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                    <div className="bg-gray-100 rounded-2xl p-6">

                      <h3 className="text-gray-500 mb-3">

                        Payment Method

                      </h3>

                      <h2 className="text-2xl font-bold text-gray-900">

                        {order.paymentMethod}

                      </h2>

                    </div>

                    <div className="bg-gray-100 rounded-2xl p-6">

                      <h3 className="text-gray-500 mb-3">

                        Delivery Charge

                      </h3>

                      <h2 className="text-2xl font-bold text-gray-900">

                        ₹{order.deliveryCharge}

                      </h2>

                    </div>

                    <div className="bg-green-100 rounded-2xl p-6">

                      <h3 className="text-green-700 mb-3">

                        Final Total

                      </h3>

                      <h2 className="text-3xl font-extrabold text-green-700">

                        ₹{order.finalTotal}

                      </h2>

                    </div>

                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-4">

                    {/* ACCEPT */}
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          "Accepted"
                        )
                      }
                      className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold transition duration-300"
                    >

                      <FaCheckCircle />

                      Accept

                    </button>

                    {/* PREPARING */}
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          "Preparing"
                        )
                      }
                      className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold transition duration-300"
                    >

                      <FaClock />

                      Preparing

                    </button>

                    {/* OUT FOR DELIVERY */}
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          "Out for Delivery"
                        )
                      }
                      className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-2xl font-bold transition duration-300"
                    >

                      <FaTruck />

                      Out for Delivery

                    </button>

                    {/* DELIVERED */}
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          "Delivered"
                        )
                      }
                      className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl font-bold transition duration-300"
                    >

                      <FaCheckCircle />

                      Delivered

                    </button>

                    {/* CANCEL */}
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          "Cancelled"
                        )
                      }
                      className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-2xl font-bold transition duration-300"
                    >

                      <FaTimesCircle />

                      Cancel

                    </button>

                  </div>

                </motion.div>

              )
            )}

          </div>

        )}

      </div>

    </section>

  );

}

export default AdminDashboard;