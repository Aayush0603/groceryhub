import {
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";

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

    <section className="min-h-screen bg-gray-100 py-28 px-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-14">

          <h1 className="text-5xl font-extrabold text-gray-900">

            My Orders 📦

          </h1>

        </div>

        {/* EMPTY */}
        {orders.length === 0 && (

          <div className="bg-white rounded-3xl shadow-xl p-20 text-center">

            <FaShoppingBag className="text-7xl text-gray-300 mx-auto mb-8" />

            <h2 className="text-4xl font-bold text-gray-800">

              No Orders Found

            </h2>

          </div>

        )}

        {/* ORDERS */}
        <div className="space-y-10">

          {orders.map((order) => {

            const currentStep =
              trackingSteps.findIndex(
                (step) =>

                  step.title ===
                  order.status
              );


              // ESTIMATED DELIVERY TIME
let estimatedTime =
  "45 mins";

if (
  order.status ===
  "Accepted"
) {

  estimatedTime =
    "35 mins";

}

else if (
  order.status ===
  "Preparing"
) {

  estimatedTime =
    "25 mins";

}

else if (
  order.status ===
  "Out for Delivery"
) {

  estimatedTime =
    "10 mins";

}

else if (
  order.status ===
  "Delivered"
) {

  estimatedTime =
    "Delivered Successfully";

}

            return (

              <div
                key={order.id}
                className="bg-white rounded-3xl shadow-xl overflow-hidden"
              >

                {/* TOP */}
                <div className="bg-green-600 text-white px-8 py-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">

                  <div>

                    <h2 className="text-2xl font-bold">

                      Order ID

                    </h2>

                    <p className="mt-2 break-all">

                      {order.id}

                    </p>

                  </div>

                  <div
                    className={`px-6 py-3 rounded-2xl font-bold text-lg ${getStatusStyle(order.status)}`}
                  >

                    {order.status}

                  </div>

                </div>

                {/* CONTENT */}
                <div className="p-8">

                  {/* DATE & TIME */}
                  <div className="bg-blue-50 rounded-2xl p-5 mb-8 flex flex-col lg:flex-row justify-between gap-5">

                    <div className="flex items-center gap-3">

                      <FaCalendarAlt className="text-blue-600 text-2xl" />

                      <div>

                        <p className="text-gray-500 text-sm">

                          Order Date

                        </p>

                        <h3 className="font-bold text-xl text-blue-700">

                          {order.orderDate || "N/A"}

                        </h3>

                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      <FaClock className="text-green-600 text-2xl" />

                      <div>

                        <p className="text-gray-500 text-sm">

                          Order Time

                        </p>

                        <h3 className="font-bold text-xl text-green-700">

                          {order.orderTime || "N/A"}

                        </h3>

                      </div>

                    </div>

                  </div>

                  {/* ETA */}
                  <div className="bg-orange-50 px-5 py-4 rounded-2xl mb-8">

                    <p className="text-sm text-gray-500">

                      Estimated Delivery

                    </p>

                    <h3 className="font-bold text-orange-700 text-2xl">

                      {order.estimatedDelivery ||
                        estimatedTime}

                    </h3>

                  </div>

                  {/* TRACKING */}
                  {order.status !==
                    "Cancelled" && (

                    <div className="mb-10">

                      <h2 className="text-3xl font-bold text-gray-900 mb-10">

                        Live Order Tracking

                      </h2>

                      <div className="flex flex-wrap justify-between gap-6">

                        {trackingSteps.map(
                          (
                            step,
                            index
                          ) => (

                            <div
                              key={
                                step.title
                              }
                              className="flex flex-col items-center flex-1 min-w-[120px]"
                            >

                              <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl
                                ${
                                  index <=
                                  currentStep
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-200 text-gray-500"
                                }`}
                              >

                                {step.icon}

                              </div>

                              <p className="mt-4 font-bold text-center">

                                {
                                  step.title
                                }

                              </p>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                  {/* PRODUCTS */}
                  <div className="space-y-5">

                    {order.cartItems?.map(
                      (item) => (

                        <div
                          key={item.id}
                          className="bg-gray-50 rounded-2xl p-6 flex justify-between"
                        >

                          <div>

                            <h3 className="text-2xl font-bold">

                              {item.name}

                            </h3>

                            <p className="text-gray-500 mt-2">

                              Quantity:
                              {" "}
                              {item.quantity}

                            </p>

                          </div>

                          <div className="text-3xl font-extrabold text-green-700">

                            ₹
                            {item.price *
                              item.quantity}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                  {/* TOTAL */}
                  <div className="mt-10 border-t border-gray-200 pt-8 flex justify-between items-center">

                    <h2 className="text-3xl font-bold text-gray-900">

                      Final Total

                    </h2>

                    <h2 className="text-5xl font-extrabold text-green-700">

                      ₹{order.finalTotal}

                    </h2>

                  </div>

                  {/* BUTTONS */}
                  <div className="mt-8 flex flex-col lg:flex-row gap-5">

                    {/* INVOICE */}
                    <button
                      onClick={() =>
                        downloadInvoice(
                          order
                        )
                      }
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition duration-300"
                    >

                      <FaFileInvoice />

                      Download Invoice

                    </button>

                    {/* CANCEL */}
                    {(order.status ===
                      "Pending" ||

                      order.status ===
                        "Processing") && (

                      <button
                        onClick={() =>
                          cancelOrder(
                            order.id
                          )
                        }
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl text-xl font-bold transition duration-300"
                      >

                        Cancel Order

                      </button>

                    )}

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      </div>

    </section>

  );

}

export default MyOrders;