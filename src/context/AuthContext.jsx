import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

// CREATE CONTEXT
export const AuthContext =
  createContext();

function AuthProvider({
  children,
}) {

  // CURRENT USER
  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  // LOADING
  const [loading, setLoading] =
    useState(true);

  // FETCH LATEST USER PROFILE
  const fetchUserProfile =
    async (uid) => {

      try {

        const userRef =
          doc(
            db,
            "users",
            uid
          );

        const userSnap =
          await getDoc(
            userRef
          );

        if (
          userSnap.exists()
        ) {

          const userData = {

            uid,

            ...userSnap.data(),

          };

          // UPDATE STATE
          setCurrentUser(
            userData
          );

          // UPDATE LOCAL STORAGE
          localStorage.setItem(

            "grocery-user",

            JSON.stringify(
              userData
            )
          );

        }

      } catch (error) {

        console.error(error);

      }

    };

  // CHECK SAVED SESSION
  useEffect(() => {

    const checkSession =
      async () => {

        try {

          const savedUser =
            localStorage.getItem(
              "grocery-user"
            );

          if (savedUser) {

            const parsedUser =
              JSON.parse(
                savedUser
              );

            // TEMP USER
            setCurrentUser(
              parsedUser
            );

            // FETCH LATEST FIREBASE DATA
            await fetchUserProfile(
              parsedUser.uid
            );

          }

        } catch (error) {

          console.error(error);

        } finally {

          setLoading(false);

        }

      };

    checkSession();

  }, []);

  // LOGIN USER
  const login = async (
    userData
  ) => {

    try {

      // FETCH COMPLETE PROFILE
      await fetchUserProfile(
        userData.uid
      );

    } catch (error) {

      console.error(error);

    }

  };

  // UPDATE USER LOCALLY
  const updateUser =
    (updatedData) => {

      const updatedUser = {

        ...currentUser,

        ...updatedData,

      };

      setCurrentUser(
        updatedUser
      );

      localStorage.setItem(

        "grocery-user",

        JSON.stringify(
          updatedUser
        )
      );

    };

  // LOGOUT USER
  const logout = () => {

    setCurrentUser(null);

    localStorage.removeItem(
      "grocery-user"
    );

    // CLEAR CART
    localStorage.removeItem(
      "grocery-cart"
    );

  };

  return (

    <AuthContext.Provider
      value={{

        currentUser,

        login,

        logout,

        updateUser,

        fetchUserProfile,

      }}
    >

      {!loading &&
        children}

    </AuthContext.Provider>

  );

}

export default AuthProvider;