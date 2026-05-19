import {
  useState,
  useEffect,
} from "react";

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

          createdAt:
            serverTimestamp(),

        }
      );

      toast.success(
        "Product Added Successfully"
      );

      fetchProducts();

      // RESET
      setProductData({

        name: "",
        price: "",
        image: "",
        category: "",
        description: "",

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

    setCurrentProductId(product.id);

    setProductData({

      name: product.name,

      price: product.price,

      image: product.image,

      category: product.category,

      description: product.description,

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

        }
      );

      toast.success(
        "Product Updated Successfully"
      );

      setEditMode(false);

      setCurrentProductId(null);

      setProductData({

        name: "",
        price: "",
        image: "",
        category: "",
        description: "",

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

    <section className="min-h-screen bg-gray-100 p-6 lg:p-10">

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between gap-6 mb-10">

        <div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900">

            Products Management 📦

          </h1>

          <p className="text-gray-600 mt-3 text-lg">

            Add, update, and manage store inventory.

          </p>

        </div>

        {/* TOTAL PRODUCTS */}
        <div className="bg-white rounded-3xl shadow-lg px-8 py-6 flex items-center gap-5 w-full xl:w-fit">

          <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-3xl">

            <FaBoxOpen />

          </div>

          <div>

            <h2 className="text-4xl font-extrabold text-gray-900">

              {products.length}

            </h2>

            <p className="text-gray-500">

              Total Products

            </p>

          </div>

        </div>

      </div>

      {/* ADD PRODUCT */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-12">

        <div className="flex items-center gap-4 mb-8">

          <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-2xl">

            <FaPlus />

          </div>

          <h2 className="text-3xl font-bold text-gray-900">

            {editMode
              ? "Edit Product"
              : "Add Product"}

          </h2>

        </div>

        <form
          onSubmit={
            editMode
              ? updateProduct
              : addProduct
          }
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >

          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={productData.name}
            onChange={handleChange}
            required
            className="border border-gray-200 rounded-2xl p-4 outline-none"
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={productData.price}
            onChange={handleChange}
            required
            className="border border-gray-200 rounded-2xl p-4 outline-none"
          />

          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={productData.image}
            onChange={handleChange}
            required
            className="border border-gray-200 rounded-2xl p-4 outline-none md:col-span-2"
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={productData.category}
            onChange={handleChange}
            required
            className="border border-gray-200 rounded-2xl p-4 outline-none"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={productData.description}
            onChange={handleChange}
            rows="4"
            required
            className="border border-gray-200 rounded-2xl p-4 outline-none md:col-span-2 resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-lg font-bold transition duration-300 md:col-span-2"
          >

            {loading
              ? "Processing..."
              : editMode
              ? "Update Product"
              : "Add Product"}

          </button>

        </form>

      </div>

      {/* MANAGE PRODUCTS */}
      <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8">

        <h2 className="text-4xl font-extrabold text-gray-900">

          Manage Products

        </h2>

        {/* SEARCH */}
        <div className="relative w-full lg:w-96">

          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search Products..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="border border-gray-200 rounded-2xl pl-14 pr-5 py-4 w-full outline-none bg-white shadow-sm"
          />

        </div>

      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        {filteredProducts.map((product) => (

          <div
            key={product.id}
            className="bg-white rounded-3xl overflow-hidden shadow-lg"
          >

            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover"
            />

            <div className="p-6">

              <div className="flex justify-between items-start">

                <div>

                  <h2 className="text-2xl font-bold text-gray-900">

                    {product.name}

                  </h2>

                  <p className="text-green-600 mt-2 font-semibold">

                    {product.category}

                  </p>

                </div>

                <h3 className="text-2xl font-extrabold text-green-700">

                  ₹{product.price}

                </h3>

              </div>

              <p className="text-gray-600 mt-4 leading-7">

                {product.description}

              </p>

              <div className="flex gap-4 mt-8">

                <button
                  onClick={() =>
                    editProduct(product)
                  }
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-3"
                >

                  <FaEdit />

                  Edit

                </button>

                <button
                  onClick={() =>
                    deleteProduct(product.id)
                  }
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-3"
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