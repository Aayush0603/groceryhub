import { useContext } from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  AuthContext,
} from "../context/AuthContext";

function ProtectedRoute({
  children,
}) {

  const { currentUser } =
    useContext(AuthContext);

  const location =
    useLocation();

  // NOT LOGGED IN
  if (!currentUser) {

    return (

      <Navigate
        to="/login"
        state={{
          from:
            location.pathname,
        }}
        replace
      />

    );

  }

  return children;

}

export default ProtectedRoute;