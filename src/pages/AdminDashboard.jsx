import { motion } from "framer-motion";

import {
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaRupeeSign,
  FaTruck,
  FaClock,
  FaChartLine,
} from "react-icons/fa";

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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function AdminDashboard() {

  // STATES
  const [productCount, setProductCount] =
    useState(0);

  const [orderCount, setOrderCount] =
    useState(0);

  const [totalRevenue, setTotalRevenue] =
    useState(0);

  const [customerCount, setCustomerCount] =
    useState(0);

  const [deliveredOrders, setDeliveredOrders] =
    useState(0);

  const [pendingOrders, setPendingOrders] =
    useState(0);

  const [todayRevenue, setTodayRevenue] =
    useState(0);

  const [averageOrderValue, setAverageOrderValue] =
    useState(0);

  const [chartData, setChartData] =
    useState([]);

  const [topProducts, setTopProducts] =
    useState([]);

  const [statusData, setStatusData] =
    useState([]);

  // COLORS
  const COLORS = [
    "#22c55e",
    "#facc15",
    "#3b82f6",
    "#8b5cf6",
    "#ef4444",
  ];

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

          try {

            const orders =
              snapshot.docs.map(
                (doc) => doc.data()
              );

            setOrderCount(
              orders.length
            );

            let revenue = 0;

            let delivered = 0;

            let pending = 0;

            let todaySales = 0;

            const monthlySales = {};

            const productSales = {};

            const statusCounts = {

              Pending: 0,

              Processing: 0,

              Packed: 0,

              "Out for Delivery": 0,

              Delivered: 0,

              Cancelled: 0,

            };

            const today =
              new Date().toLocaleDateString(
                "en-IN"
              );

            orders.forEach(
              (order) => {

                revenue +=
                  order.finalTotal || 0;

                // TODAY REVENUE
                if (
                  order.orderDate ===
                  today
                ) {

                  todaySales +=
                    order.finalTotal || 0;

                }

                // STATUS COUNTS
                if (
                  order.status ===
                  "Delivered"
                ) {

                  delivered++;

                }

                if (
                  order.status ===
                  "Pending"
                ) {

                  pending++;

                }

                // PIE CHART
                if (
                  statusCounts[
                    order.status
                  ] !== undefined
                ) {

                  statusCounts[
                    order.status
                  ]++;

                }

                // MONTHLY SALES
                if (
                  order.createdAt?.seconds
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

                  monthlySales[
                    month
                  ] =
                    (monthlySales[
                      month
                    ] || 0) +
                    order.finalTotal;

                }

                // TOP PRODUCTS
                order.cartItems?.forEach(
                  (item) => {

                    productSales[
                      item.name
                    ] =
                      (productSales[
                        item.name
                      ] || 0) +
                      item.quantity;

                  }
                );

              }
            );

            setTotalRevenue(
              revenue
            );

            setDeliveredOrders(
              delivered
            );

            setPendingOrders(
              pending
            );

            setTodayRevenue(
              todaySales
            );

            setAverageOrderValue(
              orders.length > 0
                ? Math.round(
                    revenue /
                      orders.length
                  )
                : 0
            );

            // BAR CHART
            const chartArray =
              Object.keys(
                monthlySales
              ).map((month) => ({

                month,

                revenue:
                  monthlySales[
                    month
                  ],

              }));

            setChartData(
              chartArray
            );

            // TOP PRODUCTS
            const topProductsArray =
              Object.entries(
                productSales
              )
                .map(
                  ([
                    name,
                    quantity,
                  ]) => ({

                    name,

                    quantity,

                  })
                )
                .sort(
                  (a, b) =>

                    b.quantity -
                    a.quantity
                )
                .slice(0, 5);

            setTopProducts(
              topProductsArray
            );

            // PIE DATA
            const pieData =
              Object.keys(
                statusCounts
              ).map((status) => ({

                name: status,

                value:
                  statusCounts[
                    status
                  ],

              }));

            setStatusData(
              pieData
            );

          } catch (error) {

            console.error(
              error
            );

          }

        }
      );

    return () => {

      unsubscribeProducts();

      unsubscribeUsers();

      unsubscribeOrders();

    };

  }, []);

  // STATS
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

    {
      title: "Today's Revenue",
      value: `₹${todayRevenue}`,
      icon: <FaChartLine />,
      color: "bg-pink-500",
    },

    {
      title: "Average Order",
      value: `₹${averageOrderValue}`,
      icon: <FaTruck />,
      color: "bg-cyan-500",
    },

    {
      title: "Delivered",
      value: deliveredOrders,
      icon: <FaTruck />,
      color: "bg-emerald-500",
    },

    {
      title: "Pending",
      value: pendingOrders,
      icon: <FaClock />,
      color: "bg-yellow-500",
    },

  ];

  return (

    <section className="min-h-screen bg-gray-100 p-6 lg:p-10">

      {/* HEADER */}
      <div className="mb-12">

        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900">

          Admin Dashboard 📊

        </h1>

        <p className="text-gray-600 mt-3 text-lg">

          Monitor your grocery business performance.

        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

        {stats.map((item, index) => (

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
              delay: index * 0.05,
            }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >

            <div className={`w-16 h-16 rounded-2xl ${item.color} text-white flex items-center justify-center text-3xl mb-6`}>

              {item.icon}

            </div>

            <h2 className="text-gray-500 text-lg mb-3">

              {item.title}

            </h2>

            <h1 className="text-5xl font-extrabold text-gray-900">

              {item.value}

            </h1>

          </motion.div>

        ))}

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mt-14">

        {/* BAR CHART */}
        <div className="bg-white rounded-3xl shadow-xl p-8">

          <h2 className="text-3xl font-bold text-gray-900 mb-10">

            Monthly Revenue

          </h2>

          <div className="w-full h-[400px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={chartData}
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

        {/* PIE CHART */}
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
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={140}
                  label
                >

                  {statusData.map(
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

      {/* TOP PRODUCTS */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mt-14">

        <h2 className="text-3xl font-bold text-gray-900 mb-10">

          Best Selling Products

        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {topProducts.map(
            (
              product,
              index
            ) => (

              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-6"
              >

                <h3 className="text-2xl font-bold text-gray-900">

                  {product.name}

                </h3>

                <p className="text-gray-500 mt-2">

                  Total Sold

                </p>

                <div className="text-4xl font-extrabold text-green-700 mt-4">

                  {product.quantity}

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </section>

  );

}

export default AdminDashboard;