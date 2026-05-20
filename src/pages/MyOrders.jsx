import {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  db,
} from "../firebase/firebase";

import { AuthContext } from "../context/AuthContext";

import {
  FaShoppingBag,
  FaCheckCircle,
} from "react-icons/fa";

function MyOrders() {

  // CURRENT USER
  const { currentUser } =
    useContext(AuthContext);

  // ORDERS
  const [orders, setOrders] =
    useState([]);

  // LOADING
  const [loading, setLoading] =
    useState(true);

  // FETCH ORDERS
  const fetchOrders = async () => {

    try {

      const querySnapshot =
        await getDocs(
          collection(db, "orders")
        );

      const allOrders =
        querySnapshot.docs.map(
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
            currentUser?.uid
        );

      const sortedOrders =
  userOrders.sort(
    (a, b) => {

      const aTime =
        a.createdAt?.seconds || 0;

      const bTime =
        b.createdAt?.seconds || 0;

      return bTime - aTime;

    }
  );

setOrders(sortedOrders);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  // LOAD ORDERS
  useEffect(() => {

    if (currentUser) {

      fetchOrders();

    }

  }, [currentUser]);

  // ORDER TRACKING STEPS
  const trackingSteps = [

    "Pending",

    "Processing",

    "Packed",

    "Out for Delivery",

    "Delivered",

  ];

  // STATUS COLORS
  const getStatusStyle = (
    status
  ) => {

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

    <section className="min-h-screen bg-gray-100 py-28 px-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-14">

          <h1 className="text-5xl font-extrabold text-gray-900">

            My Orders 📦

          </h1>

          <p className="text-gray-600 mt-4 text-lg">

            Track your grocery orders live.

          </p>

        </div>

        {/* EMPTY */}
        {orders.length === 0 && (

          <div className="bg-white rounded-3xl shadow-xl p-20 text-center">

            <FaShoppingBag className="text-7xl text-gray-300 mx-auto mb-8" />

            <h2 className="text-4xl font-bold text-gray-800">

              No Orders Found

            </h2>

            <p className="text-gray-500 mt-4 text-lg">

              Place an order to see it here.

            </p>

          </div>

        )}

        {/* ORDERS */}
        <div className="space-y-10">

          {orders.map((order) => {

            const currentStep =
              trackingSteps.indexOf(
                order.status
              );

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

                  {/* STATUS */}
                  <div
                    className={`px-6 py-3 rounded-2xl font-bold text-lg ${getStatusStyle(order.status)}`}
                  >

                    {order.status}

                  </div>

                </div>

                {/* TRACKING */}
                {order.status !==
                  "Cancelled" && (

                  <div className="px-8 py-10 border-b border-gray-200">

                    <h2 className="text-3xl font-bold text-gray-900 mb-10">

                      Order Tracking

                    </h2>

                    <div className="flex flex-wrap justify-between gap-6">

                      {trackingSteps.map(
                        (
                          step,
                          index
                        ) => (

                          <div
                            key={step}
                            className="flex flex-col items-center flex-1 min-w-[120px]"
                          >

                            {/* CIRCLE */}
                            <div
                              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                              ${
                                index <=
                                currentStep
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-500"
                              }`}
                            >

                              <FaCheckCircle />

                            </div>

                            {/* TEXT */}
                            <p
                              className={`mt-4 text-center font-bold
                              ${
                                index <=
                                currentStep
                                  ? "text-green-700"
                                  : "text-gray-500"
                              }`}
                            >

                              {step}

                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

                {/* PRODUCTS */}
                <div className="p-8">

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

                          <div className="text-green-700 font-extrabold text-3xl">

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