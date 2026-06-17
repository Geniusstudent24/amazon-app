import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Menu from "../components/Menu.jsx";
import Footer from "../components/Footer.jsx";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Checkout() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedDonation, setSelectedDonation] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          setUserProfile(response.data);
        } else {
          navigate("/login");
        }
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const calculatedSubtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const calculatedTax = calculatedSubtotal * 0.1;

    let currentDeliveryCharge = 0;
    if (selectedPaymentMethod === "cod") {
      currentDeliveryCharge = 40;
    }

    const finalAmount =
      calculatedSubtotal +
      calculatedTax +
      currentDeliveryCharge +
      selectedDonation;

    setSubtotal(calculatedSubtotal);
    setTax(calculatedTax);
    setDeliveryCharge(currentDeliveryCharge);
    setTotalAmount(finalAmount);

    const today = new Date();
    today.setDate(today.getDate() + 4);
    setDeliveryDate(today.toDateString());
  }, [cartItems, selectedDonation, selectedPaymentMethod]);

  const handleUsePaymentMethod = () => {
    if (selectedPaymentMethod) {
      setIsPaymentConfirmed(true);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        subtotal,
        tax,
        deliveryCharge: selectedPaymentMethod === "cod" ? 40 : 0,
        totalAmount: totalAmount + selectedDonation,
        paymentMethod: selectedPaymentMethod,
        deliveryDate,
      };

      const response = await axios.post(
        "http://localhost:5000/api/orders/place",
        orderData,
        { withCredentials: true }
      );
      clearCart();

      navigate(`/order-placed/${response.data.order._id}`);
    } catch (err) {
      console.error(
        "Error placing order:",
        err.response ? err.response.data : err.message
      );
      alert("Failed to place order. Please try again.");
      navigate("/login");
    }
  };

  const renderPaymentOptions = () => (
    <div className="flex flex-col gap-4">
      <label
        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
          selectedPaymentMethod === "card"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        <input
          type="radio"
          name="paymentMethod"
          value="card"
          checked={selectedPaymentMethod === "card"}
          onChange={() => setSelectedPaymentMethod("card")}
          className="mr-3"
        />
        <div>
          <h4 className="font-semibold text-lg">Credit or debit card</h4>
          <div className="flex gap-2 mt-2">
            <img src="visa.png" alt="VISA" className="h-6" />
            <img src="mastercare.jpg" alt="Mastercard" className="h-6" />
            <img src="discover.png" alt="Amex" className="h-6" />
            <img src="amazon_pay.jpg" alt="Amazon Pay" className="h-6" />
          </div>
        </div>
      </label>

      <label
        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
          selectedPaymentMethod === "netbanking"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        <input
          type="radio"
          name="paymentMethod"
          value="netbanking"
          checked={selectedPaymentMethod === "netbanking"}
          onChange={() => setSelectedPaymentMethod("netbanking")}
          className="mr-3"
        />
        <div>
          <h4 className="font-semibold text-lg">Net Banking</h4>
        </div>
      </label>

      <label
        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
          selectedPaymentMethod === "upi"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        <input
          type="radio"
          name="paymentMethod"
          value="upi"
          checked={selectedPaymentMethod === "upi"}
          onChange={() => setSelectedPaymentMethod("upi")}
          className="mr-3"
        />
        <div>
          <h4 className="font-semibold text-lg">Other UPI Apps</h4>
        </div>
      </label>

      <label
        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
          selectedPaymentMethod === "cod"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        <input
          type="radio"
          name="paymentMethod"
          value="cod"
          checked={selectedPaymentMethod === "cod"}
          onChange={() => setSelectedPaymentMethod("cod")}
          className="mr-3"
        />
        <div>
          <h4 className="font-semibold text-lg">
            Cash on Delivery / Pay on Delivery
          </h4>
          <p className="text-sm text-gray-500">
            A convenience fee of ${deliveryCharge.toFixed(2)} will apply.
          </p>
        </div>
      </label>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading checkout details...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="h-[60px] hidden md:block"></div>
      <Menu />

      <div className="max-w-[90rem] mx-auto p-4 md:p-8 my-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Select a payment method</h1>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-white p-6 shadow-md rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-4">Delivery to</h2>
              {userProfile && userProfile.location ? (
                <div>
                  <p className="font-semibold">{userProfile.user.name}</p>
                  <p>{userProfile.user.email || userProfile.user.phone}</p>
                  <p>{userProfile.location.formatted}</p>
                </div>
              ) : (
                <p className="text-red-500">
                  Please set your shipping address in your profile.
                </p>
              )}
            </div>

            <div className="bg-white p-6 shadow-md rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              {renderPaymentOptions()}
            </div>
          </div>

          <div className="w-full md:w-80 h-fit bg-white p-6 shadow-md rounded-lg">
            <button
              onClick={handleUsePaymentMethod}
              disabled={!selectedPaymentMethod}
              className={`w-full py-2 rounded-full font-semibold transition-colors shadow-md ${
                selectedPaymentMethod
                  ? "bg-yellow-400 text-black hover:bg-yellow-500"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Use this Payment Method
            </button>

            <h2 className="text-xl font-bold mt-6 mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Items:</span>
              <span>
                {selectedPaymentMethod ? `$${subtotal.toFixed(2)}` : "---"}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax (10%):</span>
              <span>
                {selectedPaymentMethod ? `$${tax.toFixed(2)}` : "---"}
              </span>
            </div>
            <div className="flex justify-between font-bold mb-2">
              <span>Delivery:</span>
              <span>
                {selectedPaymentMethod
                  ? deliveryCharge > 0
                    ? `$${deliveryCharge.toFixed(2)}`
                    : "FREE"
                  : "---"}
              </span>
            </div>
            <div className="flex justify-between font-bold mb-2">
              <span>Estimated Delivery:</span>
              <span>{deliveryDate}</span>
            </div>
            <div className="border-t border-gray-300 pt-4 mt-4 text-xl font-bold flex justify-between">
              <span>Order Total:</span>
              <span className="text-red-700">
                {selectedPaymentMethod ? `$${totalAmount.toFixed(2)}` : "---"}
              </span>
            </div>

            {isPaymentConfirmed && (
              <button
                onClick={handlePlaceOrder}
                className="mt-6 w-full py-2 rounded-full font-semibold transition-colors shadow-md bg-yellow-400 text-black hover:bg-yellow-500"
              >
                Place Your Order
              </button>
            )}

            <div className="border-t border-gray-300 pt-4 mt-4">
              <h3 className="font-bold mb-2">Donate for a Cause:</h3>
              <div className="flex gap-2 mb-4">
                {[0, 10, 20, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedDonation(amount)}
                    className={`px-4 py-2 border rounded-full text-sm font-semibold transition-colors ${
                      selectedDonation === amount
                        ? "bg-yellow-400 border-yellow-500"
                        : "bg-gray-200 border-gray-300 hover:bg-gray-300"
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Checkout;
