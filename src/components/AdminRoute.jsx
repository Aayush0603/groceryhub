import {
  useContext,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import {
  AuthContext,
} from "../context/AuthContext";

function AdminRoute({
  children,
}) {

  const {
    currentUser,
  } = useContext(
    AuthContext
  );

  // NOT LOGGED IN
  if (!currentUser) {

    return (
      <Navigate to="/login" />
    );

  }

  // NOT ADMIN
  if (
    currentUser.role !==
    "admin"
  ) {

    return (
      <Navigate to="/" />
    );

  }

  // ADMIN ACCESS
  return children;

}

export default AdminRoute;