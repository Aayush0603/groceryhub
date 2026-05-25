import {
  useContext,
  useEffect,
  useState,
} from "react";

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

    <section className="min-h-screen bg-gray-100 py-28 px-6">

      <div className="max-w-5xl mx-auto space-y-10">

        {/* PROFILE CARD */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* TOP */}
          <div className="bg-green-600 text-white p-10 text-center">

            <FaUserCircle className="text-8xl mx-auto mb-5" />

            <h1 className="text-5xl font-extrabold">

              My Profile

            </h1>

            <p className="mt-4 text-lg text-green-100">

              Manage your account details

            </p>

          </div>

          {/* FORM */}
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* NAME */}
            <div>

              <label className="block text-lg font-bold text-gray-700 mb-3">

                Full Name

              </label>

              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full p-5 rounded-2xl border border-gray-200 outline-none focus:border-green-500"
              />

            </div>

            {/* EMAIL */}
            <div>

              <label className="block text-lg font-bold text-gray-700 mb-3">

                Email

              </label>

              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full p-5 rounded-2xl border border-gray-200 outline-none focus:border-green-500"
              />

            </div>

            {/* PHONE */}
            <div>

              <label className="block text-lg font-bold text-gray-700 mb-3">

                Phone Number

              </label>

              <input
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={(e) => {

                  const value =
                    e.target.value.replace(
                      /\D/g,
                      ""
                    );

                  if (
                    value.length <= 10
                  ) {

                    setProfileData({

                      ...profileData,

                      phone: value,

                    });

                  }

                }}
                placeholder="Enter phone number"
                className="w-full p-5 rounded-2xl border border-gray-200 outline-none focus:border-green-500"
              />

            </div>

          </div>

          {/* SAVE BUTTON */}
          <div className="p-10 pt-0">

            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl text-2xl font-bold transition duration-300 flex items-center justify-center gap-4"
            >

              <FaSave />

              {saving
                ? "Saving..."
                : "Save Profile"}

            </button>

          </div>

        </div>

        {/* SAVED ADDRESSES */}
<div className="bg-white rounded-3xl shadow-2xl p-10">

  <div className="flex items-center justify-between mb-10">

    <div className="flex items-center gap-4">

      <FaMapMarkerAlt className="text-4xl text-green-600" />

      <h2 className="text-4xl font-extrabold text-gray-900">

        Saved Addresses

      </h2>

    </div>

  </div>

  {savedAddresses.length === 0 ? (

    <div className="bg-gray-100 rounded-2xl p-10 text-center">

      <h3 className="text-2xl font-bold text-gray-700">

        No Saved Addresses

      </h3>

      <p className="text-gray-500 mt-3">

        Add an address during checkout

      </p>

    </div>

  ) : (

    <div className="space-y-6">

      {savedAddresses.map(
        (
          address,
          index
        ) => (

          <div
            key={index}
            className={`border-2 rounded-3xl p-8 transition duration-300
            ${
              address.isDefault

                ? "border-green-500 bg-green-50"

                : "border-gray-200"
            }`}
          >

            {/* HEADER */}
            <div className="flex items-center justify-between mb-5">

              <div className="flex items-center gap-4">

                <FaHome className="text-3xl text-green-600" />

                <div>

                  <h3 className="text-2xl font-bold text-gray-900">

                    {address.type}

                  </h3>

                  {address.isDefault && (

                    <p className="text-green-700 font-bold mt-1">

                      Default Address

                    </p>

                  )}

                </div>

              </div>

              {!address.isDefault && (

                <button
                  onClick={() =>
                    setAsDefaultAddress(
                      index
                    )
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold transition duration-300"
                >

                  Set Default

                </button>

              )}

            </div>

            {/* ADDRESS DETAILS */}
            <div className="space-y-3 text-gray-700 text-lg">

              <p>

                <span className="font-bold">

                  Address:

                </span>{" "}

                {address.address}

              </p>

              <p>

                <span className="font-bold">

                  Landmark:

                </span>{" "}

                {address.landmark || "N/A"}

              </p>

              <p>

                <span className="font-bold">

                  City:

                </span>{" "}

                {address.city}

              </p>

              <p>

                <span className="font-bold">

                  Pincode:

                </span>{" "}

                {address.pincode}

              </p>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 mt-8">

              {/* EDIT */}
              <button
  onClick={() => {

    setEditingIndex(
      index
    );

    setAddressType(
      address.type
    );

    setAddressData({

      address:
        address.address,

      city:
        address.city,

      pincode:
        address.pincode,

      landmark:
        address.landmark,

    });

    setShowAddressModal(
      true
    );

  }}
  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition duration-300"
>

  Edit

</button>

              {/* DELETE */}
              <button
                onClick={async () => {

                  try {

                    const updatedAddresses =
                      savedAddresses.filter(
                        (
                          _,
                          i
                        ) =>
                          i !== index
                      );

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

                    setSavedAddresses(
                      updatedAddresses
                    );

                    // REMOVE DEFAULT
                    if (
                      address.isDefault
                    ) {

                      setDefaultAddress(
                        null
                      );

                    }

                    // AUTO SET FIRST AS DEFAULT
                    if (
                      updatedAddresses.length > 0 &&
                      !updatedAddresses.some(
                        (item) =>
                          item.isDefault
                      )
                    ) {

                      updatedAddresses[0].isDefault =
                        true;

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

                      setSavedAddresses(
                        updatedAddresses
                      );

                      setDefaultAddress(
                        updatedAddresses[0]
                      );

                    }

                    toast.success(
                      "Address deleted successfully"
                    );

                  } catch (error) {

                    console.error(error);

                    toast.error(
                      "Failed to delete address"
                    );

                  }

                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition duration-300"
              >

                Delete

              </button>

            </div>

          </div>

        )
      )}

    </div>

  )}

</div>

    </div>

    {/* ADDRESS MODAL */}
{showAddressModal && (

  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">

    <div className="bg-white rounded-3xl p-8 w-full max-w-2xl">

      <h2 className="text-3xl font-bold mb-8">

        Edit Address

      </h2>

      {/* TYPE */}
      <select
        value={addressType}
        onChange={(e) =>
          setAddressType(
            e.target.value
          )
        }
        className="w-full border border-gray-200 rounded-2xl p-5 mb-5 outline-none"
      >

        <option>
          Home
        </option>

        <option>
          Work
        </option>

        <option>
          Other
        </option>

      </select>

      {/* ADDRESS */}
      <input
        type="text"
        value={addressData.address}
        onChange={(e) =>
          setAddressData({

            ...addressData,

            address:
              e.target.value,

          })
        }
        placeholder="Address"
        className="w-full border border-gray-200 rounded-2xl p-5 mb-5 outline-none"
      />

      {/* CITY */}
      <input
        type="text"
        value={addressData.city}
        onChange={(e) =>
          setAddressData({

            ...addressData,

            city:
              e.target.value,

          })
        }
        placeholder="City"
        className="w-full border border-gray-200 rounded-2xl p-5 mb-5 outline-none"
      />

      {/* PINCODE */}
      <input
        type="text"
        value={addressData.pincode}
        onChange={(e) =>
          setAddressData({

            ...addressData,

            pincode:
              e.target.value,

          })
        }
        placeholder="Pincode"
        className="w-full border border-gray-200 rounded-2xl p-5 mb-5 outline-none"
      />

      {/* LANDMARK */}
      <input
        type="text"
        value={addressData.landmark}
        onChange={(e) =>
          setAddressData({

            ...addressData,

            landmark:
              e.target.value,

          })
        }
        placeholder="Landmark"
        className="w-full border border-gray-200 rounded-2xl p-5 mb-8 outline-none"
      />

      {/* BUTTONS */}
      <div className="flex gap-4">

        <button
          onClick={async () => {

            try {

              const updatedAddresses =
                [...savedAddresses];

              updatedAddresses[
                editingIndex
              ] = {

                ...updatedAddresses[
                  editingIndex
                ],

                type:
                  addressType,

                address:
                  addressData.address,

                city:
                  addressData.city,

                pincode:
                  addressData.pincode,

                landmark:
                  addressData.landmark,

              };

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

              setSavedAddresses(
  updatedAddresses
);

setShowAddressModal(
  false
);

// RESET EDIT STATE
setEditingIndex(
  null
);

// RESET FORM
setAddressData({

  address: "",

  city: "",

  pincode: "",

  landmark: "",

});

// RESET TYPE
setAddressType(
  "Home"
);

toast.success(
  "Address updated successfully"
);

            } catch (error) {

              console.error(error);

              toast.error(
                "Failed to update address"
              );

            }

          }}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold"
        >

          Save Changes

        </button>

        <button
          onClick={() =>
            setShowAddressModal(
              false
            )
          }
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-2xl font-bold"
        >

          Cancel

        </button>

      </div>

    </div>

  </div>

)}

    </section>

  );

}

export default Profile;