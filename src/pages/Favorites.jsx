import { useContext } from "react";
import { Link } from "react-router-dom";
import { FavoritesContext } from "../context/FavoritesContext";
import ProductCard from "../components/ProductCard";
import { FaHeart, FaArrowLeft } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function Favorites() {
  const { t } = useTranslation();
  const { favoriteItems } = useContext(FavoritesContext);

  return (
    <section className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-6">
          <Link to="/products" className="p-2 bg-white rounded-full hover:bg-green-50 text-green-600 transition shadow-sm border border-gray-100">
            <FaArrowLeft />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
              <FaHeart className="text-xl" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">{t("favorites.pageTitle", "Your Favorites")}</h1>
          </div>
        </div>

        {favoriteItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 text-center px-4">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <FaHeart className="text-red-200 text-5xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("favorites.emptyTitle", "No favorites yet")}</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              {t("favorites.emptyDesc", "You haven't added any products to your favorites. Discover our fresh groceries and tap the heart icon to save them here!")}
            </p>
            <Link 
              to="/products"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              {t("favorites.exploreProducts", "Explore Products")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {favoriteItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default Favorites;
