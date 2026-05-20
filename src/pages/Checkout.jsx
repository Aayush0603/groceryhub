import {
  useContext,
  useEffect,
  useState,
} from "react";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import {
  FaWhatsapp,
  FaArrowLeft,
} from "react-icons/fa";

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import { CartContext } from "../context/CartContext";

import { AuthContext } from "../context/AuthContext";

function Checkout() {

  const {
    cartItems,
    totalPrice,
    clearCart,
  } = useContext(CartContext);

  // CURRENT USER
  const { currentUser } =
    useContext(AuthContext);

  // EMPTY CART SAFETY
  if (
    !cartItems ||
    cartItems.length === 0
  ) {

    return (

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6 text-center">

        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">

          Your Cart is Empty 🛒

        </h1>

        <Link
          to="/"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl text-xl font-bold transition duration-300"
        >

          Continue Shopping

        </Link>

      </div>

    );

  }

  // DELIVERY CHARGE
  const deliveryCharge =
    totalPrice >= 500 ? 0 : 40;

  // FINAL TOTAL
  const finalTotal =
    totalPrice + deliveryCharge;

  // SUCCESS MODAL
  const [orderSuccess, setOrderSuccess] =
    useState(false);

  // LOADING
  const [loading, setLoading] =
    useState(false);

  // PAYMENT
  const [paymentMethod, setPaymentMethod] =
    useState("Cash on Delivery");

  // FORM STATE
  const [customerInfo, setCustomerInfo] =
    useState({

      name: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
      notes: "",

    });

  // AUTO-FILL PROFILE DATA
  useEffect(() => {

    const fetchProfile =
      async () => {

        try {

          if (!currentUser) return;

          const userRef = doc(
            db,
            "users",
            currentUser.uid
          );

          const userSnap =
            await getDoc(userRef);

          if (userSnap.exists()) {

            const data =
              userSnap.data();

            setCustomerInfo({

              name:
                data.name || "",

              phone:
                data.phone || "",

              address:
                data.address || "",

              city:
                data.city || "",

              pincode:
                data.pincode || "",

              notes: "",

            });

          }

        } catch (error) {

          console.error(error);

        }

      };

    fetchProfile();

  }, [currentUser]);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {

    setCustomerInfo({

      ...customerInfo,

      [e.target.name]:
        e.target.value,

    });

  };

  // PLACE ORDER
  const placeOrder = async () => {

    // EMPTY FIELD VALIDATION
    if (
      !customerInfo.name ||
      !customerInfo.phone ||
      !customerInfo.address ||
      !customerInfo.city ||
      !customerInfo.pincode
    ) {

      toast.error(
        "Please fill all required fields"
      );

      return;

    }

    // PHONE VALIDATION
    if (
      customerInfo.phone.length !== 10
    ) {

      toast.error(
        "Phone number must be 10 digits"
      );

      return;

    }

    // PINCODE VALIDATION
    if (
      customerInfo.pincode.length !== 6
    ) {

      toast.error(
        "Pincode must be 6 digits"
      );

      return;

    }

    try {

      setLoading(true);

// VERIFY STOCK BEFORE ORDER
for (const item of cartItems) {

  const productRef = doc(
    db,
    "products",
    item.id
  );

  const productSnap =
    await getDoc(productRef);

  if (!productSnap.exists()) {

    toast.error(
      `${item.name} not found`
    );

    setLoading(false);

    return;

  }

  const productData =
    productSnap.data();

  // OUT OF STOCK
  if (
    productData.stock <= 0
  ) {

    toast.error(
      `${item.name} is out of stock`
    );

    setLoading(false);

    return;

  }

  // INSUFFICIENT STOCK
  if (
    item.quantity >
    productData.stock
  ) {

    toast.error(
      `Only ${productData.stock} ${item.name} left in stock`
    );

    setLoading(false);

    return;

  }

}

// SAVE ORDER
await addDoc(
  collection(db, "orders"),
  {

    userId:
      currentUser?.uid,

    customerInfo,

    cartItems,

    subtotal: totalPrice,

    deliveryCharge,

    finalTotal,

    paymentMethod,

    status: "Pending",

    createdAt:
      serverTimestamp(),

  }
);
      // UPDATE PRODUCT STOCK
for (const item of cartItems) {

  const productRef = doc(
    db,
    "products",
    item.id
  );

  // GET CURRENT PRODUCT
  const productSnap =
    await getDoc(productRef);

  if (productSnap.exists()) {

    const productData =
      productSnap.data();

    const currentStock =
      productData.stock || 0;

    // PREVENT NEGATIVE STOCK
    const updatedStock =
      Math.max(
        currentStock -
          item.quantity,
        0
      );

    // UPDATE STOCK
    await updateDoc(
      productRef,
      {

        stock: updatedStock,

      }
    );

  }

}

      toast.success(
        "Order Placed Successfully"
      );

      // WHATSAPP MESSAGE
      let message =
        `🛒 *New Grocery Order* %0A%0A`;

      message +=
        `👤 Name: ${customerInfo.name}%0A`;

      message +=
        `📞 Phone: ${customerInfo.phone}%0A`;

      message +=
        `📍 Address: ${customerInfo.address}%0A`;

      message +=
        `🏙️ City: ${customerInfo.city}%0A`;

      message +=
        `📮 Pincode: ${customerInfo.pincode}%0A`;

      message +=
        `💳 Payment: ${paymentMethod}%0A`;  

      if (customerInfo.notes) {

        message +=
          `📝 Notes: ${customerInfo.notes}%0A`;

      }

      message +=
        `%0A🛍️ *Products:* %0A`;

      cartItems?.forEach((item) => {

        message +=
          `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}%0A`;

      });

      message +=
        `%0A💵 Subtotal: ₹${totalPrice}%0A`;

      message +=
        `🛵 Delivery Charge: ${
          deliveryCharge === 0
            ? "FREE"
            : `₹${deliveryCharge}`
        }%0A`;

      message +=
        `💰 *Final Total:* ₹${finalTotal}`;

      // YOUR WHATSAPP NUMBER
      const phoneNumber =
        "919172607711";

      const whatsappURL =
        `https://wa.me/${phoneNumber}?text=${message}`;

      // SHOW SUCCESS MODAL
      setOrderSuccess(true);

      // REDIRECT TO WHATSAPP
      setTimeout(() => {

        clearCart();

        window.location.href =
          whatsappURL;

      }, 1500);

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to place order"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-28 px-6">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* LEFT */}
        <motion.div
          initial={{
            opacity: 0,
            x: -50,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="bg-white rounded-3xl shadow-2xl p-10"
        >

          <div className="flex items-center gap-4 mb-10">

            <Link
              to="/cart"
              className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-2xl transition duration-300"
            >

              <FaArrowLeft />

            </Link>

            <h1 className="text-5xl font-extrabold text-gray-900">

              Checkout

            </h1>

          </div>

          {/* FORM */}
          <div className="space-y-6">

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={customerInfo.name}
              onChange={handleChange}
              className="w-full p-5 rounded-2xl border border-gray-200 outline-none"
            />


            <input
  type="text"
  name="phone"
  placeholder="Phone Number"
  value={customerInfo.phone}
  onChange={(e) => {

    // ONLY ALLOW NUMBERS
    const value =
      e.target.value.replace(
        /\D/g,
        ""
      );

    // LIMIT TO 10 DIGITS
    if (value.length <= 10) {

      setCustomerInfo({

        ...customerInfo,

        phone: value,

      });

    }

  }}
  className="w-full p-5 rounded-2xl border border-gray-200 outline-none"
/>

            <textarea
              name="address"
              placeholder="Full Address"
              rows="4"
              value={customerInfo.address}
              onChange={handleChange}
              className="w-full p-5 rounded-2xl border border-gray-200 outline-none"
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={customerInfo.city}
              onChange={handleChange}
              className="w-full p-5 rounded-2xl border border-gray-200 outline-none"
            />


            <input
  type="text"
  name="pincode"
  placeholder="Pincode"
  value={customerInfo.pincode}
  onChange={(e) => {

    // ONLY ALLOW NUMBERS
    const value =
      e.target.value.replace(
        /\D/g,
        ""
      );

    // LIMIT TO 6 DIGITS
    if (value.length <= 6) {

      setCustomerInfo({

        ...customerInfo,

        pincode: value,

      });

    }

  }}
  className="w-full p-5 rounded-2xl border border-gray-200 outline-none"
/>
            <textarea
              name="notes"
              placeholder="Additional Notes (Optional)"
              rows="3"
              value={customerInfo.notes}
              onChange={handleChange}
              className="w-full p-5 rounded-2xl border border-gray-200 outline-none"
            />

            {/* PAYMENT METHOD */}
<div>

  <h2 className="text-2xl font-bold text-gray-900 mb-5">

    Payment Method

  </h2>

  <div className="space-y-4">

    {/* COD */}
    <label className="flex items-center gap-4 border border-gray-200 rounded-2xl p-5 cursor-pointer hover:border-green-500 transition duration-300">

      <input
        type="radio"
        name="payment"
        value="Cash on Delivery"
        checked={
          paymentMethod ===
          "Cash on Delivery"
        }
        onChange={(e) =>
          setPaymentMethod(
            e.target.value
          )
        }
      />

      <span className="text-xl font-semibold text-gray-800">

        Cash on Delivery

      </span>

    </label>

    {/* ONLINE */}
    <label className="flex items-center gap-4 border border-gray-200 rounded-2xl p-5 cursor-pointer opacity-60">

      <input
        type="radio"
        disabled
      />

      <span className="text-xl font-semibold text-gray-800">

        Online Payment
        {" "}
        (Coming Soon)

      </span>

    </label>

  </div>

</div>

          </div>

        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{
            opacity: 0,
            x: 50,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="bg-white rounded-3xl shadow-2xl p-10 h-fit"
        >

          <h2 className="text-4xl font-extrabold text-gray-900 mb-10">

            Order Summary

          </h2>

          <div className="space-y-6">

            {cartItems?.map((item) => (

              <div
                key={item.id}
                className="flex justify-between items-center border-b border-gray-100 pb-5"
              >

                <div>

                  <h3 className="text-xl font-bold text-gray-900">

                    {item.name}

                  </h3>

                  <p className="text-gray-500 mt-1">

                    Qty:
                    {" "}
                    {item.quantity}

                  </p>

                </div>

                <h2 className="text-2xl font-extrabold text-green-700">

                  ₹
                  {item.price *
                    item.quantity}

                </h2>

              </div>

            ))}

          </div>

          {/* TOTALS */}
          <div className="mt-10 space-y-5">

            <div className="flex justify-between text-xl">

              <span>

                Subtotal

              </span>

              <span>

                ₹{totalPrice}

              </span>

            </div>

            <div className="flex justify-between text-xl">

              <span>

                Delivery

              </span>

              <span>

                {deliveryCharge === 0
                  ? "FREE"
                  : `₹${deliveryCharge}`}

              </span>

            </div>

            <div className="border-t border-gray-200 pt-5 flex justify-between items-center">

              <h1 className="text-3xl font-extrabold text-gray-900">

                Total

              </h1>

              <h1 className="text-4xl font-extrabold text-green-700">

                ₹{finalTotal}

              </h1>

            </div>

          </div>

          {/* BUTTON */}
         <button
  onClick={placeOrder}
  disabled={loading}
  className={`w-full mt-10 py-5 rounded-2xl text-2xl font-bold transition duration-300 flex items-center justify-center gap-4
  ${
    loading
      ? "bg-gray-400 cursor-not-allowed text-white"
      : "bg-green-600 hover:bg-green-700 text-white"
  }`}
>

  <FaWhatsapp />

  {loading
    ? "Placing Order..."
    : "Place Order"}

</button>
        </motion.div>

      </div>

      {/* SUCCESS MODAL */}
      {orderSuccess && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">

          <div className="bg-white rounded-3xl p-10 text-center max-w-lg w-full">

            <div className="w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-5xl mx-auto mb-8">

              ✓

            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 mb-5">

              Order Placed Successfully

            </h1>

            <p className="text-gray-600 text-lg">

              Redirecting to WhatsApp...

            </p>

          </div>

        </div>

      )}

    </section>

  );
}

export default Checkout;