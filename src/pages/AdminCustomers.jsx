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
  FaUsers,
  FaSearch,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaMoneyBillWave,
  FaTimes,
  FaEnvelope,
  FaCalendarAlt,
  FaChevronRight,
} from "react-icons/fa";

import { motion, AnimatePresence } from "framer-motion";

function AdminCustomers() {

  // CUSTOMERS
  const [customers, setCustomers] =
    useState([]);

  // ORDERS
  const [orders, setOrders] =
    useState([]);

  // SEARCH
  const [searchTerm, setSearchTerm] =
    useState("");

  // LOADING
  const [loading, setLoading] =
    useState(true);

  // SELECTED CUSTOMER
  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState(null);

  // FETCH DATA
  const fetchData = async () => {

    try {

      // USERS
      const usersSnapshot =
        await getDocs(
          collection(db, "users")
        );

      const fetchedCustomers =
        usersSnapshot.docs.map(
          (doc) => ({

            id: doc.id,

            ...doc.data(),

          })
        );

      setCustomers(
        fetchedCustomers
      );

      // ORDERS
      const ordersSnapshot =
        await getDocs(
          collection(db, "orders")
        );

      const fetchedOrders =
        ordersSnapshot.docs.map(
          (doc) => ({

            id: doc.id,

            ...doc.data(),

          })
        );

      setOrders(
        fetchedOrders
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  // LOAD DATA
  useEffect(() => {

    fetchData();

  }, []);

  // FILTER CUSTOMERS
  const filteredCustomers =
    customers.filter((customer) =>

      (customer.name || "")
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )

      ||

      (customer.email || "")
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )

      ||

      (customer.phone || "")
        .includes(searchTerm)

    );

  // CUSTOMER ANALYTICS
  const getCustomerStats =
    (customerId) => {

      const customerOrders =
        orders.filter(
          (order) =>

            order.userId ===
            customerId
        );

      let totalSpent = 0;

      let totalProducts = 0;

      customerOrders.forEach(
        (order) => {

          totalSpent +=
            order.finalTotal || 0;

          order.cartItems?.forEach(
            (item) => {

              totalProducts +=
                item.quantity;

            }
          );

        }
      );

      return {

        totalOrders:
          customerOrders.length,

        totalSpent,

        totalProducts,

        orders:
          customerOrders,

      };

    };

  // AVATAR UTILS
  const getInitials = (name) => {
    if (!name) return "C";
    const cleanName = name.trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName[0]?.toUpperCase() || "C";
  };

  const getAvatarGradient = (id) => {
    const gradients = [
      "from-purple-500 to-indigo-600",
      "from-blue-500 to-cyan-600",
      "from-emerald-500 to-teal-600",
      "from-violet-500 to-purple-600",
      "from-pink-500 to-rose-600",
    ];
    const index = id ? id.charCodeAt(0) % gradients.length : 0;
    return gradients[index];
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Processing":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Packed":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Out for Delivery":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  // LOADING
  if (loading) {

    return (

      <div className="min-h-[70vh] w-full flex items-center justify-center text-2xl font-bold text-gray-500">

        <div className="flex flex-col items-center gap-4">

          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>

          <span>Loading Customers...</span>

        </div>

      </div>

    );

  }

  return (

    <section className="px-6 lg:px-10 pb-6 lg:pb-10">

      {/* HEADER */}
      <div className="sticky top-[72px] lg:top-0 z-20 bg-gray-100 pt-6 lg:pt-10 pb-4 mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-gray-200/50">

        <div>

          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">

            Customers Management 👥

          </h1>

          <p className="text-gray-500 mt-2 text-lg">

            Manage registered customers and view their purchasing history.

          </p>

        </div>

        {/* HEADER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">

          {/* SEARCH */}
          <div className="relative flex-1 sm:flex-none">

            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

            <input
              type="text"
              placeholder="Search Customers..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="w-full sm:w-64 lg:w-80 bg-white border border-gray-200/80 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 shadow-sm transition-all duration-300"
            />

          </div>

          {/* TOTAL CUSTOMERS */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-3 flex items-center gap-4 min-w-[185px]">

            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">

              <FaUsers />

            </div>

            <div>

              <h2 className="text-2xl font-extrabold text-gray-900 leading-none">

                {customers.length}

              </h2>

              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">

                Customers

              </p>

            </div>

          </div>

        </div>

      </div>

      {/* NO CUSTOMERS */}
      {filteredCustomers.length ===
        0 && (

          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">

            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />

            <h2 className="text-2xl font-bold text-gray-800">

              No Customers Found

            </h2>

            <p className="text-gray-400 mt-2 text-sm">

              Try adjusting your search criteria or query.

            </p>

          </div>

        )}

      {/* CUSTOMERS GRID */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >

        {filteredCustomers.map(
          (customer) => {

            const stats =
              getCustomerStats(
                customer.id
              );

            const gradient = getAvatarGradient(customer.id);

            const initials = getInitials(customer.name);

            return (

              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                key={customer.id}
                onClick={() =>
                  setSelectedCustomer(
                    {

                      ...customer,

                      stats,

                    }
                  )
                }
                className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-purple-200/60 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
              >

                {/* Hover bg gradient glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/10 to-indigo-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>

                  {/* CARD HEADER */}
                  <div className="flex items-center gap-4 mb-5">

                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-xl font-black text-white shadow-sm group-hover:scale-105 transition-transform duration-300`}>

                      {initials}

                    </div>

                    <div className="flex-1 min-w-0">

                      <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors">

                        {customer.name ||
                          "Customer"}

                      </h3>

                      <p className="text-sm text-gray-500 font-semibold flex items-center gap-1.5 mt-0.5 truncate">

                        <FaEnvelope className="text-gray-400 text-sm" />

                        {customer.email ||
                          "No Email"}

                      </p>

                    </div>

                  </div>

                  {/* INFO LIST */}
                  <div className="space-y-2.5 mb-6">

                    {customer.phone && (

                      <div className="flex items-center gap-2.5 text-sm text-gray-600">

                        <FaPhoneAlt className="text-gray-400 text-xs" />

                        <span className="font-semibold">{customer.phone}</span>

                      </div>

                    )}

                    {customer.address && (

                      <div className="flex items-center gap-2.5 text-sm text-gray-600">

                        <FaMapMarkerAlt className="text-gray-400 text-xs" />

                        <span className="truncate font-semibold">{customer.address}, {customer.city}</span>

                      </div>

                    )}

                  </div>

                </div>

                {/* STATS PANEL */}
                <div className="pt-4 border-t border-gray-50">

                  <div className="grid grid-cols-3 gap-2 w-full text-center">

                    <div className="bg-green-50/60 rounded-xl py-2 px-1">

                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Spent</p>

                      <p className="text-base font-black text-green-700 mt-0.5">₹{stats.totalSpent}</p>

                    </div>

                    <div className="bg-blue-50/60 rounded-xl py-2 px-1">

                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Orders</p>

                      <p className="text-base font-extrabold text-blue-700 mt-0.5">{stats.totalOrders}</p>

                    </div>

                    <div className="bg-amber-50/60 rounded-xl py-2 px-1">

                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Items</p>

                      <p className="text-base font-extrabold text-amber-700 mt-0.5">{stats.totalProducts}</p>

                    </div>

                  </div>

                </div>

                {/* Chevron icon */}
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-purple-400 text-xs">

                  <FaChevronRight className="translate-x-0 group-hover:translate-x-1 transition-transform" />

                </div>

              </motion.div>

            );

          }
        )}

      </motion.div>

      {/* CUSTOMER DETAILS MODAL */}
      <AnimatePresence>

        {selectedCustomer && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto"
            onClick={() => setSelectedCustomer(null)}
          >

            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100 flex flex-col"
            >

              {/* CLOSE */}
              <button
                onClick={() =>
                  setSelectedCustomer(
                    null
                  )
                }
                className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-500 flex items-center justify-center text-base transition-all duration-200 border border-gray-100"
              >

                <FaTimes />

              </button>

              {/* HEADER BANNER */}
              <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-5">

                <div className={`w-16 h-16 rounded-xl bg-gradient-to-tr ${getAvatarGradient(selectedCustomer.id)} flex items-center justify-center text-2xl font-black text-white shadow-sm`}>

                  {getInitials(selectedCustomer.name)}

                </div>

                <div className="text-center sm:text-left flex-1">

                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">

                    {
                      selectedCustomer.name
                    }

                  </h2>

                  <p className="text-xs font-semibold text-gray-400 mt-1.5 flex items-center justify-center sm:justify-start gap-1.5">

                    <FaEnvelope className="text-gray-300" />

                    {
                      selectedCustomer.email || "No Email Registered"
                    }

                  </p>

                </div>

              </div>

              {/* CONTENT BODY */}
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto">

                {/* QUICK STATS & CONTACT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  {/* PHONE */}
                  <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between min-h-[90px]">

                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">

                      <FaPhoneAlt className="text-purple-400" /> Phone

                    </span>

                    <h4 className="text-sm font-bold text-gray-800 mt-2 truncate">

                      {
                        selectedCustomer.phone || "Not Provided"
                      }

                    </h4>

                  </div>

                  {/* SPENT */}
                  <div className="bg-green-50/40 border border-green-100/30 rounded-2xl p-4 flex flex-col justify-between min-h-[90px]">

                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1.5">

                      <FaMoneyBillWave className="text-green-500" /> Total Spent

                    </span>

                    <h4 className="text-lg font-black text-green-700 mt-2">

                      ₹
                      {
                        selectedCustomer
                          .stats
                          .totalSpent
                      }

                    </h4>

                  </div>

                  {/* ORDERS */}
                  <div className="bg-blue-50/40 border border-blue-100/30 rounded-2xl p-4 flex flex-col justify-between min-h-[90px]">

                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1.5">

                      <FaShoppingBag className="text-blue-500" /> Orders Count

                    </span>

                    <h4 className="text-lg font-bold text-blue-700 mt-2">

                      {
                        selectedCustomer
                          .stats
                          .totalOrders
                      }

                    </h4>

                  </div>

                  {/* PRODUCTS */}
                  <div className="bg-amber-50/40 border border-amber-100/30 rounded-2xl p-4 flex flex-col justify-between min-h-[90px]">

                    <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1.5">

                      <FaShoppingBag className="text-amber-500" /> Items Bought

                    </span>

                    <h4 className="text-lg font-bold text-amber-700 mt-2">

                      {
                        selectedCustomer
                          .stats
                          .totalProducts
                      }

                    </h4>

                  </div>

                </div>

                {/* ADDRESS PANEL */}
                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 flex items-start gap-4">

                  <div className="p-3 bg-white rounded-xl shadow-sm text-purple-600 border border-gray-100 flex-shrink-0">

                    <FaMapMarkerAlt />

                  </div>

                  <div>

                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">

                      Delivery Address

                    </span>

                    <h4 className="text-sm font-bold text-gray-800 mt-1 leading-relaxed">

                      {selectedCustomer.address ? (

                        `${selectedCustomer.address}, ${selectedCustomer.city} - ${selectedCustomer.pincode}`

                      ) : (

                        <span className="text-gray-400 font-medium italic">No address details stored yet.</span>

                      )}

                    </h4>

                  </div>

                </div>

                {/* ORDER HISTORY */}
                <div>

                  <h3 className="text-base font-black text-gray-900 mb-5 pb-2 border-b border-gray-100">

                    Order History

                  </h3>

                  {selectedCustomer.stats.orders.length === 0 ? (

                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">

                      <FaShoppingBag className="text-3xl text-gray-300 mx-auto mb-2" />

                      <p className="text-sm text-gray-400 font-semibold">No order history available for this customer.</p>

                    </div>

                  ) : (

                    <div className="space-y-4">

                      {selectedCustomer.stats.orders.map((order) => (

                        <div
                          key={order.id}
                          className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
                        >

                          {/* ORDER SUB-HEADER */}
                          <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">

                            <div>

                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Order ID</span>

                              <p className="text-xs font-bold text-gray-700 break-all">{order.id}</p>

                            </div>

                            <div className="flex items-center gap-3">

                              <span className={`px-2.5 py-1 rounded-lg font-extrabold text-[10px] uppercase border ${getStatusStyle(order.status)}`}>

                                {order.status}

                              </span>

                              <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1.5">

                                <FaCalendarAlt className="text-gray-400 text-xs" /> {order.orderDate}

                              </span>

                            </div>

                          </div>

                          {/* PRODUCTS LIST */}
                          <div className="p-4 divide-y divide-gray-50">

                            {order.cartItems?.map((item) => (

                              <div key={item.id} className="py-2.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">

                                <div>

                                  <h5 className="text-sm font-bold text-gray-800">{item.name}</h5>

                                  <p className="text-xs text-gray-400 font-semibold mt-0.5">Quantity: {item.quantity}</p>

                                </div>

                                <span className="text-sm font-extrabold text-gray-900">

                                  ₹{item.price * item.quantity}

                                </span>

                              </div>

                            ))}

                          </div>

                          {/* RECEIPT TOTAL */}
                          <div className="bg-gray-50/40 px-5 py-3 border-t border-gray-100 flex justify-between items-center">

                            <span className="text-xs font-bold text-gray-500">Order Amount</span>

                            <span className="text-base font-black text-green-700">₹{order.finalTotal}</span>

                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </section>

  );

}

export default AdminCustomers;