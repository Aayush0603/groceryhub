import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import {
  FaChartLine,
  FaRupeeSign,
  FaShoppingCart,
  FaBoxOpen,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function AdminAnalytics() {

  // STATES
  const [orders, setOrders] =
    useState([]);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [dailyRevenue, setDailyRevenue] =
    useState(0);

  const [dailyOrders, setDailyOrders] =
    useState(0);

  const [dailyProducts, setDailyProducts] =
    useState([]);

  const [monthlyRevenue, setMonthlyRevenue] =
    useState([]);

  const [statusAnalytics, setStatusAnalytics] =
    useState([]);

  const COLORS = [

    "#22c55e",

    "#3b82f6",

    "#facc15",

    "#8b5cf6",

    "#ef4444",

  ];

  // FETCH ORDERS
  useEffect(() => {

    const unsubscribe =
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

          setOrders(
            fetchedOrders
          );

        }
      );

    return () =>
      unsubscribe();

  }, []);

  // ANALYTICS
  useEffect(() => {

    // DATE
    const formattedDate =
      selectedDate

        ? new Date(
            selectedDate
          ).toLocaleDateString(
            "en-IN"
          )

        : "";

    // DAILY FILTER
    const filteredOrders =
      selectedDate

        ? orders.filter(
            (order) =>

              order.orderDate ===
              formattedDate
          )

        : orders;

    // DAILY REVENUE
    let revenue = 0;

    // PRODUCT SALES
    const productMap = {};

    filteredOrders.forEach(
      (order) => {

        revenue +=
          order.finalTotal || 0;

        order.cartItems?.forEach(
          (item) => {

            productMap[
              item.name
            ] =
              (productMap[
                item.name
              ] || 0) +
              item.quantity;

          }
        );

      }
    );

    setDailyRevenue(
      revenue
    );

    setDailyOrders(
      filteredOrders.length
    );

    // DAILY PRODUCTS
    const productsArray =
      Object.entries(
        productMap
      ).map(
        ([
          name,
          quantity,
        ]) => ({

          name,

          quantity,

        })
      );

    setDailyProducts(
      productsArray
    );

    // MONTHLY REVENUE
    const monthlyMap = {};

    orders.forEach(
      (order) => {

        if (
          order.createdAt
            ?.seconds
        ) {

          const date =
            new Date(
              order.createdAt.seconds *
                1000
            );

          const month =
            date.toLocaleString(
              "default",

              {

                month: "short",

              }
            );

          monthlyMap[
            month
          ] =
            (monthlyMap[
              month
            ] || 0) +
            order.finalTotal;

        }

      }
    );

    const monthlyArray =
      Object.keys(
        monthlyMap
      ).map((month) => ({

        month,

        revenue:
          monthlyMap[
            month
          ],

      }));

    setMonthlyRevenue(
      monthlyArray
    );

    // STATUS ANALYTICS
    const statusMap = {

      Pending: 0,

      Processing: 0,

      Packed: 0,

      "Out for Delivery": 0,

      Delivered: 0,

      Cancelled: 0,

    };

    orders.forEach(
      (order) => {

        if (
          statusMap[
            order.status
          ] !== undefined
        ) {

          statusMap[
            order.status
          ]++;

        }

      }
    );

    const statusArray =
      Object.keys(
        statusMap
      ).map((status) => ({

        name: status,

        value:
          statusMap[
            status
          ],

      }));

    setStatusAnalytics(
      statusArray
    );

  }, [
    orders,
    selectedDate,
  ]);

  return (

    <section className="min-h-screen bg-gray-100 p-6 lg:p-10">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 mb-12">

        <div>

          <h1 className="text-5xl font-extrabold text-gray-900">

            Advanced Analytics 📈

          </h1>

          <p className="text-gray-600 mt-3 text-lg">

            Business intelligence and sales insights.

          </p>

        </div>

        {/* DATE FILTER */}
        <div className="bg-white rounded-3xl shadow-xl p-6">

          <p className="font-bold text-gray-700 mb-3">

            Filter By Date

          </p>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) =>
              setSelectedDate(
                e.target.value
              )
            }
            className="border border-gray-300 rounded-2xl px-5 py-3 outline-none"
          />

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        {/* REVENUE */}
        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="w-16 h-16 rounded-2xl bg-green-500 text-white flex items-center justify-center text-3xl mb-6">

            <FaRupeeSign />

          </div>

          <h2 className="text-gray-500 text-lg mb-3">

            Revenue

          </h2>

          <h1 className="text-5xl font-extrabold text-green-700">

            ₹{dailyRevenue}

          </h1>

        </div>

        {/* ORDERS */}
        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-3xl mb-6">

            <FaShoppingCart />

          </div>

          <h2 className="text-gray-500 text-lg mb-3">

            Orders

          </h2>

          <h1 className="text-5xl font-extrabold text-blue-700">

            {dailyOrders}

          </h1>

        </div>

        {/* PRODUCTS */}
        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-3xl mb-6">

            <FaBoxOpen />

          </div>

          <h2 className="text-gray-500 text-lg mb-3">

            Products Sold

          </h2>

          <h1 className="text-5xl font-extrabold text-orange-700">

            {dailyProducts.reduce(
              (
                total,
                item
              ) =>

                total +
                item.quantity,

              0
            )}

          </h1>

        </div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mt-14">

        {/* MONTHLY REVENUE */}
        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="flex items-center gap-4 mb-10">

            <FaChartLine className="text-4xl text-green-600" />

            <h2 className="text-3xl font-bold text-gray-900">

              Monthly Revenue

            </h2>

          </div>

          <div className="w-full h-[400px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={
                  monthlyRevenue
                }
              >

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="revenue"
                  radius={[
                    10,
                    10,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* STATUS ANALYTICS */}
        <div className="bg-white rounded-3xl shadow-xl p-8">

          <h2 className="text-3xl font-bold text-gray-900 mb-10">

            Order Status Analytics

          </h2>

          <div className="w-full h-[400px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={
                    statusAnalytics
                  }
                  dataKey="value"
                  nameKey="name"
                  outerRadius={140}
                  label
                >

                  {statusAnalytics.map(
                    (
                      entry,
                      index
                    ) => (

                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

      {/* DAILY PRODUCT SALES */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mt-14">

        <h2 className="text-4xl font-extrabold text-gray-900 mb-10">

          Product Sales Analytics

        </h2>

        {dailyProducts.length ===
          0 && (

          <div className="text-center py-20">

            <h3 className="text-3xl font-bold text-gray-400">

              No Product Sales Found

            </h3>

          </div>

        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {dailyProducts.map(
            (
              product,
              index
            ) => (

              <div
                key={index}
                className="bg-gray-50 rounded-3xl p-6"
              >

                <h3 className="text-2xl font-bold text-gray-900">

                  {product.name}

                </h3>

                <p className="text-gray-500 mt-3">

                  Quantity Sold

                </p>

                <h2 className="text-5xl font-extrabold text-green-700 mt-5">

                  {
                    product.quantity
                  }

                </h2>

              </div>

            )
          )}

        </div>

      </div>

    </section>

  );

}

export default AdminAnalytics;