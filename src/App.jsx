import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  FaBars,
  FaTimes,
} from "react-icons/fa";

import { signOut } from "firebase/auth";

import { auth } from "./firebase/firebase";

import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";

import WhatsAppButton from "./components/WhatsAppButton";

import Loader from "./components/Loader";

import ProtectedRoute from "./components/ProtectedRoute";

import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";

import Cart from "./pages/Cart";

import Checkout from "./pages/Checkout";

import Login from "./pages/Login";

import Signup from "./pages/Signup";

import AdminDashboard from "./pages/AdminDashboard";

import AdminAnalytics from "./pages/AdminAnalytics";

import AdminProducts from "./pages/AdminProducts";

import AdminOrders from "./pages/AdminOrders";

import AdminCustomers from "./pages/AdminCustomers";

import MyOrders from "./pages/MyOrders";

import Profile from "./pages/Profile";

import { CartContext } from "./context/CartContext";

// CUSTOMER LAYOUT
function CustomerLayout() {

  return (

    <>

      <Navbar />

      <WhatsAppButton />

      <Outlet />

    </>

  );

}

// ADMIN LAYOUT
function AdminLayout() {

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const {
    setCartItems,
  } = useContext(
    CartContext
  );

  // MOBILE SIDEBAR
  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  // LOGOUT
  const handleLogout =
    async () => {

      try {

        // CLEAR CART
        setCartItems([]);

        localStorage.removeItem(
          "grocery-cart"
        );

        await signOut(auth);

        navigate("/login");

      } catch (error) {

        console.error(error);

      }

    };

  // ACTIVE LINK STYLE
  const activeClass =
    "bg-gray-800 text-white";

  // NORMAL LINK STYLE
  const normalClass =
    "hover:bg-gray-800 text-gray-300";

  return (

    <div className="min-h-screen bg-gray-100">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (

        <div
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />

      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 bg-gray-900 text-white p-8 flex flex-col z-50 transform transition-transform duration-300
        ${
          sidebarOpen

            ? "translate-x-0"

            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        {/* LOGO */}
        <div className="mb-12">

          <h1 className="text-4xl font-extrabold text-green-400 leading-tight">

            GroceryHub

          </h1>

          <p className="text-gray-400 text-lg mt-2">

            Admin Panel

          </p>

        </div>

        {/* CLOSE BUTTON */}
        <button
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
          className="lg:hidden absolute top-8 right-8 text-2xl"
        >

          <FaTimes />

        </button>

        {/* MENU */}
        <div className="space-y-5 flex-1">

          {/* DASHBOARD */}
          <Link
            to="/admin"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className={`block px-5 py-4 rounded-2xl transition duration-300 text-lg font-semibold
            ${
              location.pathname ===
              "/admin"

                ? activeClass

                : normalClass
            }`}
          >

            📊 Dashboard

          </Link>

          {/* ANALYTICS */}
          <Link
            to="/admin/analytics"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className={`block px-5 py-4 rounded-2xl transition duration-300 text-lg font-semibold
            ${
              location.pathname ===
              "/admin/analytics"

                ? activeClass

                : normalClass
            }`}
          >

            📈 Analytics

          </Link>

          {/* PRODUCTS */}
          <Link
            to="/admin/products"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className={`block px-5 py-4 rounded-2xl transition duration-300 text-lg font-semibold
            ${
              location.pathname ===
              "/admin/products"

                ? activeClass

                : normalClass
            }`}
          >

            📦 Products

          </Link>

          {/* ORDERS */}
          <Link
            to="/admin/orders"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className={`block px-5 py-4 rounded-2xl transition duration-300 text-lg font-semibold
            ${
              location.pathname ===
              "/admin/orders"

                ? activeClass

                : normalClass
            }`}
          >

            🛒 Orders

          </Link>

          {/* CUSTOMERS */}
          <Link
            to="/admin/customers"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className={`block px-5 py-4 rounded-2xl transition duration-300 text-lg font-semibold
            ${
              location.pathname ===
              "/admin/customers"

                ? activeClass

                : normalClass
            }`}
          >

            👥 Customers

          </Link>

        </div>

        {/* LOGOUT */}
        <div className="mt-auto">

          <button
            onClick={
              handleLogout
            }
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg transition duration-300"
          >

            Logout

          </button>

        </div>

      </div>

      {/* PAGE CONTENT */}
      <div className="lg:ml-72 min-h-screen">

        {/* MOBILE HEADER */}
        <div className="lg:hidden bg-white shadow-md px-6 py-5 flex items-center justify-between sticky top-0 z-30">

          {/* MENU BUTTON */}
          <button
            onClick={() =>
              setSidebarOpen(
                true
              )
            }
            className="text-2xl text-gray-800"
          >

            <FaBars />

          </button>

          {/* TITLE */}
          <h1 className="text-2xl font-bold text-gray-900">

            Admin Panel

          </h1>

        </div>

        {/* PAGE */}
        <Outlet />

      </div>

    </div>

  );

}

// APP LAYOUT
function AppLayout() {

  const location =
    useLocation();

  // AUTH PAGES
  const isAuthPage =
    location.pathname ===
      "/login" ||

    location.pathname ===
      "/signup";

  // LOADING
  const [loading, setLoading] =
    useState(true);

  // LOADER
  useEffect(() => {

    const timer =
      setTimeout(() => {

        setLoading(false);

      }, 2000);

    return () =>
      clearTimeout(timer);

  }, []);

  // SHOW LOADER
  if (loading) {

    return <Loader />;

  }

  return (

    <>

      {/* TOASTER */}
      <Toaster position="top-right" />

      <Routes>

        {/* CUSTOMER ROUTES */}
        <Route
          path="/"
          element={
            !isAuthPage

              ? <CustomerLayout />

              : <Outlet />
          }
        >

          <Route
            index
            element={<Home />}
          />

          <Route
            path="cart"
            element={<Cart />}
          />

          <Route
            path="checkout"
            element={

              <ProtectedRoute>

                <Checkout />

              </ProtectedRoute>

            }
          />

          <Route
            path="my-orders"
            element={

              <ProtectedRoute>

                <MyOrders />

              </ProtectedRoute>

            }
          />

          <Route
            path="profile"
            element={

              <ProtectedRoute>

                <Profile />

              </ProtectedRoute>

            }
          />

        </Route>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={

            <AdminRoute>

              <AdminLayout />

            </AdminRoute>

          }
        >

          {/* DASHBOARD */}
          <Route
            index
            element={
              <AdminDashboard />
            }
          />

          {/* ANALYTICS */}
          <Route
            path="analytics"
            element={
              <AdminAnalytics />
            }
          />

          {/* PRODUCTS */}
          <Route
            path="products"
            element={
              <AdminProducts />
            }
          />

          {/* ORDERS */}
          <Route
            path="orders"
            element={
              <AdminOrders />
            }
          />

          {/* CUSTOMERS */}
          <Route
            path="customers"
            element={
              <AdminCustomers />
            }
          />

        </Route>

      </Routes>

    </>

  );

}

// MAIN APP
function App() {

  return (

    <BrowserRouter>

      <AppLayout />

    </BrowserRouter>

  );

}

export default App;