import { useContext } from "react";

import {
  Navigate,
} from "react-router-dom";

import {
  AuthContext,
} from "../context/AuthContext";

function ProtectedRoute({
  children,
}) {

  const { currentUser } =
    useContext(AuthContext);

  // NOT LOGGED IN
  if (!currentUser) {

    return <Navigate to="/login" />;

  }

  return children;

}

export default ProtectedRoute;