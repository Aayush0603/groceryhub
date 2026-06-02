import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";

function CustomerLayout() {

  return (

    <>

      <Navbar />

      <Outlet />

    </>

  );
}

export default CustomerLayout;