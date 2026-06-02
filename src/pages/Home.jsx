import Hero from "../components/Hero";

import Products from "../components/Products";

import Contact from "../components/Contact";

import Footer from "../components/Footer";

function Home() {

  return (

    <main className="pt-16 md:pt-20 overflow-hidden">

      {/* HERO SECTION */}
      <Hero />

      {/* PRODUCTS SECTION */}
      <Products />

      {/* CONTACT SECTION */}
      <Contact />

      {/* FOOTER */}
      <Footer />

    </main>

  );

}

export default Home;