import {
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import {
  FaWhatsapp,
  FaArrowLeft,
  FaMapMarkerAlt,
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

  const { currentUser } =
    useContext(AuthContext);

  // EMPTY CART
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

  // DELIVERY
  // DELIVERY CHARGE
let deliveryCharge = 0;

// DELIVERY PRICING
if (distance) {

  const numericDistance =
    Number(distance);

  // 0–5 KM
  if (
    numericDistance <= 5
  ) {

    deliveryCharge =
      totalPrice >= 500
        ? 0
        : 20;

  }

  // 5–10 KM
  else if (
    numericDistance <= 10
  ) {

    deliveryCharge = 40;

  }

  // 10–15 KM
  else if (
    numericDistance <= 15
  ) {

    deliveryCharge = 60;

  }

  // ABOVE 15 KM
  else {

    deliveryCharge = 0;

  }

}

  // FINAL TOTAL
  const finalTotal =
    totalPrice + deliveryCharge;

  // SHOP LOCATION
  const shopLocation = {

    lat: 18.235630628281882,

    lng: 75.69683612021862,

  };

  // DELIVERY RADIUS (KM)
  const deliveryRadius = 15;

  // STATES
  const [orderSuccess, setOrderSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState("Cash on Delivery");

  const [customerLocation, setCustomerLocation] =
    useState(null);

  const [deliveryAvailable, setDeliveryAvailable] =
    useState(true);

  const [distance, setDistance] =
    useState(null);

  const [customerInfo, setCustomerInfo] =
    useState({

      name: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
      notes: "",

    });

  // CALCULATE DISTANCE
  const calculateDistance =
    (
      lat1,
      lon1,
      lat2,
      lon2
    ) => {

      const toRad =
        (value) =>
          (value * Math.PI) / 180;

      const R = 6371;

      const dLat =
        toRad(lat2 - lat1);

      const dLon =
        toRad(lon2 - lon1);

      const a =
        Math.sin(
          dLat / 2
        ) *
          Math.sin(
            dLat / 2
          ) +

        Math.cos(
          toRad(lat1)
        ) *
          Math.cos(
            toRad(lat2)
          ) *

        Math.sin(
          dLon / 2
        ) *
          Math.sin(
            dLon / 2
          );

      const c =
        2 *
        Math.atan2(
          Math.sqrt(a),
          Math.sqrt(1 - a)
        );

      return R * c;

    };

  // GET CUSTOMER LOCATION
  const getCustomerLocation =
    () => {

      if (
        !navigator.geolocation
      ) {

        toast.error(
          "Geolocation not supported"
        );

        return;

      }

      navigator.geolocation.getCurrentPosition(

        (position) => {

          const userLat =
            position.coords.latitude;

          const userLng =
            position.coords.longitude;

          setCustomerLocation({

            lat: userLat,

            lng: userLng,

          });

          // DISTANCE
          const calculatedDistance =
            calculateDistance(

              shopLocation.lat,

              shopLocation.lng,

              userLat,

              userLng
            );

          setDistance(
            calculatedDistance.toFixed(
              2
            )
          );

          // CHECK DELIVERY
          if (
            calculatedDistance >
            deliveryRadius
          ) {

            setDeliveryAvailable(
              false
            );

            toast.error(
              `Delivery unavailable beyond ${deliveryRadius} KM`
            );

          } else {

            setDeliveryAvailable(
              true
            );

            toast.success(
              "Delivery available in your area"
            );

          }

        },

        () => {

          toast.error(
            "Location access denied"
          );

        }
      );

    };

  // AUTO FILL PROFILE
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

  // GET LOCATION
  useEffect(() => {

    getCustomerLocation();

  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {

    setCustomerInfo({

      ...customerInfo,

      [e.target.name]:
        e.target.value,

    });

  };

  // SAVE ORDER
  const saveOrder =
    async () => {

      try {

        if (!currentUser) {

          toast.error(
            "Please login again"
          );

          return false;

        }

        await addDoc(
          collection(db, "orders"),
          {

            userId:
              currentUser.uid,

            customerInfo,

            cartItems,

            subtotal:
              totalPrice,

            deliveryCharge,

            finalTotal,

            paymentMethod,

            status:
              "Pending",

            createdAt:
              serverTimestamp(),

            orderDate:
              new Date().toLocaleDateString(
                "en-IN",
                {

                  timeZone:
                    "Asia/Kolkata",

                }
              ),

            orderTime:
              new Date().toLocaleTimeString(
                "en-IN",
                {

                  timeZone:
                    "Asia/Kolkata",

                }
              ),

          }
        );

        // UPDATE STOCK
        for (const item of cartItems) {

          const productRef =
            doc(
              db,
              "products",
              item.id
            );

          const productSnap =
            await getDoc(
              productRef
            );

          if (
            productSnap.exists()
          ) {

            const productData =
              productSnap.data();

            const updatedStock =
              Math.max(
                (
                  productData.stock ||
                  0
                ) - item.quantity,
                0
              );

            await updateDoc(
              productRef,
              {

                stock:
                  updatedStock,

              }
            );

          }

        }

        toast.success(
          "Order Placed Successfully"
        );

        return true;

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to save order"
        );

        return false;

      }

    };

  // PLACE ORDER
  const placeOrder =
    async () => {

      // DELIVERY CHECK
      if (
        !deliveryAvailable
      ) {

        toast.error(
          "Delivery unavailable in your area"
        );

        return;

      }

      // VALIDATION
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

      toast.success(
        "Delivery area verified"
      );

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

          {/* DELIVERY STATUS */}
          <div className="mb-8">

            {distance && (

              <div
                className={`rounded-2xl p-5 text-lg font-bold flex items-center gap-3
                ${
                  deliveryAvailable

                    ? "bg-green-100 text-green-700"

                    : "bg-red-100 text-red-700"
                }`}
              >

                <FaMapMarkerAlt />

                {deliveryAvailable

                  ? `Delivery Available • ${distance} KM away`

                  : `Delivery unavailable • ${distance} KM away`}

              </div>

            )}

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

          <button
            onClick={placeOrder}
            disabled={
              loading ||
              !deliveryAvailable
            }
            className={`w-full mt-10 py-5 rounded-2xl text-2xl font-bold transition duration-300 flex items-center justify-center gap-4
            ${
              loading ||
              !deliveryAvailable

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

              Redirecting...

            </p>

          </div>

        </div>

      )}

    </section>

  );

}

export default Checkout;