import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Menu from "../components/Menu.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const response = await axios.get(
          "https://amazon-app-mid8.onrender.com/api/orders/my-orders",
          {
            withCredentials: true,
          }
        );
        const fetchedOrders = response.data.orders;

        const ordersWithDetails = await Promise.all(
          fetchedOrders.map(async (order) => {
            const populatedItems = await Promise.all(
              order.items.map(async (item) => {
                const productDetails = await axios.get(
                  `https://amazon-app-mid8.onrender.com/api/products/${item.productId}`
                );
                return { ...productDetails.data, quantity: item.quantity };
              })
            );
            return { ...order, items: populatedItems };
          })
        );
        setOrders(ordersWithDetails);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading your orders...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="h-[60px] hidden md:block"></div>
      <Menu />

      <div className="max-w-[90rem] mx-auto p-4 md:p-8 my-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">You have not placed any orders yet.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors shadow-md"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white p-6 shadow-md rounded-lg"
              >
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">ORDER PLACED</p>
                    <p>{new Date(order.orderPlacedAt).toDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">TOTAL</p>
                    <p className="font-bold">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">SHIP TO</p>
                    <p></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ORDER ID</p>
                    <p>{order._id}</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-2">
                  Order Status: {order.status}
                </h2>
                <p className="text-green-600 mb-4">
                  Estimated Delivery by {order.deliveryDate}
                </p>

                <div className="flex flex-col gap-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-20 h-20 object-contain"
                        onClick={() => navigate(`/product/${item.id}`)}
                      />
                      <div>
                        <p
                          className="font-semibold"
                          onClick={() => navigate(`/product/${item.id}`)}
                        >
                          {item.title}
                        </p>
                        <p
                          className="text-gray-600"
                          onClick={() => navigate(`/product/${item.id}`)}
                        >
                          Quantity: {item.quantity}
                        </p>
                        <button
                          onClick={() => navigate(`/order-placed/${order._id}`)}
                          className="mt-2 text-blue-600 hover:underline"
                        >
                          View or edit order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default MyOrders;
