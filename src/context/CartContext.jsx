import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProductDetails = async (productId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/${productId}`
      );
      return response.data;
    } catch (err) {
      console.error(`Error fetching product ${productId}:`, err);
      return null;
    }
  };

  const fetchCartItemsFromBackend = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/auth/cart", {
        withCredentials: true,
      });

      const itemsFromBackend = response.data.items;

      if (itemsFromBackend.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const populatedItems = await Promise.all(
        itemsFromBackend.map(async (item) => {
          const productDetails = await fetchProductDetails(item.productId);
          return productDetails
            ? { ...productDetails, quantity: item.quantity }
            : null;
        })
      );

      setCartItems(populatedItems.filter((item) => item !== null));
    } catch (err) {
      console.error("Error fetching cart items from backend:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItemsFromBackend();
  }, []);

  const addToCart = async (product, quantity = 1) => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/cart/add",
        { productId: product.id, quantity },
        { withCredentials: true }
      );
      fetchCartItemsFromBackend();
    } catch (err) {
      console.error("Error adding item to cart:", err);
    }
  };

  const updateCartItemQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/cart/update",
        { productId: id, quantity: newQuantity },
        { withCredentials: true }
      );
      console.log(response.data.msg);
      fetchCartItemsFromBackend();
    } catch (err) {
      console.error("Error updating item quantity:", err);
    }
  };

  const removeCartItem = async (id) => {
    try {
      const response = await axios.delete(
        "http://localhost:5000/api/auth/cart/remove",
        { data: { productId: id }, withCredentials: true }
      );
      console.log(response.data.msg);
      fetchCartItemsFromBackend();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateCartItemQuantity,
        removeCartItem,
        clearCart,
        cartItemCount: cartItems.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
