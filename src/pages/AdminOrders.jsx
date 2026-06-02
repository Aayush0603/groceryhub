import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import {
  FaShoppingBag,
  FaUser,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaClock,
  FaTruck,
} from "react-icons/fa";

function AdminOrders() {

  // ORDERS
  const [orders, setOrders] =
    useState([]);

  // STATUS FILTER
  const [statusFilter, setStatusFilter] =
    useState("All");

  // DATE FILTER
  const [selectedDate, setSelectedDate] =
    useState("");

  // LOADING
  const [loading, setLoading] =
    useState(true);

  // REALTIME FETCH
  useEffect(() => {

    const unsubscribe =
      onSnapshot(

        collection(
          db,
          "orders"
        ),

        (snapshot) => {

          try {

            const fetchedOrders =
              snapshot.docs.map(
                (doc) => ({

                  id: doc.id,

                  ...doc.data(),

                })
              );

            // LATEST FIRST
            const sortedOrders =
              fetchedOrders.sort(
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

  }, []);

  // UPDATE STATUS
  const updateStatus =
    async (
      id,
      status
    ) => {

      try {

        const orderRef =
          doc(
            db,
            "orders",
            id
          );

        // ETA LOGIC
        let estimatedDelivery =
          "";

        switch (status) {

          case "Pending":

            estimatedDelivery =
              "45 mins";

            break;

          case "Processing":

            estimatedDelivery =
              "35 mins";

            break;

          case "Packed":

            estimatedDelivery =
              "20 mins";

            break;

          case "Out for Delivery":

            estimatedDelivery =
              "10 mins";

            break;

          case "Delivered":

            estimatedDelivery =
              "Delivered";

            break;

          case "Cancelled":

            estimatedDelivery =
              "Cancelled";

            break;

          default:

            estimatedDelivery =
              "45 mins";

        }

        // UPDATE ORDER
        await updateDoc(

          orderRef,

          {

            status,

            estimatedDelivery,

            lastUpdated:
              new Date().toLocaleString(
                "en-IN",

                {

                  timeZone:
                    "Asia/Kolkata",

                }
              ),

          }
        );

      } catch (error) {

        console.error(
          error
        );

      }

    };

  // FILTER ORDERS
  const filteredOrders =
    orders.filter(
      (order) => {

        // STATUS FILTER
        const matchesStatus =
          statusFilter ===
          "All"

            ? true

            : order.status ===
              statusFilter;

        // DATE FILTER
        const matchesDate =
          selectedDate ===
          ""

            ? true

            : order.orderDate ===
              new Date(
                selectedDate
              ).toLocaleDateString(
                "en-IN"
              );

        return (
          matchesStatus &&
          matchesDate
        );

      }
    );

  // TOTAL ORDERS
  const totalOrders =
    filteredOrders.length;

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

  // LOADING
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-3xl font-bold">

        Loading Orders...

      </div>

    );

  }

  return (

    <section className="min-h-screen bg-gray-100 p-6 lg:p-10">

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-12">

        <div>

          <h1 className="text-3xl font-extrabold text-gray-900">

            Orders Management 📦

          </h1>

          <p className="text-gray-600 mt-3 text-lg">

            Manage customer orders and deliveries.

          </p>

        </div>

        {/* HEADER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-stretch gap-6 w-full xl:w-auto">

          {/* TOTAL ORDERS */}
          <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center justify-between gap-6 min-w-[220px] flex-1 sm:flex-none">

            <div>

              <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider">

                Total Orders

              </h2>

              <h1 className="text-4xl font-extrabold text-gray-900 mt-2">

                {totalOrders}

              </h1>

            </div>

            <div className="p-3.5 bg-green-50 rounded-xl">

              <FaShoppingBag className="text-3xl text-green-600" />

            </div>

          </div>

          {/* DATE FILTER */}
          <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col justify-center gap-3 flex-1 sm:flex-none min-w-[240px]">

            <div className="flex flex-col gap-1.5">

              <label className="font-bold text-xs uppercase tracking-wider text-gray-500">

                Filter By Date

              </label>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(
                    e.target.value
                  )
                }
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none font-semibold text-gray-700 bg-gray-50 focus:bg-white focus:border-gray-300 transition"
              />

            </div>

            {selectedDate && (

              <button
                onClick={() =>
                  setSelectedDate("")
                }
                className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm font-bold transition duration-300"
              >

                Clear Filter

              </button>

            )}

          </div>

        </div>

      </div>

      {/* FILTER BUTTONS */}
      <div className="flex flex-wrap gap-4 mb-10">

        {[
          "All",
          "Pending",
          "Processing",
          "Packed",
          "Out for Delivery",
          "Delivered",
          "Cancelled",
        ].map((status) => (

          <button
            key={status}
            onClick={() =>
              setStatusFilter(
                status
              )
            }
            className={`px-5 py-3 rounded-2xl font-bold transition duration-300
            ${
              statusFilter ===
              status

                ? "bg-gray-900 text-white"

                : "bg-white text-gray-700 hover:bg-gray-200"
            }`}
          >

            {status}

          </button>

        ))}

      </div>

      {/* NO ORDERS */}
      {filteredOrders.length ===
        0 && (

        <div className="bg-white rounded-3xl shadow-xl p-20 text-center">

          <FaShoppingBag className="text-7xl text-gray-300 mx-auto mb-6" />

          <h2 className="text-4xl font-bold text-gray-800">

            No Orders Found

          </h2>

          <p className="text-gray-500 mt-4">

            No orders available.

          </p>

        </div>

      )}

      {/* ORDERS */}
      <div className="space-y-6">

        {filteredOrders.map(
          (order) => (

            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
            >

              {/* TOP */}
              <div className="bg-gray-900 text-white px-5 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

                <div>

                  <h2 className="text-xs uppercase tracking-wider text-gray-400 font-bold">

                    Order ID

                  </h2>

                  <p className="text-base font-semibold text-gray-100 break-all sm:break-normal">

                    {order.id}

                  </p>

                </div>

                {/* STATUS */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">

                  <div
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-sm ${getStatusStyle(order.status)}`}
                  >

                    {order.status}

                  </div>

                  <select
                    value={
                      order.status
                    }
                    onChange={(e) =>
                      updateStatus(
                        order.id,
                        e.target.value
                      )
                    }
                    className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-3.5 py-2 outline-none text-white text-sm font-semibold cursor-pointer transition"
                  >

                    <option className="text-gray-800">

                      Pending

                    </option>

                    <option className="text-gray-800">

                      Processing

                    </option>

                    <option className="text-gray-800">

                      Packed

                    </option>

                    <option className="text-gray-800">

                      Out for Delivery

                    </option>

                    <option className="text-gray-800">

                      Delivered

                    </option>

                    <option className="text-gray-800">

                      Cancelled

                    </option>

                  </select>

                </div>

              </div>

              {/* CONTENT */}
              <div className="p-5">

                {/* DATE TIME ETA */}
                <div className="flex flex-wrap gap-3 mb-5">

                  {/* DATE */}
                  <div className="bg-green-50 rounded-xl px-4 py-2 flex items-center gap-3 border border-green-100/30">

                    <FaCalendarAlt className="text-green-700 text-lg" />

                    <div>

                      <p className="text-xs text-gray-400 uppercase tracking-wider">

                        Order Date

                      </p>

                      <h3 className="font-bold text-base text-gray-800">

                        {order.orderDate}

                      </h3>

                    </div>

                  </div>

                  {/* TIME */}
                  <div className="bg-blue-50 rounded-xl px-4 py-2 flex items-center gap-3 border border-blue-100/30">

                    <FaClock className="text-blue-700 text-lg" />

                    <div>

                      <p className="text-xs text-gray-400 uppercase tracking-wider">

                        Order Time

                      </p>

                      <h3 className="font-bold text-base text-gray-800">

                        {order.orderTime}

                      </h3>

                    </div>

                  </div>

                  {/* ETA */}
                  <div className="bg-orange-50 rounded-xl px-4 py-2 flex items-center gap-3 border border-orange-100/30">

                    <FaTruck className="text-orange-700 text-lg" />

                    <div>

                      <p className="text-xs text-gray-400 uppercase tracking-wider">

                        Estimated Delivery

                      </p>

                      <h3 className="font-bold text-base text-orange-700">

                        {order.estimatedDelivery ||
                          "45 mins"}

                      </h3>

                    </div>

                  </div>

                </div>

                {/* CUSTOMER */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">

                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100/50">

                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider mb-1.5">

                      <FaUser />

                      Customer

                    </div>

                    <h3 className="text-base font-semibold text-gray-800">

                      {order.customerInfo?.name}

                    </h3>

                  </div>

                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100/50">

                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider mb-1.5">

                      <FaPhoneAlt />

                      Phone

                    </div>

                    <h3 className="text-base font-semibold text-gray-800">

                      {order.customerInfo?.phone}

                    </h3>

                  </div>

                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100/50 md:col-span-2">

                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider mb-1.5">

                      <FaMapMarkerAlt />

                      Delivery Address

                    </div>

                    <h3 className="text-sm font-semibold text-gray-800 leading-relaxed">

                      {order.customerInfo?.address},{" "}
                      {order.customerInfo?.city} -{" "}
                      {order.customerInfo?.pincode}

                    </h3>

                  </div>

                </div>

                {/* PRODUCTS */}
                <div>

                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">

                    Ordered Products

                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">

                    {order.cartItems?.map(
                      (item) => (

                        <div
                          key={item.id}
                          className="bg-gray-50 rounded-xl p-3 flex justify-between items-center gap-4 border border-gray-100/50"
                        >

                          <div>

                            <h3 className="text-base font-semibold text-gray-800">

                              {item.name}

                            </h3>

                            <p className="text-sm text-gray-500 mt-0.5">

                              Quantity:
                              {" "}
                              {item.quantity}

                            </p>

                          </div>

                          <div className="flex items-center gap-1.5 text-green-700 font-bold text-base">

                            <FaMoneyBillWave className="text-sm" />

                            ₹
                            {item.price *
                              item.quantity}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

                {/* TOTAL */}
                <div className="mt-5 border-t border-gray-100 pt-4 flex justify-between items-center">

                  <h2 className="text-base font-bold text-gray-800">

                    Final Total

                  </h2>

                  <h2 className="text-3xl font-extrabold text-green-700">

                    ₹{order.finalTotal}

                  </h2>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </section>

  );

}

export default AdminOrders;