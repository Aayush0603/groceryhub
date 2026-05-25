import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Autocomplete,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

import axios from "axios";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import {
  FaWhatsapp,
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

function Checkout() {

  const {
    cartItems,
    totalPrice,
    clearCart,
  } = useContext(CartContext);

  const {

  currentUser,

  fetchUserProfile,

} = useContext(AuthContext);


  // GOOGLE MAPS
  const { isLoaded } =
    useJsApiLoader({

      googleMapsApiKey:
        import.meta.env
          .VITE_GOOGLE_MAPS_API_KEY,

      libraries: ["places"],

    });

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

  // SHOP LOCATION
  const shopLocation = {

    lat: 18.235630628281882,

    lng: 75.69683612021862,

  };

  // MAP CENTER
  const [mapCenter, setMapCenter] =
    useState(shopLocation);

  // DELIVERY RADIUS
  const deliveryRadius = 15;

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

    const numericDistance =
      Number(distance);

    if (
      numericDistance <= 5
    ) {

      deliveryCharge =
        totalPrice >= 500
          ? 0
          : 20;

    }

    else if (
      numericDistance <= 10
    ) {

      deliveryCharge = 40;

    }

    else if (
      numericDistance <= 15
    ) {

      deliveryCharge = 60;

    }

  }

  // FINAL TOTAL
  const finalTotal =
    totalPrice + deliveryCharge;

  // HANDLE CHANGE
  const handleChange = (e) => {

    setCustomerInfo({

      ...customerInfo,

      [e.target.name]:
        e.target.value,

    });

  };

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

  // CHECK LOCATION
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

  // CURRENT LOCATION
  const detectLocation = () => {

    if (
      !navigator.geolocation
    ) {

      toast.error(
        "Geolocation not supported"
      );

      return;

    }

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        try {

          const lat =
            position.coords.latitude;

          const lng =
            position.coords.longitude;

          const location = {

            lat,

            lng,

          };

          setCustomerLocation(
            location
          );

          setMapCenter(
            location
          );

          checkSavedLocation(
            location
          );

          const response =
            await axios.get(

              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );

          const data =
            response.data;

          setCustomerInfo(
            (prev) => ({

              ...prev,

              address:
                data.display_name ||
                "",

              city:
                data.address?.city ||

                data.address?.town ||

                data.address?.village ||

                "",

              pincode:
                data.address?.postcode ||
                "",

            })
          );

          toast.success(
            "Location detected successfully"
          );

        } catch (error) {

          console.error(error);

          toast.error(
            "Failed to fetch address"
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

  // FETCH USER DATA
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

      // CHECK DUPLICATE
      const alreadyExists =
        savedAddresses.some(
          (item) =>

            item.address ===
              customerInfo.address &&

            item.pincode ===
              customerInfo.pincode
        );

      // SKIP DUPLICATE
      if (alreadyExists)
        return;

      await updateDoc(
        userRef,
        {

          savedAddresses:
            arrayUnion({

              type: "Home",

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

      // REFRESH USER
      await fetchUserProfile(
        currentUser.uid
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

  // WHATSAPP
  const sendWhatsAppMessage =
    (
      orderId
    ) => {

      const products =
        cartItems
          .map(
            (
              item
            ) =>

              `${item.name} x ${item.quantity}`
          )
          .join("%0A");

      const message =
        `🛒 *New Grocery Order* %0A%0A` +

        `📦 Order ID: ${orderId}%0A%0A` +

        `👤 Name: ${customerInfo.name}%0A` +

        `📱 Phone: ${customerInfo.phone}%0A` +

        `📍 Address: ${customerInfo.address}%0A` +

        `🏙️ City: ${customerInfo.city}%0A` +

        `📮 Pincode: ${customerInfo.pincode}%0A%0A` +

        `🛍️ Products:%0A${products}%0A%0A` +

        `🚚 Delivery Charge: ₹${deliveryCharge}%0A` +

        `💰 Total: ₹${finalTotal}`;

      window.location.href =
        `https://wa.me/919172607711?text=${message}`;

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

        // COD
        if (
          paymentMethod ===
          "Cash on Delivery"
        ) {

          const orderId =
            await saveOrder();

          sendWhatsAppMessage(
            orderId
          );

          toast.success(
            "Order placed successfully"
          );

          clearCart();

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

                const orderId =
                  await saveOrder();

                sendWhatsAppMessage(
                  orderId
                );

                toast.success(
                  "Payment Successful"
                );

                clearCart();

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

          {/* SAVED ADDRESSES */}
          {savedAddresses.length > 0 && (

            <div className="mb-8">

              <h2 className="text-2xl font-bold mb-5">

                Saved Addresses

              </h2>

              <div className="space-y-4">

                {savedAddresses.map(
                  (
                    item,
                    index
                  ) => (

                    <button
                      key={index}
                      onClick={() => {

                        setCustomerInfo({

                          ...customerInfo,

                          address:
                            item.address,

                          city:
                            item.city,

                          pincode:
                            item.pincode,

                          landmark:
                            item.landmark,

                        });

                        const location = {

                          lat:
                            item.lat,

                          lng:
                            item.lng,

                        };

                        setMapCenter(
                          location
                        );

                        checkSavedLocation(
                          location
                        );

                      }}
                      className="w-full text-left bg-gray-100 hover:bg-green-50 border border-gray-200 rounded-2xl p-5 transition duration-300"
                    >

                      <div className="flex items-center gap-3 mb-2">

                        <FaHome className="text-green-600" />

                        <h3 className="font-bold">

                          {item.type}

                        </h3>

                      </div>

                      <p className="text-gray-700">

                        {item.address}

                      </p>

                    </button>

                  )
                )}

              </div>

            </div>

          )}

          {/* CURRENT LOCATION */}
          <button
            onClick={
              detectLocation
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-lg font-bold mb-8 transition duration-300"
          >

            Use Current Location

          </button>

          {/* CUSTOMER INFO */}
          <div className="space-y-6">

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={customerInfo.name}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-2xl p-5 outline-none"
            />

            <input
              type="text"
              name="phone"
              placeholder="Mobile Number"
              value={customerInfo.phone}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-2xl p-5 outline-none"
            />

           {/* GOOGLE AUTOCOMPLETE */}

<Autocomplete

  onLoad={(autocomplete) => {

    window.googleAutocomplete =
      autocomplete;

  }}

  onPlaceChanged={() => {

    const place =
      window.googleAutocomplete.getPlace();

    if (
      !place.geometry
    ) return;

    const lat =
      place.geometry.location.lat();

    const lng =
      place.geometry.location.lng();

    const address =
      place.formatted_address;

    setCustomerInfo({

      ...customerInfo,

      address,

      city:
        place.address_components?.find(
          (component) =>
            component.types.includes(
              "locality"
            )
        )?.long_name || "",

      pincode:
        place.address_components?.find(
          (component) =>
            component.types.includes(
              "postal_code"
            )
        )?.long_name || "",

    });

    const location = {

      lat,

      lng,

    };

    setCustomerLocation(
      location
    );

    setMapCenter(
      location
    );

    checkSavedLocation(
      location
    );

  }}
>

  <input
    type="text"
    placeholder="Search exact delivery address"
    className="w-full border border-gray-200 rounded-2xl p-5 outline-none"
  />

</Autocomplete>


            {/* GOOGLE MAP */}
            <div className="rounded-3xl overflow-hidden">

              {isLoaded && (

                <GoogleMap
                  mapContainerStyle={{

                    width: "100%",

                    height: "350px",

                  }}

                  center={mapCenter}

                  zoom={15}
                >

                  <Marker
                    position={mapCenter}

                    draggable={true}

                    onDragEnd={async (
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

                      setMapCenter(
                        location
                      );

                      setCustomerLocation(
                        location
                      );

                      checkSavedLocation(
                        location
                      );

                      try {

                        const response =
                          await axios.get(

                            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
                          );

                        const data =
                          response.data;

                        setCustomerInfo(
                          (
                            prev
                          ) => ({

                            ...prev,

                            address:
                              data.display_name ||
                              "",

                            city:
                              data.address?.city ||

                              data.address?.town ||

                              data.address?.village ||

                              "",

                            pincode:
                              data.address?.postcode ||
                              "",

                          })
                        );

                      } catch (error) {

                        console.error(
                          error
                        );

                      }

                    }}
                  />

                </GoogleMap>

              )}

            </div>

            <input
              type="text"
              name="landmark"
              placeholder="Landmark"
              value={customerInfo.landmark}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-2xl p-5 outline-none"
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={customerInfo.city}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-2xl p-5 outline-none"
            />

            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={customerInfo.pincode}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-2xl p-5 outline-none"
            />

          </div>

          {/* SAVE ADDRESS */}
          <div className="mt-6">

            <label className="flex items-center gap-3 text-lg font-semibold">

              <input
                type="checkbox"
                checked={saveAddress}
                onChange={() =>
                  setSaveAddress(
                    !saveAddress
                  )
                }
                className="w-5 h-5"
              />

              Save this address

            </label>

          </div>

          {/* DELIVERY STATUS */}
          <div className="mt-8">

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

        {/* RIGHT SIDE */}
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

          {/* ITEMS */}
          <div className="space-y-5 mb-10">

            {cartItems.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  className="flex justify-between items-center"
                >

                  <div>

                    <h3 className="font-bold text-lg">

                      {item.name}

                    </h3>

                    <p className="text-gray-500">

                      Qty: {item.quantity}

                    </p>

                  </div>

                  <h3 className="font-bold text-lg">

                    ₹
                    {item.price *
                      item.quantity}

                  </h3>

                </div>

              )
            )}

          </div>

          {/* PAYMENT */}
          <div className="mb-10">

            <h3 className="text-2xl font-bold text-gray-900 mb-5">

              Payment Method

            </h3>

            <div className="space-y-4">

              <button
                onClick={() =>
                  setPaymentMethod(
                    "Cash on Delivery"
                  )
                }
                className={`w-full p-5 rounded-2xl border-2 font-bold transition duration-300
                ${
                  paymentMethod ===
                  "Cash on Delivery"

                    ? "border-green-600 bg-green-50 text-green-700"

                    : "border-gray-200"
                }`}
              >

                Cash On Delivery

              </button>

              <button
                onClick={() =>
                  setPaymentMethod(
                    "Online Payment"
                  )
                }
                className={`w-full p-5 rounded-2xl border-2 font-bold transition duration-300
                ${
                  paymentMethod ===
                  "Online Payment"

                    ? "border-green-600 bg-green-50 text-green-700"

                    : "border-gray-200"
                }`}
              >

                Online Payment

              </button>

            </div>

          </div>

          {/* TOTALS */}
          <div className="space-y-5">

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

                Delivery Charge

              </span>

              <span>

                ₹{deliveryCharge}

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
              ? "Processing..."
              : paymentMethod ===
                "Online Payment"

              ? "Pay Now"

              : "Place Order"}

          </button>

        </motion.div>

      </div>

    </section>

  );

}

export default Checkout;