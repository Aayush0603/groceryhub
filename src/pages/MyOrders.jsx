import {
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

import toast from "react-hot-toast";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import {
  db,
} from "../firebase/firebase";

import { AuthContext } from "../context/AuthContext";

import {
  FaShoppingBag,
  FaCheckCircle,
  FaBoxOpen,
  FaTruck,
  FaHome,
  FaClock,
  FaFileInvoice,
  FaCalendarAlt,
} from "react-icons/fa";

function MyOrders() {

  // CURRENT USER
  const { currentUser } =
    useContext(AuthContext);

  // ORDERS
  const [orders, setOrders] =
    useState([]);

  // STORE PREVIOUS ORDER STATUSES
  const previousStatuses =
  useRef({});

  // LOADING
  const [loading, setLoading] =
    useState(true);

  // REALTIME ORDERS
  useEffect(() => {

    if (!currentUser) {

      setLoading(false);

      return;

    }

    // LIVE FIREBASE LISTENER
    const unsubscribe =
      onSnapshot(

        collection(
          db,
          "orders"
        ),

        (snapshot) => {

          try {

            const allOrders =
              snapshot.docs.map(
                (doc) => ({

                  id: doc.id,

                  ...doc.data(),

                })
              );

            // FILTER USER ORDERS
            const userOrders =
              allOrders.filter(
                (order) =>

                  order.userId ===
                  currentUser.uid
              );

            // LATEST FIRST
            const sortedOrders =
              userOrders.sort(
                (a, b) => {

                  const aTime =
                    a.createdAt
                      ?.seconds || 0;

                  const bTime =
                    b.createdAt
                      ?.seconds || 0;

                  return (
                    bTime - aTime
                  );

                }
              );

            // STATUS NOTIFICATIONS
sortedOrders.forEach(
  (newOrder) => {

    const oldStatus =
      previousStatuses.current[
        newOrder.id
      ];

    // STATUS CHANGED
    if (
      oldStatus &&
      oldStatus !==
        newOrder.status
    ) {

      toast.success(
        `Your order is now ${newOrder.status}`
      );

    }

    // SAVE STATUS
    previousStatuses.current[
      newOrder.id
    ] = newOrder.status;

  }
);

            setOrders(
              sortedOrders
            );

          } catch (error) {

            console.error(
              error
            );

          } finally {

            setLoading(false);

          }

        }
      );

    return () =>
      unsubscribe();

 }, [currentUser]);

  // DOWNLOAD PDF INVOICE
  const downloadInvoice =
    (order) => {

      const docPDF =
        new jsPDF();

      // TITLE
      docPDF.setFontSize(22);

      docPDF.text(
        "GroceryHub Invoice",
        20,
        20
      );

      // ORDER INFO
      docPDF.setFontSize(12);

      docPDF.text(
        `Order ID: ${order.id}`,
        20,
        40
      );

      docPDF.text(
        `Date: ${order.orderDate}`,
        20,
        50
      );

      docPDF.text(
        `Time: ${order.orderTime}`,
        20,
        60
      );

      docPDF.text(
        `Customer: ${order.customerInfo?.name}`,
        20,
        70
      );

      docPDF.text(
        `Phone: ${order.customerInfo?.phone}`,
        20,
        80
      );

      docPDF.text(
        `Payment Method: ${order.paymentMethod}`,
        20,
        90
      );

      docPDF.text(
        `Status: ${order.status}`,
        20,
        100
      );

      // PRODUCTS TABLE
      const tableData =
        order.cartItems.map(
          (item) => [

            item.name,

            item.quantity,

            `₹${item.price}`,

            `₹${item.price * item.quantity}`,

          ]
        );

      autoTable(
        docPDF,

        {

          startY: 120,

          head: [[

            "Product",

            "Qty",

            "Price",

            "Total",

          ]],

          body: tableData,

        }
      );

      // FINAL TOTAL
      docPDF.setFontSize(18);

      docPDF.text(

        `Final Total: ₹${order.finalTotal}`,

        20,

        docPDF.lastAutoTable.finalY + 20

      );

      // SAVE PDF
      docPDF.save(
        `invoice-${order.id}.pdf`
      );

    };

  const trackingSteps = [

  {
    title: "Pending",
    icon: <FaClock />,
  },

  {
    title: "Accepted",
    icon: <FaCheckCircle />,
  },

  {
    title: "Preparing",
    icon: <FaBoxOpen />,
  },

  {
    title: "Out for Delivery",
    icon: <FaTruck />,
  },

  {
    title: "Delivered",
    icon: <FaHome />,
  },

];


  // STATUS COLORS
  const getStatusStyle =
    (status) => {

      switch (status) {

        case "Pending":
          return "bg-yellow-100 text-yellow-700";

        case "Processing":
          return "bg-blue-100 text-blue-700";

        case "Packed":
          return "bg-indigo-100 text-indigo-700";

        case "Out for Delivery":
          return "bg-purple-100 text-purple-700";

        case "Delivered":
          return "bg-green-100 text-green-700";

        case "Cancelled":
          return "bg-red-100 text-red-700";

        default:
          return "bg-gray-100 text-gray-700";

      }

    };

  // CANCEL ORDER
  const cancelOrder =
    async (orderId) => {

      try {

        await updateDoc(

          doc(
            db,
            "orders",
            orderId
          ),

          {

            status:
              "Cancelled",

            estimatedDelivery:
              "Cancelled",

          }

        );

        toast.success(
          "Order Cancelled"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed to cancel order"
        );

      }

    };

  // LOADING
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-3xl font-bold">

        Loading Orders...

      </div>

    );

  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-gray-50 pt-32 pb-16 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-4">
            My Orders <FaShoppingBag className="text-green-600" />
          </h1>
          <p className="text-gray-500 mt-3 text-lg">Track, manage, and view your recent purchases.</p>
        </motion.div>

        {/* EMPTY STATE */}
        <AnimatePresence mode="wait">
          {orders.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 md:p-24 text-center max-w-2xl mx-auto"
            >
              <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FaBoxOpen className="text-5xl" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">No Orders Found</h2>
              <p className="text-gray-500 text-lg">Looks like you haven't placed any orders yet.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ORDERS LIST */}
        <div className="space-y-8">
          <AnimatePresence>
            {orders.map((order, index) => {
              const currentStep = trackingSteps.findIndex(
                (step) => step.title === order.status
              );

              let estimatedTime = "45 mins";
              if (order.status === "Accepted") estimatedTime = "35 mins";
              else if (order.status === "Preparing") estimatedTime = "25 mins";
              else if (order.status === "Out for Delivery") estimatedTime = "10 mins";
              else if (order.status === "Delivered") estimatedTime = "Delivered Successfully";

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-white rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 group"
                >
                  {/* TOP HEADER BAR */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-5 md:px-8 md:py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-green-100 text-sm font-semibold uppercase tracking-wider mb-1">Order ID</p>
                      <p className="text-lg md:text-xl font-bold font-mono break-all leading-tight">{order.id}</p>
                    </div>
                    <div className={`px-5 py-2.5 rounded-full font-bold text-sm md:text-base border ${getStatusStyle(order.status).replace('bg-', 'bg-white/90 text-').replace('text-', 'text-').split(' ')[0]} shadow-sm shrink-0 backdrop-blur-sm`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    {/* INFO GRID: DATE/TIME & ETA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                      {/* Date */}
                      <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-5 flex items-center gap-4 hover:bg-blue-50 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <FaCalendarAlt className="text-xl" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Order Date</p>
                          <h3 className="font-extrabold text-lg text-gray-900">{order.orderDate || "N/A"}</h3>
                        </div>
                      </div>
                      
                      {/* Time */}
                      <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-5 flex items-center gap-4 hover:bg-indigo-50 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <FaClock className="text-xl" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Order Time</p>
                          <h3 className="font-extrabold text-lg text-gray-900">{order.orderTime || "N/A"}</h3>
                        </div>
                      </div>

                      {/* ETA */}
                      <div className="bg-orange-50/50 border border-orange-100/50 rounded-2xl p-5 flex items-center gap-4 md:col-span-2 lg:col-span-1 hover:bg-orange-50 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                          <FaTruck className="text-xl" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Estimated Delivery</p>
                          <h3 className="font-extrabold text-lg text-orange-700">{order.estimatedDelivery || estimatedTime}</h3>
                        </div>
                      </div>
                    </div>

                    {/* LIVE TRACKING TIMELINE */}
                    {order.status !== "Cancelled" && (
                      <div className="mb-10 bg-gray-50/50 border border-gray-100 rounded-3xl p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                          Live Tracking
                        </h2>
                        
                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4">
                          {/* Progress Line (Desktop) */}
                          <div className="hidden md:block absolute top-6 left-10 right-10 h-1.5 bg-gray-200 rounded-full z-0 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(currentStep / (trackingSteps.length - 1)) * 100}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-green-500 rounded-full"
                            />
                          </div>

                          {/* Progress Line (Mobile) */}
                          <div className="md:hidden absolute left-6 top-8 bottom-8 w-1.5 bg-gray-200 rounded-full z-0 overflow-hidden">
                             <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${(currentStep / (trackingSteps.length - 1)) * 100}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="w-full bg-green-500 rounded-full"
                            />
                          </div>

                          {trackingSteps.map((step, stepIdx) => (
                            <div key={step.title} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-3 w-full md:w-auto md:flex-1">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl shadow-sm transition-colors duration-300 shrink-0 border-4 border-white
                                ${stepIdx <= currentStep ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"}`}
                              >
                                {step.icon}
                              </motion.div>
                              <p className={`font-bold text-sm md:text-base md:text-center ${stepIdx <= currentStep ? "text-gray-900" : "text-gray-400"}`}>
                                {step.title}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PRODUCT LIST */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Order Items</h3>
                      {order.cartItems?.map((item) => (
                        <div key={item.id} className="bg-white border border-gray-100 hover:border-green-100 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                               {item.image ? (
                                 <img src={item.image} alt={item.name} className="w-10 h-10 object-cover" />
                               ) : (
                                 <FaShoppingBag className="text-gray-300 text-xl" />
                               )}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                              <p className="text-gray-500 text-sm font-medium mt-0.5">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                          </div>
                          <div className="text-xl font-black text-green-700 bg-green-50 px-4 py-2 rounded-xl shrink-0 w-full sm:w-auto text-right sm:text-left">
                            ₹{item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* FOOTER / TOTAL / BUTTONS */}
                    <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8">
                      <div className="text-center lg:text-left w-full lg:w-auto">
                        <p className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-1">Final Total</p>
                        <h2 className="text-4xl lg:text-5xl font-black text-green-700 tracking-tight">₹{order.finalTotal}</h2>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => downloadInvoice(order)}
                          className="flex-1 sm:flex-none bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-2xl text-base font-bold flex items-center justify-center gap-3 shadow-lg transition-colors"
                        >
                          <FaFileInvoice className="text-lg" /> Download Invoice
                        </motion.button>

                        {(order.status === "Pending" || order.status === "Processing") && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => cancelOrder(order.id)}
                            className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-8 py-3.5 rounded-2xl text-base font-bold transition-colors"
                          >
                            Cancel Order
                          </motion.button>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default MyOrders;