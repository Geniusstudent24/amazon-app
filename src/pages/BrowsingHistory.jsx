import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Menu from "../components/Menu.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 

function BrowsingHistory() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const storedHistory =
          JSON.parse(localStorage.getItem("browsingHistory")) || [];

        
        if (storedHistory.length === 0) {
          setHistoryItems([]);
          setLoading(false);
          return;
        }

        
        const productDetailsPromises = storedHistory.map((productId) =>
          axios.get(`https://amazon-app-mid8.onrender.com/api/products/${productId}`)
        );

        const responses = await Promise.all(productDetailsPromises);
        const products = responses.map((res) => res.data);
        setHistoryItems(products);
      } catch (error) {
        console.error("Error fetching browsing history:", error);
        setHistoryItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("browsingHistory");
    setHistoryItems([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading browsing history...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="h-[60px] hidden md:block"></div>
      <Menu />

      <div className="max-w-[90rem] mx-auto p-4 md:p-8 my-8 bg-white shadow-lg rounded-lg">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Your Browsing History
          </h2>
          {historyItems.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {historyItems.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">You have not recently viewed items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {historyItems.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="bg-white p-4 shadow-md rounded-lg flex flex-col items-start cursor-pointer transition-transform transform hover:scale-105"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-48 object-contain mb-4 rounded-md"
                />
                <h3 className="text-base font-semibold mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-lg font-bold text-red-700">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default BrowsingHistory;
