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

          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900">

            Orders Management 📦

          </h1>

          <p className="text-gray-600 mt-3 text-lg">

            Manage customer orders and deliveries.

          </p>

        </div>

        {/* DATE FILTER */}
        <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-4">

          <label className="font-bold text-gray-700">

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
            className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
          />

          {selectedDate && (

            <button
              onClick={() =>
                setSelectedDate("")
              }
              className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-bold transition duration-300"
            >

              Clear Filter

            </button>

          )}

        </div>

      </div>

      {/* TOTAL ORDERS */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 flex justify-between items-center">

        <div>

          <h2 className="text-gray-500 text-xl">

            Total Orders

          </h2>

          <h1 className="text-5xl font-extrabold text-gray-900 mt-3">

            {totalOrders}

          </h1>

        </div>

        <FaShoppingBag className="text-6xl text-green-600" />

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
      <div className="space-y-10">

        {filteredOrders.map(
          (order) => (

            <div
              key={order.id}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >

              {/* TOP */}
              <div className="bg-gray-900 text-white px-8 py-5 flex flex-col lg:flex-row justify-between gap-5">

                <div>

                  <h2 className="text-2xl font-bold">

                    Order ID

                  </h2>

                  <p className="text-gray-300 mt-1 break-all">

                    {order.id}

                  </p>

                </div>

                {/* STATUS */}
                <div className="flex flex-col lg:items-end gap-4">

                  <div
                    className={`px-6 py-3 rounded-2xl font-bold text-lg ${getStatusStyle(order.status)}`}
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
                    className="bg-white border border-gray-200 rounded-2xl px-5 py-3 outline-none text-gray-800 font-semibold"
                  >

                    <option>

                      Pending

                    </option>

                    <option>

                      Processing

                    </option>

                    <option>

                      Packed

                    </option>

                    <option>

                      Out for Delivery

                    </option>

                    <option>

                      Delivered

                    </option>

                    <option>

                      Cancelled

                    </option>

                  </select>

                </div>

              </div>

              {/* CONTENT */}
              <div className="p-8">

                {/* DATE TIME ETA */}
                <div className="flex flex-wrap gap-6 mb-8">

                  {/* DATE */}
                  <div className="bg-green-50 rounded-2xl px-6 py-4 flex items-center gap-4">

                    <FaCalendarAlt className="text-green-700 text-2xl" />

                    <div>

                      <p className="text-gray-500">

                        Order Date

                      </p>

                      <h3 className="font-bold text-lg">

                        {order.orderDate}

                      </h3>

                    </div>

                  </div>

                  {/* TIME */}
                  <div className="bg-blue-50 rounded-2xl px-6 py-4 flex items-center gap-4">

                    <FaClock className="text-blue-700 text-2xl" />

                    <div>

                      <p className="text-gray-500">

                        Order Time

                      </p>

                      <h3 className="font-bold text-lg">

                        {order.orderTime}

                      </h3>

                    </div>

                  </div>

                  {/* ETA */}
                  <div className="bg-orange-50 rounded-2xl px-6 py-4 flex items-center gap-4">

                    <FaTruck className="text-orange-700 text-2xl" />

                    <div>

                      <p className="text-gray-500">

                        Estimated Delivery

                      </p>

                      <h3 className="font-bold text-lg text-orange-700">

                        {order.estimatedDelivery ||
                          "45 mins"}

                      </h3>

                    </div>

                  </div>

                </div>

                {/* CUSTOMER */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

                  <div className="bg-gray-50 rounded-2xl p-5">

                    <div className="flex items-center gap-3 text-gray-500 mb-3">

                      <FaUser />

                      Customer

                    </div>

                    <h3 className="text-xl font-bold text-gray-900">

                      {order.customerInfo?.name}

                    </h3>

                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5">

                    <div className="flex items-center gap-3 text-gray-500 mb-3">

                      <FaPhoneAlt />

                      Phone

                    </div>

                    <h3 className="text-xl font-bold text-gray-900">

                      {order.customerInfo?.phone}

                    </h3>

                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 md:col-span-2">

                    <div className="flex items-center gap-3 text-gray-500 mb-3">

                      <FaMapMarkerAlt />

                      Delivery Address

                    </div>

                    <h3 className="text-lg font-bold text-gray-900 leading-8">

                      {order.customerInfo?.address},{" "}
                      {order.customerInfo?.city} -{" "}
                      {order.customerInfo?.pincode}

                    </h3>

                  </div>

                </div>

                {/* PRODUCTS */}
                <div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-8">

                    Ordered Products

                  </h2>

                  <div className="space-y-5">

                    {order.cartItems?.map(
                      (item) => (

                        <div
                          key={item.id}
                          className="bg-gray-50 rounded-2xl p-6 flex flex-col lg:flex-row justify-between gap-5"
                        >

                          <div>

                            <h3 className="text-2xl font-bold text-gray-900">

                              {item.name}

                            </h3>

                            <p className="text-gray-500 mt-2 text-lg">

                              Quantity:
                              {" "}
                              {item.quantity}

                            </p>

                          </div>

                          <div className="flex items-center gap-3 text-green-700 font-extrabold text-3xl">

                            <FaMoneyBillWave />

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
                <div className="mt-10 border-t border-gray-200 pt-8 flex justify-between items-center">

                  <h2 className="text-3xl font-bold text-gray-900">

                    Final Total

                  </h2>

                  <h2 className="text-5xl font-extrabold text-green-700">

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