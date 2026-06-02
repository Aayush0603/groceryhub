import {
  useContext,
  useEffect,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

import toast from "react-hot-toast";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import {
  db,
} from "../firebase/firebase";

import { AuthContext } from "../context/AuthContext";

import {
  FaUserCircle,
  FaSave,
  FaHome,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Profile() {

  // AUTH CONTEXT
  const {

    currentUser,

    updateUser,

    fetchUserProfile,

  } = useContext(AuthContext);

  // LOADING
  const [loading, setLoading] =
    useState(true);

  // SAVING
  const [saving, setSaving] =
    useState(false);

  // PROFILE DATA
  const [profileData, setProfileData] =
    useState({

      name: "",

      email: "",

      phone: "",

      role: "customer",

    });

  // SAVED ADDRESSES
  const [savedAddresses, setSavedAddresses] =
    useState([]);

  // DEFAULT ADDRESS
  const [defaultAddress, setDefaultAddress] =
    useState(null);

  const [showAddressModal, setShowAddressModal] =
  useState(false);

const [editingIndex, setEditingIndex] =
  useState(null);

const [addressType, setAddressType] =
  useState("Home");

const [addressData, setAddressData] =
  useState({

    address: "",

    city: "",

    pincode: "",

    landmark: "",

  });

  // FETCH PROFILE
  const fetchProfile =
    async () => {

      try {

        if (!currentUser) {

          setLoading(false);

          return;

        }

        const userRef = doc(

          db,

          "users",

          currentUser.uid

        );

        const userSnap =
          await getDoc(userRef);

        // USER EXISTS
        if (userSnap.exists()) {

          const userData =
            userSnap.data();

          setProfileData({

            name:
              userData.name || "",

            email:
              userData.email || "",

            phone:
              userData.phone || "",

            role:
              userData.role ||
              "customer",

          });

          // ADDRESSES
          if (
            userData.savedAddresses
          ) {

            setSavedAddresses(

              userData.savedAddresses

            );

            const defaultAddr =
              userData.savedAddresses.find(
                (item) =>
                  item.isDefault
              );

            if (defaultAddr) {

              setDefaultAddress(
                defaultAddr
              );

            }

          }

        }

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to load profile"
        );

      } finally {

        setLoading(false);

      }

    };

  // LOAD PROFILE
  useEffect(() => {

    fetchProfile();

  }, [currentUser]);

  // HANDLE CHANGE
  const handleChange = (e) => {

    setProfileData({

      ...profileData,

      [e.target.name]:
        e.target.value,

    });

  };

  // SAVE PROFILE
  const saveProfile =
    async () => {

      // PHONE VALIDATION
      if (
        profileData.phone &&
        profileData.phone.length !==
          10
      ) {

        toast.error(
          "Phone number must be 10 digits"
        );

        return;

      }

      try {

        setSaving(true);

        // SAVE PROFILE
        await setDoc(

          doc(
            db,
            "users",
            currentUser.uid
          ),

          {

            ...profileData,

            uid:
              currentUser.uid,

          },

          {

            merge: true,

          }

        );

        // REFRESH USER
        await fetchUserProfile(
          currentUser.uid
        );

        // UPDATE LOCAL USER
        updateUser({

          ...profileData,

        });

        toast.success(
          "Profile Updated Successfully"
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to update profile"
        );

      } finally {

        setSaving(false);

      }

    };

  // SET DEFAULT ADDRESS
  const setAsDefaultAddress =
    async (selectedIndex) => {

      try {

        const updatedAddresses =
          savedAddresses.map(
            (
              item,
              index
            ) => ({

              ...item,

              isDefault:
                index ===
                selectedIndex,

            })
          );

        // UPDATE FIREBASE
        await updateDoc(

          doc(
            db,
            "users",
            currentUser.uid
          ),

          {

            savedAddresses:
              updatedAddresses,

          }
        );

        // UPDATE STATE
        setSavedAddresses(
          updatedAddresses
        );

        const selectedAddress =
          updatedAddresses[
            selectedIndex
          ];

        setDefaultAddress(
          selectedAddress
        );

        // REFRESH PROFILE
        await fetchUserProfile(
          currentUser.uid
        );

        toast.success(
          "Default address updated"
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to update address"
        );

      }

    };

  // LOADING
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-3xl font-bold">

        Loading Profile...

      </div>

    );

  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-gray-50 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-10"
      >
        {/* PROFILE CARD */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* TOP COVER HEADER */}
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 p-12 text-center overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
            >
              <FaUserCircle className="text-[7rem] md:text-[9rem] text-white/90 mx-auto mb-4 drop-shadow-xl relative z-10" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-white relative z-10 tracking-tight">My Profile</h1>
            <p className="mt-2 text-green-100 font-medium text-lg relative z-10">Manage your account and personal details</p>
          </div>

          {/* FORM */}
          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* NAME */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 transition-all duration-300"
              />
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 transition-all duration-300"
              />
            </div>

            {/* PHONE */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) setProfileData({ ...profileData, phone: value });
                }}
                placeholder="Enter 10-digit phone number"
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 transition-all duration-300"
              />
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="px-8 pb-10 md:px-12 md:pb-12">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={saveProfile}
              disabled={saving}
              className="w-full bg-gray-900 hover:bg-black text-white py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold transition-colors shadow-xl shadow-gray-900/20 flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FaSave className="text-xl" />
              {saving ? "Saving Changes..." : "Save Profile Changes"}
            </motion.button>
          </div>
        </div>

        {/* SAVED ADDRESSES */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-12 transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-10 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shadow-inner shrink-0">
                <FaMapMarkerAlt className="text-2xl" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Saved Addresses</h2>
            </div>
          </div>

          {savedAddresses.length === 0 ? (
            <div className="bg-gray-50/50 rounded-[1.5rem] p-12 text-center border border-dashed border-gray-200">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">No Addresses Found</h3>
              <p className="text-gray-500 mt-2 font-medium">You haven't saved any delivery addresses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {savedAddresses.map((address, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative rounded-[1.5rem] p-6 md:p-8 transition-all duration-300 border-2 overflow-hidden
                    ${address.isDefault ? "border-green-500 bg-green-50/30 shadow-md shadow-green-500/10" : "border-gray-100 hover:border-green-200 bg-white"}`}
                  >
                    {address.isDefault && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-xl">
                        Default
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <FaHome className={`text-2xl ${address.isDefault ? 'text-green-600' : 'text-gray-400'}`} />
                          <h3 className="text-xl font-bold text-gray-900">{address.type}</h3>
                        </div>
                        <div className="text-gray-600 text-[15px] leading-relaxed space-y-1">
                          <p><span className="font-semibold text-gray-800">Address:</span> {address.address}</p>
                          <p><span className="font-semibold text-gray-800">Landmark:</span> {address.landmark || "N/A"}</p>
                          <p><span className="font-semibold text-gray-800">Location:</span> {address.city} - {address.pincode}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {!address.isDefault && (
                          <button
                            onClick={() => setAsDefaultAddress(index)}
                            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-bold text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingIndex(index);
                            setAddressType(address.type);
                            setAddressData({
                              address: address.address,
                              city: address.city,
                              pincode: address.pincode,
                              landmark: address.landmark,
                            });
                            setShowAddressModal(true);
                          }}
                          className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const updatedAddresses = savedAddresses.filter((_, i) => i !== index);
                              await updateDoc(doc(db, "users", currentUser.uid), { savedAddresses: updatedAddresses });
                              setSavedAddresses(updatedAddresses);
                              if (address.isDefault) setDefaultAddress(null);
                              if (updatedAddresses.length > 0 && !updatedAddresses.some((item) => item.isDefault)) {
                                updatedAddresses[0].isDefault = true;
                                await updateDoc(doc(db, "users", currentUser.uid), { savedAddresses: updatedAddresses });
                                setSavedAddresses(updatedAddresses);
                                setDefaultAddress(updatedAddresses[0]);
                              }
                              toast.success("Address deleted");
                            } catch (error) {
                              toast.error("Failed to delete");
                            }
                          }}
                          className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-bold text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* ADDRESS MODAL */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] p-8 md:p-10 w-full max-w-xl shadow-2xl border border-gray-100"
            >
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Edit Address</h2>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Address Type</label>
                  <select
                    value={addressType}
                    onChange={(e) => setAddressType(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-800 outline-none focus:border-green-500 focus:bg-white transition-colors appearance-none"
                  >
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Street Address</label>
                  <input
                    type="text"
                    value={addressData.address}
                    onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                    placeholder="Enter full address"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-800 outline-none focus:border-green-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase">City</label>
                    <input
                      type="text"
                      value={addressData.city}
                      onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                      placeholder="City name"
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-800 outline-none focus:border-green-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Pincode</label>
                    <input
                      type="text"
                      value={addressData.pincode}
                      onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
                      placeholder="Postal code"
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-800 outline-none focus:border-green-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={addressData.landmark}
                    onChange={(e) => setAddressData({ ...addressData, landmark: e.target.value })}
                    placeholder="Near a known place"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-800 outline-none focus:border-green-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <button
                  onClick={async () => {
                    try {
                      const updatedAddresses = [...savedAddresses];
                      updatedAddresses[editingIndex] = {
                        ...updatedAddresses[editingIndex],
                        type: addressType,
                        address: addressData.address,
                        city: addressData.city,
                        pincode: addressData.pincode,
                        landmark: addressData.landmark,
                      };
                      await updateDoc(doc(db, "users", currentUser.uid), { savedAddresses: updatedAddresses });
                      setSavedAddresses(updatedAddresses);
                      setShowAddressModal(false);
                      setEditingIndex(null);
                      setAddressData({ address: "", city: "", pincode: "", landmark: "" });
                      setAddressType("Home");
                      toast.success("Address updated");
                    } catch (error) {
                      toast.error("Failed to update");
                    }
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-lg font-bold transition-colors shadow-lg shadow-green-600/20"
                >
                  Save Address
                </button>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl text-lg font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Profile;