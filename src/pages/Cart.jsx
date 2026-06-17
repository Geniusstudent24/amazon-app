import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Menu from "../components/Menu.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    updateCartItemQuantity,
    removeCartItem,
    cartItemCount,
  } = useCart();

  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // useEffect(() => {
  //   const storedUserName = localStorage.getItem("userName");
  //   if (storedUserName) {
  //     setIsUserSignedIn(true);
  //   } else {
  //     setIsUserSignedIn(false);
  //   }
  //   setLoadingStatus(false);
  // }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get(
          "https://amazon-app-mid8.onrender.com/api/auth/status",
          {
            withCredentials: true,
          }
        );
        console.log("Login status response:", response);
        if (response.status === 200) {
          setIsUserSignedIn(true);
        }
      } catch (err) {
        setIsUserSignedIn(false);
      } finally {
        setLoadingStatus(false);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(
          "https://amazon-app-mid8.onrender.com/api/products?_limit=5"
        );
        if (response.data && Array.isArray(response.data)) {
          setRecommendedProducts(response.data);
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoadingRecommendations(false);
      }
    };
    fetchRecommendations();
  }, []);

  const calculateSubtotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex text-yellow-500">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`}>&#9733;</span>
        ))}
        {halfStar && <span key="half">&#9733;</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">
            &#9733;
          </span>
        ))}
      </div>
    );
  };

  if (loadingStatus || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading your cart...</p>
      </div>
    );
  }
  return (
    <>
      <Navbar />
      <div className="h-[60px] hidden md:block"></div>
      <Menu />

      <div className="max-w-[90rem] mx-auto p-4 md:p-8 my-8 bg-gray-100">
        {cartItems.length === 0 && !isUserSignedIn && (
          <div className="bg-white p-6 shadow-md rounded-lg text-center border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Your Amazon Cart is empty.
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in to see your items, or shop today's deals.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full md:w-64 bg-yellow-400 text-black py-2 px-6 rounded-md font-semibold hover:bg-yellow-500 transition-colors shadow-md"
            >
              Sign in to your account
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full md:w-64 bg-gray-200 text-gray-800 py-2 px-6 rounded-md font-semibold hover:bg-gray-300 transition-colors shadow-md mt-2 md:ml-4"
            >
              Sign up
            </button>
            <p
              className="mt-6 text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate("/")}
            >
              Shop today's deals
            </p>
          </div>
        )}

        {cartItems.length === 0 && isUserSignedIn && (
          <div className="bg-white p-6 shadow-md rounded-lg text-center border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Your Amazon Cart is empty.
            </h2>
            <p className="text-gray-600 mb-6">
              Ready to shop? Explore today's deals!
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors shadow-md"
            >
              Shop today's deals
            </button>
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-white p-4 shadow-md rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center border-b py-4"
                >
                  <div
                    className="flex flex-col sm:flex-row items-start sm:items-center flex-1 cursor-pointer"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-24 h-24 object-contain mr-4 rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 mt-2 sm:mt-0">
                      <h3 className="text-lg font-semibold mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-xs mb-1">
                        Brand: {item.brand}
                      </p>
                      <p className="text-green-600 text-sm mb-2">In Stock</p>
                      <p className="text-gray-700 text-base font-bold mb-2">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center mt-2">
                    <label
                      htmlFor={`quantity-${item.id}`}
                      className="mr-2 text-sm"
                    >
                      Qty:
                    </label>
                    <select
                      id={`quantity-${item.id}`}
                      value={item.quantity}
                      onChange={(e) =>
                        updateCartItemQuantity(
                          item.id,
                          parseInt(e.target.value)
                        )
                      }
                      className="border border-gray-300 rounded p-1 text-sm bg-white"
                    >
                      {[...Array(item.stock > 10 ? 10 : item.stock)].map(
                        (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        )
                      )}
                    </select>
                    <button
                      onClick={() => removeCartItem(item.id)}
                      className="ml-4 text-blue-600 hover:text-orange-500 text-sm border-l border-gray-300 pl-4"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}{" "}
              <div className="text-right mt-4 text-lg font-bold">
                Subtotal ({cartItemCount} items):{" "}
                <span className="text-red-700">${calculateSubtotal()}</span>
              </div>
            </div>

            <div className="w-full md:w-80 bg-white p-4 shadow-md rounded-lg flex-shrink-0 h-fit">
              <h2 className="text-xl font-bold mb-4">
                Subtotal ({cartItems.length} items):{" "}
                <span className="text-red-700">${calculateSubtotal()}</span>
              </h2>
              <div className="flex items-center mb-4 text-sm">
                <input type="checkbox" id="gift-option" className="mr-2" />
                <label htmlFor="gift-option">This order contains a gift</label>
              </div>
              {isUserSignedIn ? (
                <button
                  className="w-full bg-yellow-500 text-black py-2 rounded-full font-semibold hover:bg-yellow-600 shadow-md"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to checkout
                </button>
              ) : (
                <div className="text-center">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-yellow-400 text-black py-2 px-6 rounded-md font-semibold hover:bg-yellow-500 transition-colors shadow-md"
                  >
                    Proceed to checkout
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Please sign in to proceed with your order.
                  </p>
                </div>
              )}
              {loadingRecommendations ? (
                <div className="text-center mt-8 text-gray-500">
                  Loading recommendations...
                </div>
              ) : (
                recommendedProducts.length > 0 && (
                  <div className="mt-8 border-t pt-4">
                    <h3 className="text-lg font-bold mb-4">
                      Customers Who Bought Items In Your Recent History Also
                      Bought
                    </h3>
                    {recommendedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-start mb-4 cursor-pointer"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-16 h-16 object-contain mr-3 rounded-md flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold line-clamp-2">
                            {product.title}
                          </p>
                          <div className="flex items-center text-xs text-gray-600">
                            {renderStars(product.rating)}
                            <span className="ml-1">
                              (
                              {Array.isArray(product.reviews)
                                ? product.reviews.length
                                : 0}
                              )
                            </span>
                          </div>
                          <p className="text-base font-bold">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Cart;
