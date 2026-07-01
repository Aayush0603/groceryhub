import { createContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState(() => {
    try {
      const savedFavorites = localStorage.getItem("gandhiBazaarFavorites");
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch (error) {
      console.error("Failed to parse favorites", error);
      return [];
    }
  });

  // Save to LocalStorage whenever items change
  useEffect(() => {
    localStorage.setItem("gandhiBazaarFavorites", JSON.stringify(favoriteItems));
  }, [favoriteItems]);

  const addToFavorites = (product) => {
    const exists = favoriteItems.find((item) => item.id === product.id);
    if (exists) {
      toast.error("Already in favorites!");
      return;
    }
    setFavoriteItems([...favoriteItems, product]);
    toast.success("Added to favorites!", { icon: "❤️" });
  };

  const removeFromFavorites = (productId) => {
    setFavoriteItems(favoriteItems.filter((item) => item.id !== productId));
    toast.success("Removed from favorites");
  };

  const isFavorite = (productId) => {
    return favoriteItems.some((item) => item.id === productId);
  };

  const toggleFavorite = (product) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteItems,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
