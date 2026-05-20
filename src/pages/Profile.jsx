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
} from "firebase/firestore";

import {
  db,
} from "../firebase/firebase";

import { AuthContext } from "../context/AuthContext";

import {
  FaUserCircle,
  FaSave,
} from "react-icons/fa";

function Profile() {

  // CURRENT USER
  const {
    currentUser,
    login,
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

      address: "",

      city: "",

      pincode: "",

      role: "customer",

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

            address:
              userData.address || "",

            city:
              userData.city || "",

            pincode:
              userData.pincode || "",

            role:
              userData.role ||
              "customer",

          });

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

      // PINCODE VALIDATION
      if (
        profileData.pincode &&
        profileData.pincode.length !==
          6
      ) {

        toast.error(
          "Pincode must be 6 digits"
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

        // UPDATE SESSION
        login({

          ...currentUser,

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

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">

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

              Email (Optional)

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

          {/* CITY */}
          <div>

            <label className="block text-lg font-bold text-gray-700 mb-3">

              City

            </label>

            <input
              type="text"
              name="city"
              value={profileData.city}
              onChange={handleChange}
              placeholder="Enter city"
              className="w-full p-5 rounded-2xl border border-gray-200 outline-none focus:border-green-500"
            />

          </div>

          {/* PINCODE */}
          <div>

            <label className="block text-lg font-bold text-gray-700 mb-3">

              Pincode

            </label>

            <input
              type="text"
              name="pincode"
              value={profileData.pincode}
              onChange={(e) => {

                const value =
                  e.target.value.replace(
                    /\D/g,
                    ""
                  );

                if (
                  value.length <= 6
                ) {

                  setProfileData({

                    ...profileData,

                    pincode: value,

                  });

                }

              }}
              placeholder="Enter pincode"
              className="w-full p-5 rounded-2xl border border-gray-200 outline-none focus:border-green-500"
            />

          </div>

          {/* ADDRESS */}
          <div className="md:col-span-2">

            <label className="block text-lg font-bold text-gray-700 mb-3">

              Address

            </label>

            <textarea
              rows="5"
              name="address"
              value={profileData.address}
              onChange={handleChange}
              placeholder="Enter full address"
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

    </section>

  );

}

export default Profile;