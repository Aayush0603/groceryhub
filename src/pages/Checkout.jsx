import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  GoogleMap,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";

import axios from "axios";

import { motion } from "framer-motion";

import {
  Link,
} from "react-router-dom";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";

import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaHome,
  FaCheckCircle,
  FaShoppingBag,
  FaReceipt,
} from "react-icons/fa";

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import { CartContext } from "../context/CartContext";

import { AuthContext } from "../context/AuthContext";

import { useTranslation } from "react-i18next";

const libraries = ["places"];

function Checkout() {
  const { t } = useTranslation();

  const {
    cartItems,
    totalPrice,
    clearCart,
  } = useContext(CartContext);

  const {
    currentUser,
  } = useContext(AuthContext);


  // GOOGLE MAPS
  const { isLoaded } =
    useJsApiLoader({

      googleMapsApiKey:
        import.meta.env
          .VITE_GOOGLE_MAPS_API_KEY,

      libraries,

    });

  // SHOP LOCATION
  const shopLocation = {

    lat: 18.235630628281882,

    lng: 75.69683612021862,

  };

  // DELIVERY RADIUS
  const deliveryRadius = 7;

  // MAP CENTER
  const [mapCenter, setMapCenter] =
    useState(shopLocation);

  const [
    orderPlaced,
    setOrderPlaced,
  ] = useState(false);

  const [
    placedOrderId,
    setPlacedOrderId,
  ] = useState("");

  // STATES
  const [loading, setLoading] =
    useState(false);

  const [distance, setDistance] =
    useState(null);

  const [deliveryAvailable, setDeliveryAvailable] =
    useState(true);

  const [customerLocation, setCustomerLocation] =
    useState(null);

  const [savedAddresses, setSavedAddresses] =
    useState([]);

  const [addressType, setAddressType] =
    useState("Home");

  const [editingIndex, setEditingIndex] =
    useState(null);

  const [saveAddress, setSaveAddress] =
    useState(true);

  const [paymentMethod, setPaymentMethod] =
    useState("Cash on Delivery");

  const [customerInfo, setCustomerInfo] =
    useState({

      name: "",

      phone: "",

      address: "",

      city: "",

      pincode: "",

      landmark: "",

      notes: "",

    });

  // DELIVERY CHARGE
  let deliveryCharge = 0;

  if (distance) {
    const distNum = parseFloat(distance);
    if (distNum > 3) {
      deliveryCharge = Math.round((distNum - 3) * 15);
    }
  }

  // FINAL TOTAL
  const finalTotal =
    totalPrice + deliveryCharge;

  // HANDLE INPUT
  const handleChange = (e) => {

    setCustomerInfo({

      ...customerInfo,

      [e.target.name]:
        e.target.value,

    });

  };

  // DISTANCE CALCULATOR
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

  // CHECK DELIVERY
  const checkSavedLocation =
    (
      userLocation
    ) => {

      if (!userLocation)
        return;

      setCustomerLocation({

        lat:
          userLocation.lat,

        lng:
          userLocation.lng,

      });

      const calculatedDistance =
        calculateDistance(

          shopLocation.lat,

          shopLocation.lng,

          userLocation.lat,

          userLocation.lng
        );

      setDistance(
        calculatedDistance.toFixed(
          2
        )
      );

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

      }

    };

  // DETECT LOCATION
  const detectLocation = () => {

    if (!navigator.geolocation) {

      toast.error(
        "Geolocation not supported"
      );

      return;

    }

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        const location = {

          lat,
          lng,

        };

        // UPDATE LOCATION
        setCustomerLocation(
          location
        );

        setMapCenter(
          location
        );

        checkSavedLocation(
          location
        );

        // GOOGLE GEOCODER
        const geocoder =
          new window.google.maps.Geocoder();

        geocoder.geocode(

          {
            location: {
              lat,
              lng,
            },
          },

          (
            results,
            status
          ) => {

            if (

              status === "OK" &&
              results &&
              results.length > 0

            ) {

              const result =
                results[0];

              const addressComponents =
                result.address_components;

              setCustomerInfo(
                (prev) => ({

                  ...prev,

                  address:
                    result.formatted_address ||
                    "",

                  city:
                    addressComponents.find(
                      (component) =>
                        component.types.includes(
                          "locality"
                        )
                    )?.long_name || "",

                  pincode:
                    addressComponents.find(
                      (component) =>
                        component.types.includes(
                          "postal_code"
                        )
                    )?.long_name || "",

                  landmark:
                    addressComponents.find(
                      (component) =>
                        component.types.includes(
                          "sublocality"
                        )
                    )?.long_name || "",

                })
              );

              toast.success(
                "Location detected successfully"
              );

            }

            else {

              toast.error(
                "Failed to fetch address"
              );

            }

          }

        );

      },

      () => {

        toast.error(
          "Location access denied"
        );

      },

      {

        enableHighAccuracy: true,

        timeout: 15000,

        maximumAge: 60000,

      }

    );

  };

  // FETCH PROFILE
  useEffect(() => {

    const fetchProfile =
      async () => {

        try {

          if (!currentUser)
            return;

          const userRef =
            doc(
              db,
              "users",
              currentUser.uid
            );

          const userSnap =
            await getDoc(
              userRef
            );

          if (
            userSnap.exists()
          ) {

            const data =
              userSnap.data();

            setCustomerInfo({

              name:
                data.name || "",

              phone:
                data.phone || "",

              address: "",

              city: "",

              pincode: "",

              landmark: "",

              notes: "",

            });

            if (
              data.savedAddresses
            ) {

              setSavedAddresses(
                data.savedAddresses
              );

              const defaultAddress =
                data.savedAddresses.find(
                  (item) =>
                    item.isDefault
                );

              if (
                defaultAddress
              ) {

                setCustomerInfo({

                  name:
                    data.name || "",

                  phone:
                    data.phone || "",

                  address:
                    defaultAddress.address,

                  city:
                    defaultAddress.city,

                  pincode:
                    defaultAddress.pincode,

                  landmark:
                    defaultAddress.landmark,

                  notes: "",

                });

                const location = {

                  lat:
                    defaultAddress.lat,

                  lng:
                    defaultAddress.lng,

                };

                setMapCenter(
                  location
                );

                checkSavedLocation(
                  location
                );

              }

            }

          }

        } catch (error) {

          console.error(error);

        }

      };

    fetchProfile();

  }, [currentUser]);

  // CONFETTI EFFECT
  useEffect(() => {
    if (orderPlaced) {
      // Fire confetti from just below the navbar
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.15 },
      });

      // Side bursts for a premium feel
      const timer = setTimeout(() => {
        confetti({
          particleCount: 90,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.2 },
        });
        confetti({
          particleCount: 90,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.2 },
        });
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [orderPlaced]);

  // SAVE ADDRESS
  const saveCustomerAddress =
    async () => {

      try {

        if (!saveAddress)
          return;

        // SKIP FOR GUESTS
        if (!currentUser)
          return;

        const userRef =
          doc(
            db,
            "users",
            currentUser.uid
          );

        // CHECK DUPLICATE ADDRESS
        const alreadyExists =
          savedAddresses.some(
            (item) =>

              item.address ===
              customerInfo.address &&

              item.pincode ===
              customerInfo.pincode
          );

        // CHECK DUPLICATE
        if (alreadyExists) {

          return;

        }

        // EDIT EXISTING ADDRESS
        if (
          editingIndex !== null
        ) {

          const updatedAddresses =
            [...savedAddresses];

          updatedAddresses[
            editingIndex
          ] = {

            type: addressType,

            address:
              customerInfo.address,

            city:
              customerInfo.city,

            pincode:
              customerInfo.pincode,

            landmark:
              customerInfo.landmark,

            lat:
              customerLocation?.lat || "",

            lng:
              customerLocation?.lng || "",

            isDefault: true,

          };

          await updateDoc(

            userRef,

            {

              savedAddresses:
                updatedAddresses,

            }

          );

          setSavedAddresses(
            updatedAddresses
          );

          setEditingIndex(
            null
          );

          toast.success(
            "Address updated"
          );

          return;

        }

        await updateDoc(
          userRef,
          {

            savedAddresses:
              arrayUnion({

                type: addressType,

                address:
                  customerInfo.address,

                city:
                  customerInfo.city,

                pincode:
                  customerInfo.pincode,

                landmark:
                  customerInfo.landmark,

                lat:
                  customerLocation?.lat || "",

                lng:
                  customerLocation?.lng || "",

                isDefault:
                  savedAddresses.length === 0,

              }),

          }
        );

      } catch (error) {

        console.error(error);

      }

    };


  // SAVE ORDER
  const saveOrder =
    async () => {

      await saveCustomerAddress();

      const orderRef =
        await addDoc(
          collection(
            db,
            "orders"
          ),
          {

            userId:
              currentUser ? currentUser.uid : null,

            customerPhone:
              customerInfo.phone,

            customerInfo,

            customerLocation,

            cartItems,

            subtotal:
              totalPrice,

            deliveryCharge,

            finalTotal,

            distance,

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

      return orderRef.id;

    };

  // PLACE ORDER
  const placeOrder =
    async () => {

      if (
        !customerLocation ||
        distance === null
      ) {

        toast.error(
          "Please pin your location on the map or detect your current location"
        );

        return;

      }

      if (
        !deliveryAvailable
      ) {

        toast.error(
          "Delivery unavailable in your area"
        );

        return;

      }

      if (
        !customerInfo.name ||
        !customerInfo.phone ||
        !customerInfo.address
      ) {

        toast.error(
          "Please fill all required fields"
        );

        return;

      }

      try {

        setLoading(true);

        // CASH ON DELIVERY
        if (
          paymentMethod ===
          "Cash on Delivery"
        ) {

          const orderId =
            await saveOrder();

          setPlacedOrderId(orderId);

          // CLEAR CART
          clearCart();

          localStorage.removeItem(
            "grocery-cart"
          );

          setOrderPlaced(true);
        }

        // ONLINE PAYMENT
        else {

          const response =
            await axios.post(

              `${import.meta.env.VITE_BACKEND_URL}/create-order`,

              {

                amount:
                  finalTotal,

              }
            );

          const order =
            response.data.order;

          const options = {

            key:
              import.meta.env
                .VITE_RAZORPAY_KEY_ID,

            amount:
              order.amount,

            currency:
              order.currency,

            name:
              "GandhiBazaar",

            description:
              "Order Payment",

            order_id:
              order.id,

            handler:
              async () => {

                try {

                  const orderId =
                    await saveOrder();

                  setPlacedOrderId(orderId);

                  // CLEAR CART
                  clearCart();

                  localStorage.removeItem(
                    "grocery-cart"
                  );

                  setOrderPlaced(true);

                } catch (error) {

                  console.error(
                    error
                  );

                  toast.error(
                    "Payment succeeded but order saving failed"
                  );

                }

              },

            prefill: {

              name:
                customerInfo.name,

              contact:
                customerInfo.phone,

            },

            theme: {

              color:
                "#16a34a",

            },

          };

          const razorpay =
            new window.Razorpay(
              options
            );

          razorpay.open();

        }

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to place order"
        );

      } finally {

        setLoading(false);

      }

    };
  // SUCCESS SCREEN
  if (orderPlaced) {

    return (

      <div className="min-h-screen flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-green-50/60 via-white to-emerald-50/40 px-4 pt-28 pb-12 md:pt-36 md:pb-24 relative overflow-hidden">

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/95 backdrop-blur-md shadow-2xl border border-green-100 rounded-3xl p-4 sm:p-5 md:p-6 max-w-xl w-full text-center relative overflow-hidden"
        >

          {/* Decorative Background Blobs */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-green-100/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none" />

          {/* Success Checkmark Circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            className="w-12 h-12 md:w-16 md:h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-3 border border-green-100 shadow-inner"
          >
            <FaCheckCircle className="w-6 h-6 md:w-8 md:h-8 animate-pulse" />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-1">
            {t("checkout.orderConfirmed")}
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-2 max-w-md mx-auto leading-relaxed">
            {t("checkout.thankYou")} <br />
            {t("checkout.groceryOnWay")}
          </p>

          {/* Order Details box */}
          {placedOrderId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50/80 rounded-2xl p-3 sm:p-4 mb-2 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100/50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                  <FaReceipt className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{t("checkout.orderReference")}</p>
                  <p className="text-sm font-bold text-gray-800 break-all select-all">#{placedOrderId}</p>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-green-100 text-green-700 px-4 py-1.5 rounded-full border border-green-200 uppercase tracking-wide">
                {t("checkout.preparing")}
              </span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-center w-full">
            <Link to="/" className="w-full sm:w-auto flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 px-5 rounded-xl md:rounded-2xl text-lg font-bold shadow-lg shadow-green-600/20 hover:shadow-green-700/30 transition-all duration-300 cursor-pointer"
              >
                <FaShoppingBag className="w-4 h-4 shrink-0" />
                {t("checkout.continueShopping")}
              </motion.button>
            </Link>

            <Link to={currentUser ? "/my-orders" : "/login"} className="w-full sm:w-auto flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 hover:text-gray-900 py-2.5 px-5 rounded-xl md:rounded-2xl text-lg font-bold transition-all duration-300 cursor-pointer"
              >
                {currentUser ? t("checkout.trackMyOrder") : t("checkout.loginToTrack")}
              </motion.button>
            </Link>
          </div>

        </motion.div>

        {/* GUEST SIGNUP PROMPT */}
        {!currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white/95 backdrop-blur-md shadow-xl border border-gray-100 rounded-3xl p-8 sm:p-10 max-w-xl w-full text-center relative overflow-hidden"
          >
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-blue-50/40 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-green-50/40 rounded-full blur-2xl pointer-events-none" />

            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
              {t("checkout.createAccountToTrack")}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-5 max-w-sm mx-auto">
              {t("checkout.signupPrompt")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-center w-full">
              <Link to="/signup" className="w-full sm:w-auto flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3.5 px-6 rounded-xl md:rounded-2xl text-base font-bold shadow-lg shadow-gray-900/20 transition-all duration-300 cursor-pointer"
                >
                  {t("nav.signup")}
                </motion.button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 hover:text-gray-900 py-3.5 px-6 rounded-xl md:rounded-2xl text-base font-bold transition-all duration-300 cursor-pointer"
                >
                  {t("checkout.alreadyAccount")}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}

      </div>

    );

  }

  // EMPTY CART SCREEN
  if (
    !cartItems ||
    cartItems.length === 0
  ) {

    return (

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50/50 via-white to-emerald-50/30 px-4 py-8 text-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-2xl p-8 md:p-12 text-center max-w-md w-full flex flex-col items-center"
        >

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6 border border-green-100 shadow-inner"
          >
            <FaShoppingBag className="w-8 h-8" />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            {t("cart.emptyCartTitle")}
          </h2>

          <p className="text-gray-500 text-sm sm:text-base mb-6 max-w-sm">
            {t("cart.emptyCartDesc")}
          </p>

          <Link to="/" className="w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-base font-bold shadow-lg shadow-green-600/20 transition-all duration-300"
            >
              {t("checkout.continueShopping")}
            </motion.button>
          </Link>

        </motion.div>

      </div>

    );

  }

  // HANDLE MAP CLICK
  const handleMapClick = (
    e
  ) => {

    const lat =
      e.latLng.lat();

    const lng =
      e.latLng.lng();

    const location = {

      lat,
      lng,

    };

    // UPDATE MAP
    setMapCenter(
      location
    );

    // UPDATE LOCATION
    setCustomerLocation(
      location
    );

    // CHECK DELIVERY
    checkSavedLocation(
      location
    );

    // GOOGLE GEOCODER
    const geocoder =
      new window.google.maps.Geocoder();

    geocoder.geocode(

      {

        location: {

          lat,
          lng,

        },

      },

      (
        results,
        status
      ) => {

        if (

          status === "OK" &&
          results &&
          results.length > 0

        ) {

          const result =
            results[0];

          const addressComponents =
            result.address_components;

          setCustomerInfo(
            (prev) => ({

              ...prev,

              address:
                result.formatted_address ||
                "",

              city:
                addressComponents.find(
                  (component) =>
                    component.types.includes(
                      "locality"
                    )
                )?.long_name || "",

              pincode:
                addressComponents.find(
                  (component) =>
                    component.types.includes(
                      "postal_code"
                    )
                )?.long_name || "",

              landmark:
                addressComponents.find(
                  (component) =>
                    component.types.includes(
                      "sublocality"
                    )
                )?.long_name || "",

            })
          );

        }

      }

    );

  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 pt-24 md:pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 md:p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/cart"
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 flex items-center justify-center text-lg md:text-xl transition duration-300"
            >
              <FaArrowLeft />
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              {t("checkout.pageTitle")}
            </h1>
          </div>

          {/* FORM FIELDS */}
          <div className="space-y-4">
            {/* NAME FIELD */}
            <input
              type="text"
              name="name"
              placeholder={t("checkout.name")}
              value={customerInfo.name}
              onChange={handleChange}
              className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-4 text-base font-medium outline-none focus:border-green-500 transition-colors"
            />

            {/* PHONE NO. */}
            <input
              type="text"
              name="phone"
              placeholder={t("checkout.phone")}
              value={customerInfo.phone}
              onChange={handleChange}
              className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-4 text-base font-medium outline-none focus:border-green-500 transition-colors"
            />

            {/* ADDRESS FIELD */}
            <input
              type="text"
              name="address"
              placeholder={t("checkout.deliveryAddress")}
              value={customerInfo.address}
              onChange={handleChange}
              className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-4 text-base font-medium outline-none focus:border-green-500 transition-colors"
            />

            {/* ADDRESS TYPE SELECT (ADDRESS TAG) — ONLY FOR LOGGED IN USERS */}
            {currentUser && (
              <div>
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Address Tag</label>
                <select
                  value={addressType}
                  onChange={(e) => setAddressType(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-4 text-base font-medium outline-none focus:border-green-500 transition-colors appearance-none"
                >
                  <option value="Home">{t("profile.home") || "Home"}</option>
                  <option value="Work">{t("profile.work") || "Work"}</option>
                  <option value="Other">{t("profile.other") || "Other"}</option>
                </select>
              </div>
            )}

            {/* TICKBOX TO SAVE ADDRESS FOR FUTURE — ONLY FOR LOGGED IN USERS */}
            {currentUser && (
              <div className="py-1">
                <label className="flex items-center gap-3 text-base font-bold text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={() => setSaveAddress(!saveAddress)}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  />
                  {t("checkout.saveAddress")}
                </label>
              </div>
            )}

            {/* DELIVERY NOTES / COMMENTS */}
            <div className="py-1">
              <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{t("checkout.deliveryNotes")}</label>
              <textarea
                name="notes"
                placeholder={t("checkout.anyInstructions")}
                value={customerInfo.notes}
                onChange={handleChange}
                className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-4 text-base font-medium outline-none focus:border-green-500 transition-colors resize-none"
                rows={3}
              />
            </div>

            {/* MAP */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "250px" }}
                  center={mapCenter}
                  zoom={15}
                  onClick={handleMapClick}
                >
                  <MarkerF
                    position={mapCenter}
                    draggable={true}
                    onDragEnd={(e) => {
                      const location = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                      setMapCenter(location);
                      setCustomerLocation(location);
                      checkSavedLocation(location);
                      setCustomerInfo((prev) => ({ ...prev, address: t("checkout.locating") }));

                      const geocoder = new window.google.maps.Geocoder();
                      geocoder.geocode({ location }, (results, status) => {
                        if (status === "OK" && results && results.length > 0) {
                          const result = results[0];
                          const addressComponents = result.address_components;
                          setCustomerInfo((prev) => ({
                            ...prev,
                            address: result.formatted_address,
                            city: addressComponents.find((c) => c.types.includes("locality"))?.long_name || "",
                            pincode: addressComponents.find((c) => c.types.includes("postal_code"))?.long_name || "",
                            landmark: addressComponents.find((c) => c.types.includes("sublocality"))?.long_name || "",
                          }));
                        } else {
                          toast.error("Failed to fetch address");
                        }
                      });
                    }}
                  />
                </GoogleMap>
              )}
            </div>
          </div>

          {/* USE CURRENT LOCATION BUTTON */}
          <button
            type="button"
            onClick={detectLocation}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-lg font-bold mt-4 transition duration-300 shadow-md shadow-blue-600/20 cursor-pointer"
          >
            {t("checkout.useCurrentLocation")}
          </button>

          {/* SAVED ADDRESSES SECTION */}
          {savedAddresses.length > 0 && (
            <div className="border-t border-gray-100 pt-6 mt-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                {t("profile.savedAddresses") || "Saved Addresses"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedAddresses.map((item, index) => {
                  const isSelected = customerInfo.address === item.address;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setCustomerInfo({
                          ...customerInfo,
                          address: item.address,
                          city: item.city,
                          pincode: item.pincode,
                          landmark: item.landmark,
                        });
                        const location = { lat: item.lat, lng: item.lng };
                        setMapCenter(location);
                        checkSavedLocation(location);
                      }}
                      className={`w-full text-left rounded-2xl p-4 transition-all duration-300 group cursor-pointer border-2 relative flex items-start gap-3.5 shadow-sm hover:shadow-md
                        ${isSelected
                          ? "border-green-500 bg-green-50/30 text-green-800"
                          : "border-gray-100 bg-white hover:bg-gray-50/50 text-gray-700"}`}
                    >
                      {/* Icon Block */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300
                        ${isSelected
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-50 text-gray-400 group-hover:bg-green-50 group-hover:text-green-600"}`}
                      >
                        <FaHome className="w-4 h-4" />
                      </div>

                      {/* Text details */}
                      <div className="flex-1 min-w-0 pr-5">
                        <h3 className="font-extrabold text-base text-gray-900 mb-0.5 leading-tight">
                          {t(`profile.${item.type.toLowerCase()}`) || item.type}
                        </h3>
                        <p className="text-gray-500 text-xs leading-relaxed break-words font-semibold line-clamp-2">
                          {item.address}
                        </p>
                      </div>

                      {/* Tick badge on selected card */}
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-green-600">
                          <FaCheckCircle className="w-4.5 h-4.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}


          {/* DELIVERY STATUS */}
          {distance && (
            <div className="mt-6">
              <div
                className={`rounded-xl p-4 text-base font-bold flex items-center gap-3
                  ${deliveryAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                <FaMapMarkerAlt className="text-xl" />
                {deliveryAvailable
                  ? `Delivery Available • ${distance} KM away`
                  : `Delivery unavailable • ${distance} KM away`}
              </div>
            </div>
          )}
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 md:p-8 h-fit border border-gray-100"
        >
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">
            {t("checkout.orderSummary")}
          </h2>

          {/* ITEMS */}
          <div className="space-y-4 mb-8">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center group">
                <div className="flex gap-4 items-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <FaShoppingBag className="text-gray-300" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">{t(item.i18nKeyName) || item.name}</h3>
                    <p className="text-gray-500 text-sm font-medium">Qty: {item.quantity}</p>
                  </div>
                </div>
                <h3 className="font-black text-lg text-gray-900">₹{item.price * item.quantity}</h3>
              </div>
            ))}
          </div>

          {/* PAYMENT */}
          <div className="mb-3.5 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-4">{t("checkout.paymentMethod")}</h3>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod("Cash on Delivery")}
                className={`w-full p-4 rounded-xl border-2 font-bold text-base transition-all duration-300
                  ${paymentMethod === "Cash on Delivery"
                    ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                    : "border-gray-200 bg-white hover:border-green-200 text-gray-700"}`}
              >
                Cash On Delivery
              </button>
              <button
                onClick={() => setPaymentMethod("Online Payment")}
                className={`w-full p-4 rounded-xl border-2 font-bold text-base transition-all duration-300
                  ${paymentMethod === "Online Payment"
                    ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                    : "border-gray-200 bg-white hover:border-green-200 text-gray-700"}`}
              >
                Online Payment (Razorpay)
              </button>
            </div>
          </div>

          {/* TOTAL */}
          <div className="space-y-3">
            <div className="flex justify-between text-base md:text-lg font-bold text-gray-600">
              <span>{t("checkout.subtotal")}</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-base md:text-lg font-bold text-gray-600">
              <span>{t("checkout.deliveryFee")}</span>
              <span>{deliveryCharge === 0 ? <span className="text-green-600">{t("checkout.free")}</span> : `₹${deliveryCharge}`}</span>
            </div>

            <div className="border-t-2 border-dashed border-gray-200 mt-4 pt-4 flex justify-between items-center">
              <h1 className="text-2xl font-black text-gray-900">{t("checkout.totalAmount")}</h1>
              <h1 className="text-4xl font-black text-green-700">₹{finalTotal}</h1>
            </div>
          </div>

          {/* PLACE ORDER */}
          <button
            onClick={placeOrder}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-xl text-xl font-black mt-8 shadow-xl shadow-green-600/20 hover:shadow-green-700/30 transition-all duration-300 transform active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {loading ? t("checkout.placingOrder") : t("checkout.placeOrder")}
          </button>
        </motion.div>
      </div>
    </section>
  );

}

export default Checkout;