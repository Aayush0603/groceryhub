import {
  Link,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  FaChartPie,
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";

function AdminLayout() {

  const location = useLocation();

  // ACTIVE MENU STYLE
  const activeClass =
    "bg-gray-800 text-white shadow-lg";

  // NORMAL MENU STYLE
  const normalClass =
    "text-gray-300 hover:bg-gray-800";

  return (

    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-72 bg-gray-950 text-white p-8 flex flex-col">

        {/* LOGO */}
        <div className="mb-14">

          <h1 className="text-5xl font-extrabold text-green-400 tracking-tight">

            GroceryHub

          </h1>

          <p className="text-gray-400 mt-3">

            Admin Panel

          </p>

        </div>

        {/* MENU */}
        <div className="space-y-4">

          {/* DASHBOARD */}
          <Link
            to="/admin"
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition duration-300 font-semibold
            ${
              location.pathname ===
              "/admin"

                ? activeClass

                : normalClass
            }`}
          >

            <FaChartPie className="text-xl" />

            Dashboard

          </Link>

          {/* ANALYTICS */}
          <Link
            to="/admin/analytics"
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition duration-300 font-semibold
            ${
              location.pathname ===
              "/admin/analytics"

                ? activeClass

                : normalClass
            }`}
          >

            <FaChartLine className="text-xl" />

            Analytics

          </Link>

          {/* PRODUCTS */}
          <Link
            to="/admin/products"
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition duration-300 font-semibold
            ${
              location.pathname ===
              "/admin/products"

                ? activeClass

                : normalClass
            }`}
          >

            <FaBoxOpen className="text-xl" />

            Products

          </Link>

          {/* ORDERS */}
          <Link
            to="/admin/orders"
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition duration-300 font-semibold
            ${
              location.pathname ===
              "/admin/orders"

                ? activeClass

                : normalClass
            }`}
          >

            <FaShoppingCart className="text-xl" />

            Orders

          </Link>

          {/* CUSTOMERS */}
          <Link
            to="/admin/customers"
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition duration-300 font-semibold
            ${
              location.pathname ===
              "/admin/customers"

                ? activeClass

                : normalClass
            }`}
          >

            <FaUsers className="text-xl" />

            Customers

          </Link>

        </div>

        {/* FOOTER */}
        <div className="mt-auto pt-10">

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">

            <h2 className="text-xl font-bold text-white">

              GroceryHub CMS

            </h2>

            <p className="text-gray-400 mt-2 text-sm leading-6">

              Manage products, orders,
              customers, analytics, and
              business growth professionally.

            </p>

          </div>

        </div>

      </div>

      {/* PAGE CONTENT */}
      <div className="flex-1 overflow-y-auto">

        <Outlet />

      </div>

    </div>

  );

}

export default AdminLayout;