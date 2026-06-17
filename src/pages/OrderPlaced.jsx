import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Menu from "../components/Menu.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import axios from "axios";
import Swal from "sweetalert2";

function OrderPlaced() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTracking, setShowTracking] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("Ordered");
  const [statusText, setStatusText] = useState("Order has been placed.");
  const statuses = ["Ordered", "Shipped", "Out for delivery", "Delivered"];

  useEffect(() => {
    const fetchOrdersAndProfile = async () => {
      try {
        const profileResponse = await axios.get(
          "https://amazon-app-mid8.onrender.com/api/auth/profile",
          {
            withCredentials: true,
          }
        );
        setUserProfile(profileResponse.data);

        const ordersResponse = await axios.get(
          "https://amazon-app-mid8.onrender.com/api/orders/my-orders",
          {
            withCredentials: true,
          }
        );
        const fetchedOrders = ordersResponse.data.orders;

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

        if (orderId) {
          const foundOrder = ordersWithDetails.find((o) => o._id === orderId);
          if (foundOrder) {
            setSelectedOrder(foundOrder);
            setCurrentStatus(foundOrder.status);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchOrdersAndProfile();
  }, [navigate, orderId]);

  useEffect(() => {
    let statusUpdateInterval;
    if (showTracking && selectedOrder) {
      statusUpdateInterval = setInterval(async () => {
        const currentIndex = statuses.indexOf(currentStatus);
        if (currentIndex < statuses.length - 1) {
          const nextStatus = statuses[currentIndex + 1];
          try {
            await axios.put(
              `https://amazon-app-mid8.onrender.com/api/orders/update-status/${selectedOrder._id}`,
              { newStatus: nextStatus },
              {
                withCredentials: true,
              }
            );
            setCurrentStatus(nextStatus);
            switch (nextStatus) {
              case "Shipped":
                setStatusText("Your package has been shipped.");
                break;
              case "Out for delivery":
                setStatusText("Your package is out for delivery.");
                break;
              case "Delivered":
                setStatusText("Your order has been delivered.");
                clearInterval(statusUpdateInterval);
                break;
              default:
                break;
            }
          } catch (err) {
            console.error("Failed to update status:", err);
          }
        }
      }, 5000);
    }
    return () => {
      if (statusUpdateInterval) clearInterval(statusUpdateInterval);
    };
  }, [showTracking, currentStatus, selectedOrder]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowTracking(false);
    navigate(`/order-placed/${order._id}`);
  };

  const handleCancelOrder = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will cancel this order",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (selectedOrder && selectedOrder._id) {
            await axios.post(
              `https://amazon-app-mid8.onrender.com/api/orders/cancel/${selectedOrder._id}`,
              {},
              {
                withCredentials: true,
              }
            );
            Swal.fire({
              title: "Cancelled!",
              text: "Your order has been cancelled.",
              icon: "success",
            });
            setIsCancelled(true);
            setSelectedOrder(null);
            navigate("/my-orders");
          }
        } catch (err) {
          console.error("Error cancelling order:", err);
          Swal.fire({
            title: "Error!",
            text: "Failed to cancel order. Please try again.",
            icon: "error",
          });
        }
      }
    });
  };

  const getStatusClass = (status) => {
    const statusIndex = statuses.indexOf(status);
    const orderStatusIndex = statuses.indexOf(selectedOrder?.status);
    if (orderStatusIndex >= statusIndex) {
      return "bg-blue-600";
    }
    return "bg-gray-300";
  };

  if (loading || isCancelled || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading your orders...</p>
      </div>
    );
  }

  const renderOrdersList = () => (
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
            <div key={order._id} className="bg-white p-6 shadow-md rounded-lg">
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
                  <p>{userProfile?.user?.name}</p>
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
                    />
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      <button
                        onClick={() => handleViewOrder(order)}
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
  );

  const renderSingleOrderDetails = () => (
    <div className="max-w-[90rem] mx-auto p-4 md:p-8 my-8 bg-gray-100">
      <div className="bg-white p-6 shadow-md rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Order Details</h2>
          <button
            onClick={() => {
              navigate("/my-orders");
              setSelectedOrder(null);
            }}
            className="text-blue-600 text-sm hover:underline"
          >
            See all orders
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div>
            <p>
              <span className="font-semibold">Order ID:</span>{" "}
              {selectedOrder._id}
            </p>
            <p>
              <span className="font-semibold">Order Total:</span> ${" "}
              {selectedOrder.totalAmount.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">Order Placed:</span>{" "}
              {new Date(selectedOrder.orderPlacedAt).toDateString()}
            </p>
          </div>
          <div>
            <p>
              <span className="font-semibold">Payment Method:</span>{" "}
              {selectedOrder.paymentMethod}
            </p>
            <p>
              <span className="font-semibold">Items:</span>{" "}
              {selectedOrder.items.length}
            </p>
            <p>
              <span className="font-semibold">Ship To:</span>{" "}
              {userProfile?.user?.name}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white p-6 shadow-md rounded-lg">
          <h3 className="text-xl font-bold mb-4">Ordered Items</h3>
          {selectedOrder.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b py-4"
              onClick={() => navigate(`/product/${item.id}`)}
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-16 h-16 object-contain rounded"
              />
              <div>
                <p className="font-semibold line-clamp-2">{item.title}</p>
                <p className="text-gray-600">Qty: {item.quantity}</p>
                <p className="font-bold text-red-700">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full md:w-80 h-fit bg-white p-6 shadow-md rounded-lg flex-shrink-0">
          <button
            onClick={() => setShowTracking(true)}
            className="w-full bg-yellow-500 text-black py-2 rounded-full font-semibold hover:bg-yellow-600 transition-colors shadow-md"
          >
            Track Package
          </button>
          <button
            onClick={handleCancelOrder}
            className="w-full mt-4 bg-red-500 text-white py-2 rounded-full font-semibold hover:bg-red-600 transition-colors shadow-md"
          >
            Cancel Order
          </button>
          <button
            onClick={() =>
              alert("Write a product review feature not yet implemented.")
            }
            className="w-full mt-4 bg-gray-300 text-black py-2 rounded-full font-semibold hover:bg-gray-400 transition-colors shadow-md"
          >
            Write a product review
          </button>
        </div>
      </div>
    </div>
  );

  const renderTrackingUI = () => (
    <div className="max-w-[90rem] mx-auto p-4 md:p-8 my-8 bg-gray-100">
      <div className="bg-white p-6 shadow-md rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Arriving {selectedOrder.deliveryDate}
          </h2>
          <button
            onClick={() => setShowTracking(false)}
            className="text-blue-600 text-sm hover:underline"
          >
            See all orders
          </button>
        </div>

        <p className="text-gray-700 mb-4">{statusText}</p>

        <div className="flex items-center gap-4 border-b py-4">
          <img
            src={selectedOrder.items[0]?.thumbnail}
            alt={selectedOrder.items[0]?.title}
            className="w-24 h-24 object-contain"
          />
          <p className="text-sm text-gray-600">One package</p>
        </div>

        <div className="my-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 transform -translate-y-1/2"></div>
          <div className="relative flex justify-between items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full ${getStatusClass(
                  "Ordered"
                )} flex items-center justify-center text-white font-bold`}
              >
                1
              </div>
              <span className="mt-2 text-sm text-center">Ordered</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full ${getStatusClass(
                  "Shipped"
                )} flex items-center justify-center text-white font-bold`}
              >
                2
              </div>
              <span className="mt-2 text-sm text-center">Shipped</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full ${getStatusClass(
                  "Out for delivery"
                )} flex items-center justify-center text-white font-bold`}
              >
                3
              </div>
              <span className="mt-2 text-sm text-center">Out for delivery</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full ${getStatusClass(
                  "Delivered"
                )} flex items-center justify-center text-white font-bold`}
              >
                4
              </div>
              <span className="mt-2 text-sm text-center">Delivered</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-gray-700">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold text-lg mb-2">Delivery Info</h4>
            <p>
              <span className="text-blue-600 hover:underline cursor-pointer">
                Update delivery instructions
              </span>
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold text-lg mb-2">Shipping Address</h4>
            <p className="font-semibold">{userProfile?.user?.name}</p>
            <p>{userProfile?.location?.formatted}</p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold text-lg mb-2">Order Info</h4>
            <p>
              <span
                onClick={() => setShowTracking(false)}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                View order details
              </span>
            </p>
            <p>
              <span
                onClick={handleCancelOrder}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Cancel order
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="h-[60px] hidden md:block"></div>
      <Menu />
      {selectedOrder
        ? showTracking
          ? renderTrackingUI()
          : renderSingleOrderDetails()
        : renderOrdersList()}
      <Footer />
    </>
  );
}

export default OrderPlaced;
