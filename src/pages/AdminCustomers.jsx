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
  FaUserCircle,
  FaSearch,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaMoneyBillWave,
  FaTimes,
} from "react-icons/fa";

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

  // LOADING
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-3xl font-bold">

        Loading Customers...

      </div>

    );

  }

  return (

    <section className="min-h-screen bg-gray-100 p-10">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">

        <div>

          <h1 className="text-5xl font-extrabold text-gray-900">

            Customers Management 👥

          </h1>

          <p className="text-gray-600 mt-3 text-lg">

            Manage registered customers.

          </p>

        </div>

        {/* TOTAL CUSTOMERS */}
        <div className="bg-white rounded-3xl shadow-xl px-8 py-6 flex items-center gap-5">

          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl">

            <FaUsers />

          </div>

          <div>

            <h2 className="text-4xl font-extrabold text-gray-900">

              {customers.length}

            </h2>

            <p className="text-gray-500">

              Customers

            </p>

          </div>

        </div>

      </div>

      {/* SEARCH */}
      <div className="mb-10">

        <div className="relative w-full lg:w-96">

          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search Customers..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className="w-full bg-white border border-gray-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          />

        </div>

      </div>

      {/* NO CUSTOMERS */}
      {filteredCustomers.length ===
        0 && (

        <div className="bg-white rounded-3xl shadow-xl p-20 text-center">

          <FaUsers className="text-7xl text-gray-300 mx-auto mb-6" />

          <h2 className="text-4xl font-bold text-gray-800">

            No Customers Found

          </h2>

        </div>

      )}

      {/* CUSTOMERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        {filteredCustomers.map(
          (customer) => {

            const stats =
              getCustomerStats(
                customer.id
              );

            return (

              <div
                key={customer.id}
                onClick={() =>
                  setSelectedCustomer(
                    {

                      ...customer,

                      stats,

                    }
                  )
                }
                className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition duration-300 cursor-pointer"
              >

                {/* USER ICON */}
                <div className="w-24 h-24 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-5xl mx-auto mb-6">

                  <FaUserCircle />

                </div>

                {/* NAME */}
                <h2 className="text-3xl font-bold text-center text-gray-900">

                  {customer.name ||
                    "Customer"}

                </h2>

                {/* PHONE */}
                <p className="text-center text-gray-500 mt-3">

                  {customer.phone}

                </p>

                {/* TOTAL SPENT */}
                <div className="mt-8 bg-green-50 rounded-2xl p-5 text-center">

                  <p className="text-gray-500">

                    Total Spent

                  </p>

                  <h2 className="text-4xl font-extrabold text-green-700 mt-2">

                    ₹
                    {
                      stats.totalSpent
                    }

                  </h2>

                </div>

                {/* ORDERS */}
                <div className="mt-5 flex justify-between">

                  <div className="bg-blue-50 rounded-2xl px-5 py-4 text-center flex-1 mr-2">

                    <p className="text-gray-500 text-sm">

                      Orders

                    </p>

                    <h3 className="text-2xl font-bold text-blue-700">

                      {
                        stats.totalOrders
                      }

                    </h3>

                  </div>

                  <div className="bg-orange-50 rounded-2xl px-5 py-4 text-center flex-1 ml-2">

                    <p className="text-gray-500 text-sm">

                      Products

                    </p>

                    <h3 className="text-2xl font-bold text-orange-700">

                      {
                        stats.totalProducts
                      }

                    </h3>

                  </div>

                </div>

              </div>

            );

          }
        )}

      </div>

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 overflow-y-auto">

          <div className="bg-white rounded-3xl w-full max-w-5xl p-8 relative max-h-[90vh] overflow-y-auto">

            {/* CLOSE */}
            <button
              onClick={() =>
                setSelectedCustomer(
                  null
                )
              }
              className="absolute top-5 right-5 w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center text-xl"
            >

              <FaTimes />

            </button>

            {/* HEADER */}
            <div className="text-center mb-10">

              <div className="w-28 h-28 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-6xl mx-auto mb-6">

                <FaUserCircle />

              </div>

              <h1 className="text-5xl font-extrabold text-gray-900">

                {
                  selectedCustomer.name
                }

              </h1>

            </div>

            {/* CUSTOMER INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

              <div className="bg-gray-50 rounded-2xl p-5">

                <div className="flex items-center gap-3 text-gray-500 mb-3">

                  <FaPhoneAlt />

                  Phone

                </div>

                <h3 className="text-xl font-bold text-gray-900">

                  {
                    selectedCustomer.phone
                  }

                </h3>

              </div>

              <div className="bg-gray-50 rounded-2xl p-5">

                <div className="flex items-center gap-3 text-gray-500 mb-3">

                  <FaShoppingBag />

                  Orders

                </div>

                <h3 className="text-xl font-bold text-blue-700">

                  {
                    selectedCustomer
                      .stats
                      .totalOrders
                  }

                </h3>

              </div>

              <div className="bg-gray-50 rounded-2xl p-5">

                <div className="flex items-center gap-3 text-gray-500 mb-3">

                  <FaMoneyBillWave />

                  Total Spent

                </div>

                <h3 className="text-xl font-bold text-green-700">

                  ₹
                  {
                    selectedCustomer
                      .stats
                      .totalSpent
                  }

                </h3>

              </div>

              <div className="bg-gray-50 rounded-2xl p-5">

                <div className="flex items-center gap-3 text-gray-500 mb-3">

                  <FaShoppingBag />

                  Products

                </div>

                <h3 className="text-xl font-bold text-orange-700">

                  {
                    selectedCustomer
                      .stats
                      .totalProducts
                  }

                </h3>

              </div>

            </div>

            {/* ADDRESS */}
            <div className="bg-gray-50 rounded-3xl p-6 mb-10">

              <div className="flex items-center gap-3 text-gray-500 mb-4">

                <FaMapMarkerAlt />

                Address

              </div>

              <h3 className="text-xl font-bold text-gray-900 leading-8">

                {
                  selectedCustomer.address
                }
                ,{" "}
                {
                  selectedCustomer.city
                }
                {" "}
                -{" "}
                {
                  selectedCustomer.pincode
                }

              </h3>

            </div>

            {/* ORDER HISTORY */}
            <div>

              <h2 className="text-4xl font-extrabold text-gray-900 mb-8">

                Order History

              </h2>

              <div className="space-y-6">

                {selectedCustomer.stats.orders.map(
                  (order) => (

                    <div
                      key={order.id}
                      className="bg-gray-50 rounded-3xl p-6"
                    >

                      <div className="flex flex-col lg:flex-row justify-between gap-5 mb-5">

                        <div>

                          <h3 className="text-2xl font-bold text-gray-900">

                            Order ID

                          </h3>

                          <p className="text-gray-500 mt-2 break-all">

                            {order.id}

                          </p>

                        </div>

                        <div className="text-right">

                          <div className="bg-green-100 text-green-700 px-5 py-2 rounded-2xl font-bold inline-block">

                            {
                              order.status
                            }

                          </div>

                          <p className="text-gray-500 mt-3">

                            {
                              order.orderDate
                            }
                            {" "}
                            |
                            {" "}
                            {
                              order.orderTime
                            }

                          </p>

                        </div>

                      </div>

                      {/* PRODUCTS */}
                      <div className="space-y-4">

                        {order.cartItems?.map(
                          (
                            item
                          ) => (

                            <div
                              key={
                                item.id
                              }
                              className="bg-white rounded-2xl p-5 flex justify-between"
                            >

                              <div>

                                <h4 className="text-xl font-bold text-gray-900">

                                  {
                                    item.name
                                  }

                                </h4>

                                <p className="text-gray-500 mt-2">

                                  Qty:
                                  {" "}
                                  {
                                    item.quantity
                                  }

                                </p>

                              </div>

                              <div className="text-2xl font-extrabold text-green-700">

                                ₹
                                {item.price *
                                  item.quantity}

                              </div>

                            </div>

                          )
                        )}

                      </div>

                      {/* TOTAL */}
                      <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">

                        <h3 className="text-2xl font-bold text-gray-900">

                          Final Total

                        </h3>

                        <h3 className="text-4xl font-extrabold text-green-700">

                          ₹
                          {
                            order.finalTotal
                          }

                        </h3>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        </div>

      )}

    </section>

  );

}

export default AdminCustomers;