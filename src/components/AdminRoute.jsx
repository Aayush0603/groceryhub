import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  AuthContext,
} from "../context/AuthContext";

import {
  db,
} from "../firebase/firebase";

function AdminRoute({
  children,
}) {

  const { currentUser } =
    useContext(AuthContext);

  const [loading, setLoading] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  // CHECK ADMIN ROLE
  useEffect(() => {

    const checkAdmin = async () => {

      if (!currentUser) {

        setLoading(false);

        return;

      }

      try {

        const userRef =
          doc(
            db,
            "users",
            currentUser.uid
          );

        const userSnap =
          await getDoc(userRef);

          console.log(
  "CURRENT USER:",
  currentUser
);

console.log(
  "UID:",
  currentUser?.uid
);

console.log(
  "DOC EXISTS:",
  userSnap.exists()
);

console.log(
  "USER DATA:",
  userSnap.data()
);

        if (
          userSnap.exists()
        ) {

          const userData =
            userSnap.data();

          if (
            userData.role ===
            "admin"
          ) {

            setIsAdmin(true);

          }

        }

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    };

    checkAdmin();

  }, [currentUser]);

  // LOADING
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-3xl font-bold text-green-600">

        Checking Access...

      </div>

    );

  }

  // NOT ADMIN
  if (!isAdmin) {

    return <Navigate to="/" />;

  }

  return children;

}

export default AdminRoute;