import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../firebase/firebase";

// CREATE CONTEXT
export const AuthContext =
  createContext();

function AuthProvider({ children }) {

  const [currentUser, setCurrentUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // CHECK USER SESSION
  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {

          setCurrentUser(user);

          setLoading(false);

        }
      );

    return unsubscribe;

  }, []);

  return (

    <AuthContext.Provider
      value={{
        currentUser,
      }}
    >

      {!loading && children}

    </AuthContext.Provider>

  );
}

export default AuthProvider;