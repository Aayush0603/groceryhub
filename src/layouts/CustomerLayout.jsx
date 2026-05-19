import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";

import WhatsAppButton from "../components/WhatsAppButton";

function CustomerLayout() {

  return (

    <>

      <Navbar />

      <WhatsAppButton />

      <Outlet />

    </>

  );
}

export default CustomerLayout;