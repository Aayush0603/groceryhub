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

import { useTranslation } from "react-i18next";

function MyOrders() {
  const { t } = useTranslation();

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

            // FILTER USER ORDERS (by userId OR matching phone number)
            const userOrders =
              allOrders.filter(
                (order) =>

                  order.userId ===
                  currentUser.uid ||

                  (currentUser.phone &&
                  order.customerPhone ===
                  currentUser.phone)
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
        "GandhiBazaar Invoice",
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

      let tableStartY = 120;
      if (order.customerInfo?.notes) {
        docPDF.text(
          `Delivery Notes: ${order.customerInfo.notes}`,
          20,
          110
        );
        tableStartY = 130;
      }

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

          startY: tableStartY,

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

        {t("orders.loading")}

      </div>

    );

  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-gray-50 pt-24 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center md:text-left"
        >
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
            {t("orders.pageTitle")} <FaShoppingBag className="text-green-600" />
          </h1>
          <p className="text-gray-500 mt-1.5 text-base">{t("orders.subtitle")}</p>
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
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{t("orders.noOrders")}</h2>
              <p className="text-gray-500 text-lg">{t("orders.noOrdersDesc")}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ORDERS LIST */}
        <div className="space-y-6">
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
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 group"
                >
                  {/* TOP HEADER BAR */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-5 py-4 md:px-6 md:py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <p className="text-green-100 text-xs font-semibold uppercase tracking-wider mb-0.5">{t("orders.orderId")}</p>
                      <p className="text-base md:text-lg font-bold font-mono break-all leading-tight">#{order.id}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full font-bold text-xs md:text-sm border ${getStatusStyle(order.status).replace('bg-', 'bg-white/90 text-').replace('text-', 'text-').split(' ')[0]} shadow-sm shrink-0 backdrop-blur-sm`}>
                      {t(`orders.status${order.status.replace(/\s+/g, '')}`) || order.status}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 md:p-6">
                    {/* INFO GRID: DATE/TIME & ETA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {/* Date */}
                      <div className="bg-blue-50/30 border border-blue-100/30 rounded-xl p-3 sm:p-4 flex items-center gap-3 hover:bg-blue-50/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <FaCalendarAlt className="text-xl" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-extrabold uppercase tracking-wider">{t("orders.orderDate")}</p>
                          <h3 className="font-bold text-base sm:text-lg text-gray-800">{order.orderDate || "N/A"}</h3>
                        </div>
                      </div>
                      
                      {/* Time */}
                      <div className="bg-indigo-50/30 border border-indigo-100/30 rounded-xl p-3 sm:p-4 flex items-center gap-3 hover:bg-indigo-50/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <FaClock className="text-xl" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-extrabold uppercase tracking-wider">{t("orders.orderTime")}</p>
                          <h3 className="font-bold text-base sm:text-lg text-gray-800">{order.orderTime || "N/A"}</h3>
                        </div>
                      </div>

                      {/* ETA */}
                      <div className="bg-orange-50/30 border border-orange-100/30 rounded-xl p-3 sm:p-4 flex items-center gap-3 md:col-span-2 lg:col-span-1 hover:bg-orange-50/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                          <FaTruck className="text-xl" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-extrabold uppercase tracking-wider">{t("orders.estimatedDelivery")}</p>
                          <h3 className="font-bold text-base sm:text-lg text-orange-700">{order.estimatedDelivery || estimatedTime}</h3>
                        </div>
                      </div>
                    </div>

                    {/* LIVE TRACKING TIMELINE */}
                    {order.status !== "Cancelled" && (
                      <div className="mb-6 bg-gray-50/50 border border-gray-100 rounded-2xl p-4 sm:p-5 md:p-6">
                        <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                          {t("orders.liveTracking")}
                        </h2>
                        
                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-5 md:gap-3">
                          {/* Progress Line (Desktop) */}
                          <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-gray-200 rounded-full z-0 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(currentStep / (trackingSteps.length - 1)) * 100}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-green-500 rounded-full"
                            />
                          </div>

                          {/* Progress Line (Mobile) */}
                          <div className="md:hidden absolute left-5 top-6 bottom-6 w-1 bg-gray-200 rounded-full z-0 overflow-hidden">
                             <motion.div 
                               initial={{ height: 0 }}
                               animate={{ height: `${(currentStep / (trackingSteps.length - 1)) * 100}%` }}
                               transition={{ duration: 1, ease: "easeOut" }}
                               className="w-full bg-green-500 rounded-full"
                             />
                          </div>

                          {trackingSteps.map((step, stepIdx) => (
                            <div key={step.title} className="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 w-full md:w-auto md:flex-1">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl shadow-sm transition-colors duration-300 shrink-0 border-2 border-white
                                ${stepIdx <= currentStep ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"}`}
                              >
                                {step.icon}
                              </motion.div>
                              <p className={`font-bold text-sm md:text-base md:text-center ${stepIdx <= currentStep ? "text-gray-800" : "text-gray-400"}`}>
                                {t(`orders.status${step.title.replace(/\s+/g, '')}`) || step.title}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DELIVERY ADDRESS & NOTES */}
                    <div className="mb-6 bg-green-50/20 border border-green-100/50 rounded-2xl p-4 sm:p-5">
                      <h3 className="text-xs font-black text-gray-400 mb-2.5 uppercase tracking-wider flex items-center gap-1.5 select-none">
                        <FaHome className="text-green-600 text-sm" /> {t("orders.deliveryAddress")}
                      </h3>
                      <p className="text-gray-800 font-bold text-sm sm:text-base">
                        {order.customerInfo?.address}
                        {order.customerInfo?.landmark && `, ${order.customerInfo.landmark}`}
                        {order.customerInfo?.city && `, ${order.customerInfo.city}`}
                        {order.customerInfo?.pincode && ` - ${order.customerInfo.pincode}`}
                      </p>
                      {order.customerInfo?.notes && (
                        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs sm:text-sm text-gray-700 font-semibold flex gap-2 items-start">
                          <span className="text-base select-none">💬</span>
                          <div>
                            <span className="font-black text-amber-900 block mb-0.5 text-[10px] sm:text-xs uppercase tracking-wider">{t("orders.deliveryInstructions")}:</span>
                            {order.customerInfo.notes}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PRODUCT LIST */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-gray-500 mb-1">{t("orders.orderItems")}</h3>
                      <div className="space-y-2 sm:space-y-3">
                        {order.cartItems?.map((item) => (
                          <div key={item.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md p-2.5 sm:p-3 flex flex-row items-center gap-3 sm:gap-4 transition-all duration-300 relative">
                            {/* PRODUCT IMAGE */}
                            <div className="relative w-12 h-12 sm:w-16 sm:h-16 overflow-hidden rounded-xl border border-gray-100 bg-green-50/20 flex items-center justify-center shrink-0">
                               {item.image ? (
                                 <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                               ) : (
                                 <div className="text-green-600"><FaShoppingBag className="w-5 h-5" /></div>
                               )}
                            </div>
                            {/* PRODUCT DETAILS */}
                            <div className="flex-1 min-w-0 flex flex-row items-center justify-between gap-2 h-12 sm:h-16">
                              {/* Name & Details */}
                              <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 border border-green-600 flex items-center justify-center p-[1px] rounded-sm shrink-0 bg-white">
                                    <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                                  </span>
                                  <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                    {t(item.i18nKeyName) || item.name}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {item.category && (
                                    <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-100">
                                      {t(`products.categories.${item.category.toLowerCase()}`) || item.category}
                                    </span>
                                  )}
                                  <span className="text-sm sm:text-base text-gray-500 font-medium">
                                    ₹{item.price} × {item.quantity}
                                  </span>
                                </div>
                              </div>
                              {/* Total price */}
                              <div className="text-right shrink-0">
                                <p className="text-lg sm:text-xl font-extrabold text-green-700">
                                  ₹{item.price * item.quantity}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FOOTER / TOTAL / BUTTONS */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-center sm:text-left w-full sm:w-auto">
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">{t("orders.finalTotal")}</p>
                        <h2 className="text-2xl sm:text-3xl font-black text-green-700 tracking-tight">₹{order.finalTotal}</h2>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => downloadInvoice(order)}
                          className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                        >
                          <FaFileInvoice className="text-base" /> {t("orders.downloadInvoice")}
                        </motion.button>

                        {(order.status === "Pending" || order.status === "Processing") && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => cancelOrder(order.id)}
                            className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                          >
                            {t("orders.cancelOrder")}
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