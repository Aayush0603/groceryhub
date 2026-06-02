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

    <section className="min-h-screen bg-gray-50 p-4 lg:p-6">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">

        <div>

          <h1 className="text-3xl font-extrabold text-gray-900">

            Advanced Analytics 📈

          </h1>

          <p className="text-gray-500 mt-1 text-sm">

            Business intelligence and sales insights.

          </p>

        </div>

        {/* DATE FILTER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">

          <p className="text-sm font-bold text-gray-700">

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
            className="border border-gray-200 rounded-xl px-4 py-2 outline-none text-sm text-gray-800 focus:border-blue-500 transition"
          />

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        {/* REVENUE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5 hover:shadow-md transition duration-300">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">

                Revenue

              </h2>

              <h1 className="text-3xl font-extrabold text-gray-900">

                ₹{dailyRevenue}

              </h1>
            </div>

            <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center text-2xl shadow-sm shadow-green-500/20">

              <FaRupeeSign />

            </div>
          </div>

        </div>

        {/* ORDERS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5 hover:shadow-md transition duration-300">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">

                Orders

              </h2>

              <h1 className="text-3xl font-extrabold text-gray-900">

                {dailyOrders}

              </h1>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center text-2xl shadow-sm shadow-blue-500/20">

              <FaShoppingCart />

            </div>
          </div>

        </div>

        {/* PRODUCTS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5 hover:shadow-md transition duration-300">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">

                Products Sold

              </h2>

              <h1 className="text-3xl font-extrabold text-gray-900">

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

            <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center text-2xl shadow-sm shadow-orange-500/20">

              <FaBoxOpen />

            </div>
          </div>

        </div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* MONTHLY REVENUE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          <div className="flex items-center gap-3 mb-6">

            <FaChartLine className="text-xl text-green-600" />

            <h2 className="text-lg font-bold text-gray-900">

              Monthly Revenue

            </h2>

          </div>

          <div className="w-full h-[300px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={
                  monthlyRevenue
                }
              >

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />

                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />

                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />

                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />

                <Bar
                  dataKey="revenue"
                  fill="#3b82f6"
                  radius={[
                    6,
                    6,
                    6,
                    6,
                  ]}
                  barSize={40}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* STATUS ANALYTICS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          <h2 className="text-lg font-bold text-gray-900 mb-6">

            Order Status Analytics

          </h2>

          <div className="w-full h-[300px]">

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
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  stroke="none"
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

                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />

                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', color: '#6b7280'}} />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

      {/* DAILY PRODUCT SALES */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">

        <h2 className="text-xl font-bold text-gray-900 mb-6">

          Product Sales Analytics

        </h2>

        {dailyProducts.length ===
          0 && (

          <div className="text-center py-10">

            <h3 className="text-lg font-semibold text-gray-400">

              No Product Sales Found

            </h3>

          </div>

        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {dailyProducts.map(
            (
              product,
              index
            ) => (

              <div
                key={index}
                className="bg-gray-50 border border-gray-100/50 rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition"
              >

                <div>
                  <h3 className="text-base font-semibold text-gray-800">

                    {product.name}

                  </h3>

                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">

                    Quantity Sold

                  </p>
                </div>

                <div className="bg-white border border-green-100 shadow-sm w-12 h-12 flex items-center justify-center rounded-xl">
                  <h2 className="text-xl font-extrabold text-green-600">

                    {
                      product.quantity
                    }

                  </h2>
                </div>

              </div>

            )
          )}

        </div>

      </div>

    </section>

  );

}

export default AdminAnalytics;