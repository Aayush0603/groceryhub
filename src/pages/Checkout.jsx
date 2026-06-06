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

import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaHome,
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

const libraries = ["places"];

function Checkout() {

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
  const deliveryRadius = 15;

  // MAP CENTER
  const [mapCenter, setMapCenter] =
    useState(shopLocation);

  const [
    orderPlaced,
    setOrderPlaced,
  ] = useState(false);

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
    const numericDistance = Number(distance);
    
    // Temporarily making delivery completely free as requested.
    // We can add delivery fee logic later if wanted.
    deliveryCharge = 0;
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

  // SAVE ADDRESS
  const saveCustomerAddress =
    async () => {

      try {

        if (!saveAddress)
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
              currentUser.uid,

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
        !customerInfo.address ||
        !customerInfo.city ||
        !customerInfo.pincode
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
              "GroceryHub",

            description:
              "Order Payment",

            order_id:
              order.id,

            handler:
              async () => {

                try {

                  const orderId =
                    await saveOrder();

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

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white px-6 text-center">

        <div className="bg-white shadow-2xl rounded-3xl p-12 max-w-2xl">

          <h1 className="text-6xl mb-6">
            🎉
          </h1>

          <h2 className="text-5xl font-extrabold text-green-700 mb-6">

            Order Placed Successfully

          </h2>

          <p className="text-2xl text-gray-600 mb-10">

            Thank you for shopping with us ❤️

          </p>

          <Link
            to="/"
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-2xl text-2xl font-bold transition duration-300"
          >

            Continue Shopping

          </Link>

        </div>

      </div>

    );

  }

  // EMPTY CART SCREEN
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
    <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 pt-32 pb-16 px-6">
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
              Checkout
            </h1>
          </div>

          {/* SAVED ADDRESSES */}
          {savedAddresses.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Saved Addresses
              </h2>
              <div className="space-y-3">
                {savedAddresses.map((item, index) => (
                  <button
                    key={index}
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
                    className="w-full text-left bg-gray-50/50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-2xl p-4 transition duration-300 group"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <FaHome className="text-green-600 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-lg text-gray-900">{item.type}</h3>
                    </div>
                    <p className="text-gray-600 text-base leading-relaxed">{item.address}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LOCATION BUTTON */}
          <button
            onClick={detectLocation}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-lg font-bold mb-6 transition duration-300 shadow-md shadow-blue-600/20"
          >
            Use Current Location
          </button>

          {/* FORM */}
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={customerInfo.name}
              onChange={handleChange}
              className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-4 text-base font-medium outline-none focus:border-green-500 transition-colors"
            />
            <input
              type="text"
              name="phone"
              placeholder="Mobile Number"
              value={customerInfo.phone}
              onChange={handleChange}
              className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-4 text-base font-medium outline-none focus:border-green-500 transition-colors"
            />
            <input
              type="text"
              name="address"
              placeholder="Enter Delivery Address"
              value={customerInfo.address}
              onChange={handleChange}
              className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-4 text-base font-medium outline-none focus:border-green-500 transition-colors"
            />

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
                      setCustomerInfo((prev) => ({ ...prev, address: "Fetching address..." }));

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="landmark"
                placeholder="Landmark"
                value={customerInfo.landmark}
                onChange={handleChange}
                className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-4 text-base font-medium outline-none focus:border-green-500 transition-colors"
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={customerInfo.city}
                onChange={handleChange}
                className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-4 text-base font-medium outline-none focus:border-green-500 transition-colors"
              />
            </div>

            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={customerInfo.pincode}
              onChange={handleChange}
              className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-4 text-base font-medium outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* ADDRESS TYPE */}
          <select
            value={addressType}
            onChange={(e) => setAddressType(e.target.value)}
            className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-4 text-base font-medium outline-none focus:border-green-500 transition-colors mt-4 appearance-none"
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>

          {/* SAVE ADDRESS */}
          <div className="mt-5">
            <label className="flex items-center gap-3 text-base font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={() => setSaveAddress(!saveAddress)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              Save this address for future
            </label>
          </div>

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
            Order Summary
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
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">{item.name}</h3>
                    <p className="text-gray-500 text-sm font-medium">Qty: {item.quantity}</p>
                  </div>
                </div>
                <h3 className="font-black text-lg text-gray-900">₹{item.price * item.quantity}</h3>
              </div>
            ))}
          </div>

          {/* PAYMENT */}
          <div className="mb-8 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-500 uppercase tracking-wider mb-4">Payment Method</h3>
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
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-base md:text-lg font-bold text-gray-600">
              <span>Delivery Charge</span>
              <span>{deliveryCharge === 0 ? <span className="text-green-600">Free</span> : `₹${deliveryCharge}`}</span>
            </div>
            
            <div className="border-t-2 border-dashed border-gray-200 mt-4 pt-4 flex justify-between items-center">
              <h1 className="text-2xl font-black text-gray-900">Total</h1>
              <h1 className="text-4xl font-black text-green-700">₹{finalTotal}</h1>
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={placeOrder}
            disabled={loading || !deliveryAvailable}
            className={`w-full mt-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-xl
              ${loading || !deliveryAvailable
                ? "bg-gray-200 cursor-not-allowed text-gray-400 shadow-none"
                : "bg-gray-900 hover:bg-black text-white shadow-gray-900/20 hover:shadow-gray-900/30 hover:-translate-y-0.5"}`}
          >
            {loading ? "Processing Securely..." : paymentMethod === "Online Payment" ? "Proceed to Pay securely" : "Place Order Now"}
          </button>
        </motion.div>
      </div>
    </section>
  );

}

export default Checkout;