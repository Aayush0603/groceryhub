import {
  createContext,
  useEffect,
  useState,
} from "react";

// CREATE CONTEXT
export const AuthContext =
  createContext();

function AuthProvider({ children }) {

  // CURRENT USER
  const [currentUser, setCurrentUser] =
    useState(null);

  // LOADING
  const [loading, setLoading] =
    useState(true);

  // CHECK SAVED SESSION
  useEffect(() => {

    try {

      const savedUser =
        localStorage.getItem(
          "grocery-user"
        );

      if (savedUser) {

        setCurrentUser(
          JSON.parse(savedUser)
        );

      }

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }, []);

  // LOGIN USER
  const login = (userData) => {

    setCurrentUser(userData);

    localStorage.setItem(
      "grocery-user",
      JSON.stringify(userData)
    );

  };

  // LOGOUT USER
  const logout = () => {

    setCurrentUser(null);

    localStorage.removeItem(
      "grocery-user"
    );

    // CLEAR CART ALSO
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

      }}
    >

      {!loading && children}

    </AuthContext.Provider>

  );

}

export default AuthProvider;