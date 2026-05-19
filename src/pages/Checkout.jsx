import {
  useContext,
  useState,
} from "react";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import {
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaArrowLeft,
} from "react-icons/fa";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import { CartContext } from "../context/CartContext";

function Checkout() {

  const {
    cartItems,
    totalPrice,
    clearCart,
  } = useContext(CartContext);

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

      // SAVE ORDER TO FIRESTORE
      await addDoc(
        collection(db, "orders"),
        {

          customerInfo,

          cartItems,

          subtotal: totalPrice,

          deliveryCharge,

          finalTotal,

          status: "Pending",

          createdAt:
            serverTimestamp(),

        }
      );

      toast.success(
        "Order Placed Successfully"
      );

      // ORDER MESSAGE
      let message =
        `🛒 *New Grocery Order* %0A%0A`;

      // CUSTOMER DETAILS
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

      if (customerInfo.notes) {

        message +=
          `📝 Notes: ${customerInfo.notes}%0A`;

      }

      message +=
        `%0A🛍️ *Products:* %0A`;

      // PRODUCTS
      cartItems.forEach((item) => {

        message +=
          `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}%0A`;

      });

      // PRICE DETAILS
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
        "919876543210";

      const whatsappURL =
        `https://wa.me/${phoneNumber}?text=${message}`;

      // SHOW SUCCESS MODAL
      setOrderSuccess(true);

      // OPEN WHATSAPP AFTER DELAY
      setTimeout(() => {

        window.open(
          whatsappURL,
          "_blank"
        );

        // CLEAR CART
        clearCart();

      }, 2000);

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

    <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-32">

      {/* KEEP YOUR REMAINING UI EXACTLY SAME */}

    </section>

  );
}

export default Checkout;