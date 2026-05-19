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
} from "react-icons/fa";

function AdminCustomers() {

  // CUSTOMERS
  const [customers, setCustomers] =
    useState([]);

  // SEARCH
  const [searchTerm, setSearchTerm] =
    useState("");

  // LOADING
  const [loading, setLoading] =
    useState(true);

  // FETCH CUSTOMERS
  const fetchCustomers = async () => {

    try {

      const querySnapshot =
        await getDocs(
          collection(db, "users")
        );

      const fetchedCustomers =
        querySnapshot.docs.map((doc) => ({

          id: doc.id,

          ...doc.data(),

        }));

      setCustomers(fetchedCustomers);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  // LOAD CUSTOMERS
  useEffect(() => {

    fetchCustomers();

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

    );

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

      {/* SEARCH BAR */}
      <div className="mb-10">

        <div className="relative w-full lg:w-96">

          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search Customers..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full bg-white border border-gray-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          />

        </div>

      </div>

      {/* NO CUSTOMERS */}
      {filteredCustomers.length === 0 && (

        <div className="bg-white rounded-3xl shadow-xl p-20 text-center">

          <FaUsers className="text-7xl text-gray-300 mx-auto mb-6" />

          <h2 className="text-4xl font-bold text-gray-800">

            No Customers Found

          </h2>

          <p className="text-gray-500 mt-4">

            Try searching with another keyword.

          </p>

        </div>

      )}

      {/* CUSTOMERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        {filteredCustomers.map((customer) => (

          <div
            key={customer.id}
            className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition duration-300"
          >

            {/* USER ICON */}
            <div className="w-24 h-24 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-5xl mx-auto mb-6">

              <FaUserCircle />

            </div>

            {/* NAME */}
            <h2 className="text-3xl font-bold text-center text-gray-900">

              {customer.name || "Customer"}

            </h2>

            {/* EMAIL */}
            <p className="text-center text-gray-500 mt-3 break-all">

              {customer.email}

            </p>

            {/* ROLE */}
            <div className="mt-6 flex justify-center">

              <span
                className={`px-5 py-2 rounded-2xl font-bold
                ${
                  customer.role === "admin"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >

                {customer.role}

              </span>

            </div>

          </div>

        ))}

      </div>

    </section>

  );
}

export default AdminCustomers;