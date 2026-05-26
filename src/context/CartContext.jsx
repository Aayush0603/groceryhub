import {
  createContext,
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

// CREATE CONTEXT
export const CartContext =
  createContext();

function CartProvider({ children }) {

  // LOAD CART FROM LOCAL STORAGE
  const [cartItems, setCartItems] =
    useState(() => {

      try {

        const savedCart =
          localStorage.getItem(
            "grocery-cart"
          );

        return savedCart
          ? JSON.parse(savedCart)
          : [];

      } catch (error) {

        console.error(
          "Failed to load cart:",
          error
        );

        return [];

      }

    });

  // SAVE CART TO LOCAL STORAGE
  useEffect(() => {

    localStorage.setItem(
      "grocery-cart",
      JSON.stringify(cartItems)
    );

  }, [cartItems]);

  // ADD TO CART
  const addToCart = (product) => {

    const existingProduct =
      cartItems.find(
        (item) =>
          item.id === product.id
      );

    // PRODUCT EXISTS
    if (existingProduct) {

      const updatedCart =
        cartItems.map((item) =>

          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item

        );

      setCartItems(updatedCart);

      toast.success(
        "Quantity increased"
      );

    } else {

      // ADD NEW PRODUCT
      const updatedCart = [

        ...cartItems,

        {
          ...product,
          quantity: 1,
        },

      ];

      setCartItems(updatedCart);

      toast.success(
        `${product.name} added to cart`
      );

    }

  };

  // INCREASE QUANTITY
  const increaseQuantity = (id) => {

    const updatedCart =
      cartItems.map((item) =>

        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item

      );

    setCartItems(updatedCart);

  };

  // DECREASE QUANTITY
  const decreaseQuantity = (id) => {

    const updatedCart = cartItems
      .map((item) =>

        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity - 1,
            }
          : item

      )
      .filter(
        (item) => item.quantity > 0
      );

    setCartItems(updatedCart);

  };

  // REMOVE PRODUCT
  const removeProduct = (id) => {

    const updatedCart =
      cartItems.filter(
        (item) => item.id !== id
      );

    setCartItems(updatedCart);

    toast.error(
      "Product removed"
    );

  };

  // CLEAR ENTIRE CART
  const clearCart = () => {

    setCartItems([]);

  };

  // TOTAL ITEMS
  const totalItems =
    cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  // TOTAL PRICE
  const totalPrice =
    cartItems.reduce(
      (total, item) =>
        total +
        item.price * item.quantity,
      0
    );

  return (

    <CartContext.Provider
      value={{

        cartItems,

        setCartItems,

        addToCart,

        increaseQuantity,

        decreaseQuantity,

        removeProduct,

        clearCart,

        totalItems,

        totalPrice,

      }}
    >

      {children}

    </CartContext.Provider>

  );
}

export default CartProvider;