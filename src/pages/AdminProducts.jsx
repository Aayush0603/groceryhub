import {
  useState,
  useEffect,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import toast from "react-hot-toast";

import {
  FaBoxOpen,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
} from "react-icons/fa";

function AdminProducts() {

  // PRODUCT FORM
  const [productData, setProductData] =
    useState({

      name: "",
      price: "",
      image: "",
      category: "",
      description: "",
      stock: "",

    });

  // LOADING
  const [loading, setLoading] =
    useState(false);

  // PRODUCTS
  const [products, setProducts] =
    useState([]);

  // SEARCH
  const [searchTerm, setSearchTerm] =
    useState("");

  // EDIT MODE
  const [editMode, setEditMode] =
    useState(false);

  // SHOW ADD FORM
  const [showAddForm, setShowAddForm] =
    useState(false);

  // CURRENT PRODUCT ID
  const [currentProductId, setCurrentProductId] =
    useState(null);

  // HANDLE CHANGE
  const handleChange = (e) => {

    setProductData({

      ...productData,

      [e.target.name]:
        e.target.value,

    });

  };

  // FETCH PRODUCTS
  const fetchProducts = async () => {

    try {

      const querySnapshot =
        await getDocs(
          collection(db, "products")
        );

      const fetchedProducts =
        querySnapshot.docs.map((doc) => ({

          id: doc.id,

          ...doc.data(),

        }));

      setProducts(fetchedProducts);

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to fetch products"
      );

    }

  };

  // LOAD PRODUCTS
  useEffect(() => {

    fetchProducts();

  }, []);

  // FILTER PRODUCTS
  const filteredProducts =
    products.filter((product) =>
      product.name
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );

  // ADD PRODUCT
  const addProduct = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      await addDoc(
        collection(db, "products"),
        {

          ...productData,

          price:
            Number(productData.price),

          stock:
            Number(productData.stock),

          createdAt:
            serverTimestamp(),

        }
      );

      toast.success(
        "Product Added Successfully"
      );

      fetchProducts();
      setShowAddForm(false);

      // RESET
      setProductData({

        name: "",
        price: "",
        image: "",
        category: "",
        description: "",
        stock: "",

      });

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to add product"
      );

    } finally {

      setLoading(false);

    }

  };

  // DELETE PRODUCT
  const deleteProduct = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this product?"
      );

    if (!confirmDelete) {

      return;

    }

    try {

      await deleteDoc(
        doc(db, "products", id)
      );

      fetchProducts();

      toast.success(
        "Product Deleted Successfully"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to delete product"
      );

    }

  };

  // EDIT PRODUCT
  const editProduct = (product) => {

    setEditMode(true);
    setShowAddForm(true);

    setCurrentProductId(product.id);

    setProductData({

      name: product.name,

      price: product.price,

      image: product.image,

      category: product.category,

      description:
        product.description,

      stock:
        product.stock,

    });

    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  };

  // UPDATE PRODUCT
  const updateProduct = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const productRef =
        doc(
          db,
          "products",
          currentProductId
        );

      await updateDoc(
        productRef,
        {

          ...productData,

          price:
            Number(productData.price),

          stock:
            Number(productData.stock),

        }
      );

      toast.success(
        "Product Updated Successfully"
      );

      setEditMode(false);
      setShowAddForm(false);

      setCurrentProductId(null);

      setProductData({

        name: "",
        price: "",
        image: "",
        category: "",
        description: "",
        stock: "",

      });

      fetchProducts();

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to update product"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <section className="bg-gray-50 px-4 lg:px-6 pb-4 lg:pb-6">

      {/* HEADER SECTION (STATIC) */}
      <div className="sticky top-[72px] lg:top-0 z-20 bg-gray-50 pt-4 lg:pt-6 pb-4 mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-gray-200/50">

        <div>

          <h1 className="text-3xl font-extrabold text-gray-900">

            Products Management 📦

          </h1>

          <p className="text-gray-500 mt-1 text-sm">

            Add, update, and manage store inventory.

          </p>

        </div>

        {/* RIGHT HEADER ACTIONS */}
        <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full xl:w-fit">

          {/* ADD PRODUCT BUTTON */}
          <button
            onClick={() => {
              setEditMode(false);
              setProductData({
                name: "",
                price: "",
                image: "",
                category: "",
                description: "",
                stock: "",
              });
              setShowAddForm(!showAddForm);
            }}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-extrabold text-xl px-8 rounded-2xl shadow-sm transition duration-300 flex items-center justify-center gap-3"
          >
            <FaPlus className="text-2xl" />
            {showAddForm && !editMode ? "Close Form" : "Add Product"}
          </button>

          {/* TOTAL PRODUCTS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-5 w-full sm:w-auto">

            <div className="w-14 h-14 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-3xl">

              <FaBoxOpen />

            </div>

            <div>

              <h2 className="text-4xl font-extrabold text-gray-900 leading-none">

                {products.length}

              </h2>

              <p className="text-gray-500 text-sm mt-1 uppercase tracking-wider font-semibold">

                Total Products

              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ANIMATED ADD PRODUCT MODAL */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* MODAL HEADER */}
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 sm:p-8 flex justify-between items-start sm:items-center text-white shrink-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold">
                    {editMode ? "Edit Product" : "Add New Product"}
                  </h2>
                  <p className="text-green-100 mt-1 text-sm sm:text-base">
                    {editMode ? "Update the details of your inventory item." : "Fill in the details to expand your inventory."}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 sm:p-3 rounded-2xl transition backdrop-blur-md mt-2 sm:mt-0"
                >
                  <span className="font-bold text-white text-xs tracking-wider">ESC</span>
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="p-6 overflow-y-auto">
                <form
                  onSubmit={editMode ? updateProduct : addProduct}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-bold text-gray-700 ml-1">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Organic Bananas"
                      value={productData.name}
                      onChange={handleChange}
                      required
                      className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 transition text-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-bold text-gray-700 ml-1">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="e.g. 150"
                      value={productData.price}
                      onChange={handleChange}
                      required
                      className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 transition text-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-base font-bold text-gray-700 ml-1">Image URL</label>
                    <input
                      type="text"
                      name="image"
                      placeholder="https://example.com/image.png"
                      value={productData.image}
                      onChange={handleChange}
                      required
                      className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 transition text-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-bold text-gray-700 ml-1">Category</label>
                    <input
                      type="text"
                      name="category"
                      placeholder="e.g. Fruits"
                      value={productData.category}
                      onChange={handleChange}
                      required
                      className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 transition text-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-bold text-gray-700 ml-1">Stock Quantity</label>
                    <input
                      type="number"
                      name="stock"
                      placeholder="e.g. 50"
                      value={productData.stock}
                      onChange={handleChange}
                      required
                      className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 transition text-lg"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-base font-bold text-gray-700 ml-1">Description</label>
                    <textarea
                      name="description"
                      placeholder="Briefly describe the product..."
                      value={productData.description}
                      onChange={handleChange}
                      rows="2"
                      required
                      className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 transition text-lg resize-none"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 mt-2 md:col-span-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 transition text-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-green-200 transition duration-300 text-lg"
                    >
                      {loading
                        ? "Saving..."
                        : editMode
                        ? "Save Changes"
                        : "Publish Product"}
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MANAGE PRODUCTS */}
      <div className="relative flex flex-col md:flex-row justify-center items-center gap-4 mb-8">

        <h2 className="text-2xl font-bold text-gray-900 md:absolute md:left-0">

          Manage Products

        </h2>

        {/* SEARCH */}
        <div className="relative w-full md:w-[400px]">

          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search Products..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="border border-gray-200 rounded-xl pl-10 pr-4 py-3 w-full outline-none text-base bg-white shadow-sm focus:border-green-500 transition"
          />

        </div>

      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

        {filteredProducts.map((product) => (

          <div
            key={product.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition hover:shadow-md flex flex-col"
          >

            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover"
            />

            <div className="p-4 flex flex-col flex-grow">

              <div className="flex justify-between items-start gap-2">

                <div>

                  <h2 className="text-base font-bold text-gray-900 leading-tight">

                    {product.name}

                  </h2>

                  <p className="text-[10px] text-green-600 mt-1 uppercase tracking-wider font-semibold">

                    {product.category}

                  </p>

                </div>

                <h3 className="text-base font-extrabold text-green-700 whitespace-nowrap">

                  ₹{product.price}

                </h3>

              </div>

              {/* STOCK STATUS */}
              <div className="mt-3">

                {product.stock === 0 ? (

                  <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-red-100">

                    Out of Stock

                  </span>

                ) : product.stock <= 5 ? (

                  <span className="bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-yellow-100">

                    Low Stock: {product.stock}

                  </span>

                ) : (

                  <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-green-100">

                    In Stock: {product.stock}

                  </span>

                )}

              </div>

              <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed flex-grow">

                {product.description}

              </p>

              <div className="flex gap-2 mt-auto pt-4">

                <button
                  onClick={() =>
                    editProduct(product)
                  }
                  className="flex-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition duration-300 border border-blue-100 hover:border-blue-600"
                >

                  <FaEdit />

                  Edit

                </button>

                <button
                  onClick={() =>
                    deleteProduct(product.id)
                  }
                  className="flex-1 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition duration-300 border border-red-100 hover:border-red-500"
                >

                  <FaTrash />

                  Delete

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>

  );

}

export default AdminProducts;