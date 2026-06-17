import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "https://amazon-app-mid8.onrender.com/api/products?_limit=194"
        );
        setAllProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (allProducts.length === 0 && !error) {
      fetchProducts();
    }
  }, [allProducts, error]);

  return (
    <ProductContext.Provider value={{ allProducts, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  return useContext(ProductContext);
};
