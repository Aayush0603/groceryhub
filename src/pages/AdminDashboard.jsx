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

    <section className="min-h-screen bg-gray-50 p-4 lg:p-6">

      {/* HEADER */}
      <div className="mb-6">

        <h1 className="text-3xl font-extrabold text-gray-900">

          Admin Dashboard 📊

        </h1>

        <p className="text-gray-500 mt-1 text-sm">

          Manage your grocery business in realtime.

        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

        {stats.map(
          (item, index) => (

            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay:
                  index * 0.05,
              }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5 hover:shadow-md transition duration-300"
            >

              <div className="flex items-center justify-between">
                <div>
                  {/* TITLE */}
                  <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">

                    {item.title}

                  </h2>

                  {/* VALUE */}
                  <h1 className="text-3xl font-extrabold text-gray-900">

                    {item.value}

                  </h1>
                </div>

                {/* ICON */}
                <div className={`w-12 h-12 rounded-xl ${item.color} text-white flex items-center justify-center text-2xl`}>

                  {item.icon}

                </div>
              </div>

            </motion.div>

          )
        )}

      </div>

      {/* ORDERS SECTION */}
      <div>

        <div className="flex items-center gap-3 mb-6">

          <FaShoppingCart className="text-2xl text-green-600" />

          <h2 className="text-2xl font-bold text-gray-900">

            Live Orders

          </h2>

        </div>

        {orders.length === 0 ? (

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">

            <h2 className="text-xl font-bold text-gray-700">

              No Orders Yet

            </h2>

          </div>

        ) : (

          <div className="space-y-5">

            {orders.map(
              (order, index) => (

                <motion.div
                  key={order.id}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.03,
                  }}
                  className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition duration-300"
                >

                  {/* TOP */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5 pb-4 border-b border-gray-100">

                    <div>

                      <h2 className="text-xl font-bold text-gray-900 mb-1">

                        {order.customerInfo?.name}

                      </h2>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-base text-gray-500">
                        <span>📞 {order.customerInfo?.phone}</span>
                        <span>📍 {order.customerInfo?.address}</span>
                      </div>

                      {order.customerInfo?.notes && (
                        <div className="mt-2.5 text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-100/80 rounded-xl px-3 py-1.5 flex items-center gap-1.5 w-fit">
                          <span>💬</span>
                          <span>Note: {order.customerInfo.notes}</span>
                        </div>
                      )}

                    </div>

                    {/* STATUS */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2">

                      <div className={`px-3.5 py-1.5 rounded-xl font-bold text-sm text-white

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

                      <p className="text-sm text-gray-400">

                        {order.orderDate} • {order.orderTime}

                      </p>

                    </div>

                  </div>

                  {/* PRODUCTS */}
                  <div className="mb-5">

                    <h3 className="text-base font-bold text-gray-800 mb-3">

                      Ordered Products

                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">

                      {order.cartItems?.map(
                        (
                          item,
                          idx
                        ) => (

                          <div
                            key={idx}
                            className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2 border border-gray-100/50"
                          >

                            <div>

                              <h4 className="text-base font-semibold text-gray-800">

                                {item.name}

                              </h4>

                              <p className="text-sm text-gray-500">

                                Quantity:
                                {" "}
                                {item.quantity}

                              </p>

                            </div>

                            <h3 className="text-base font-bold text-green-700">

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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100/50">

                      <h3 className="text-sm text-gray-400 mb-1">

                        Payment Method

                      </h3>

                      <h2 className="text-base font-bold text-gray-800">

                        {order.paymentMethod}

                      </h2>

                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100/50">

                      <h3 className="text-sm text-gray-400 mb-1">

                        Delivery Charge

                      </h3>

                      <h2 className="text-base font-bold text-gray-800">

                        ₹{order.deliveryCharge}

                      </h2>

                    </div>

                    <div className="bg-green-50 rounded-xl p-3 border border-green-100/50">

                      <h3 className="text-sm text-green-700 mb-1">

                        Final Total

                      </h3>

                      <h2 className="text-xl font-extrabold text-green-700">

                        ₹{order.finalTotal}

                      </h2>

                    </div>

                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">

                    {/* ACCEPT */}
                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          "Accepted"
                        )
                      }
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition duration-300"
                    >

                      <FaCheckCircle className="text-[12px]" />

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
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition duration-300"
                    >

                      <FaClock className="text-[12px]" />

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
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition duration-300"
                    >

                      <FaTruck className="text-[12px]" />

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
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition duration-300"
                    >

                      <FaCheckCircle className="text-[12px]" />

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
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition duration-300"
                    >

                      <FaTimesCircle className="text-[12px]" />

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