import { motion } from "framer-motion";

import {
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaRupeeSign,
  FaTruck,
  FaClock,
} from "react-icons/fa";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
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
} from "recharts";

function AdminDashboard() {

  // PRODUCTS COUNT
  const [productCount, setProductCount] =
    useState(0);

  // TOTAL ORDERS
  const [orderCount, setOrderCount] =
    useState(0);

  // TOTAL REVENUE
  const [totalRevenue, setTotalRevenue] =
    useState(0);

  // TOTAL CUSTOMERS
  const [customerCount, setCustomerCount] =
    useState(0);

  // DELIVERED ORDERS
  const [deliveredOrders, setDeliveredOrders] =
    useState(0);

  // PENDING ORDERS
  const [pendingOrders, setPendingOrders] =
    useState(0);

  // CHART DATA
  const [chartData, setChartData] =
    useState([]);

  // BEST SELLING PRODUCTS
  const [topProducts, setTopProducts] =
    useState([]);

  // FETCH DASHBOARD DATA
  useEffect(() => {

    const fetchDashboardData =
      async () => {

        try {

          // PRODUCTS
          const productsSnapshot =
            await getDocs(
              collection(db, "products")
            );

          setProductCount(
            productsSnapshot.size
          );

          // ORDERS
          const ordersSnapshot =
            await getDocs(
              collection(db, "orders")
            );

          const orders =
            ordersSnapshot.docs.map(
              (doc) => doc.data()
            );

          setOrderCount(
            orders.length
          );

          // CUSTOMERS
          const customersSnapshot =
            await getDocs(
              collection(db, "users")
            );

          setCustomerCount(
            customersSnapshot.size
          );

          // REVENUE
          let revenue = 0;

          // STATUS COUNTS
          let delivered = 0;

          let pending = 0;

          // MONTHLY SALES
          const monthlySales = {};

          // TOP PRODUCTS
          const productSales = {};

          orders.forEach((order) => {

            revenue +=
              order.finalTotal || 0;

            // ORDER STATUS
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

              monthlySales[month] =
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

          });

          setTotalRevenue(revenue);

          setDeliveredOrders(
            delivered
          );

          setPendingOrders(
            pending
          );

          // CHART DATA
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

          setChartData(chartArray);

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

        } catch (error) {

          console.error(error);

        }

      };

    fetchDashboardData();

  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

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
              delay: index * 0.1,
            }}
            className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition duration-300"
          >

            {/* ICON */}
            <div className={`w-16 h-16 rounded-2xl ${item.color} text-white flex items-center justify-center text-3xl mb-6`}>

              {item.icon}

            </div>

            {/* TITLE */}
            <h2 className="text-gray-500 text-lg mb-3">

              {item.title}

            </h2>

            {/* VALUE */}
            <h1 className="text-5xl font-extrabold text-gray-900">

              {item.value}

            </h1>

          </motion.div>

        ))}

      </div>

      {/* CHART + TOP PRODUCTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mt-14">

        {/* REVENUE CHART */}
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

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                />

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

        {/* TOP PRODUCTS */}
        <div className="bg-white rounded-3xl shadow-xl p-8">

          <h2 className="text-3xl font-bold text-gray-900 mb-10">

            Best Selling Products

          </h2>

          <div className="space-y-6">

            {topProducts.map(
              (
                product,
                index
              ) => (

                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 rounded-2xl p-5"
                >

                  <div>

                    <h3 className="text-xl font-bold text-gray-900">

                      {product.name}

                    </h3>

                    <p className="text-gray-500 mt-2">

                      Total Sold

                    </p>

                  </div>

                  <div className="text-3xl font-extrabold text-green-700">

                    {product.quantity}

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </div>

    </section>

  );

}

export default AdminDashboard;