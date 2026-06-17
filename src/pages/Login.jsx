import axios from "axios";
import React, { useState } from "react";

function Login() {
  const [step, setStep] = useState("start");
  const [input, setInput] = useState("");

  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [backendMessage, setBackendMessage] = useState("");
  const [isMessageError, setIsMessageError] = useState(false);

  const validateStart = () => {
    const err = {};
    if (!input.trim()) {
      err.input = "Email or phone number is required";
    } else if (input.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) err.input = "Invalid email format";
    } else {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(input)) err.input = "Invalid phone number";
    }
    return err;
  };

  const validateLogin = () => {
    const err = {};
    if (!password || password.length < 6) {
      err.password = "Password must be at least 6 characters";
    }
    return err;
  };

  const validateSignup = () => {
    const err = {};
    if (!name.trim()) err.name = "Name is required";
    if (!password || password.length < 6)
      err.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      err.confirmPassword = "Passwords do not match";
    return err;
  };

  const validateOtp = () => {
    const err = {};
    if (!/^\d{6}$/.test(otp)) err.otp = "OTP must be 6 digits";
    return err;
  };

  const handleContinue = async () => {
    setErrors({});
    setBackendMessage("");
    setIsMessageError(false);
    const err = validateStart();
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    try {
      const response = await axios.post(
        "https://amazon-app-mid8.onrender.com/api/auth/check-user",
        { input }
      );
      setBackendMessage(response.data.msg);
      setIsMessageError(!response.data.userExists);
      if (response.data.userExists) {
        setStep("login");
      } else {
        setStep("signup");
      }
    } catch (error) {
      console.error("User check failed:", error);
      setBackendMessage(
        error.response?.data?.msg || "Something went wrong. Please try again."
      );
      setIsMessageError(true);
      setErrors({
        input: error.response?.data?.msg || "Network error. Try again.",
      });
    }
  };

  const handleLoginSubmit = async () => {
    setErrors({});
    setBackendMessage("");
    setIsMessageError(false);

    const err = validateLogin();
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    try {
      const response = await axios.post(
        "https://amazon-app-mid8.onrender.com/api/auth/login",
        {
          input,
          password,
        },
        { withCredentials: true }
      );
      setBackendMessage(response.data.msg);
      setIsMessageError(false);
      setStep("otp");
    } catch (error) {
      console.error("Login failed:", error);
      setBackendMessage(
        error.response?.data?.msg || "Login failed. Please try again."
      );
      setIsMessageError(true);

      setErrors({
        password: error.response?.data?.msg || "Invalid credentials.",
      });
    }
  };

  const handleSignupSubmit = async () => {
    setErrors({});
    setBackendMessage("");
    setIsMessageError(false);
    const err = validateSignup();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    try {
      const response = await axios.post(
        "https://amazon-app-mid8.onrender.com/api/auth/signup",
        {
          input,
          password,
          name,
        },
        { withCredentials: true }
      );
      setBackendMessage(response.data.msg);
      setIsMessageError(false);
      setStep("otp");
    } catch (error) {
      setBackendMessage(
        error.response?.data?.msg || "Signup failed. Please try again."
      );
      setIsMessageError(true);
      setErrors({
        general:
          error.response?.data?.msg || "User already exists or network error.",
      });
    }
  };
  const handleOtpSubmit = async () => {
    setErrors({});
    setBackendMessage("");
    setIsMessageError(false);

    const err = validateOtp();
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    try {
      const response = await axios.post(
        "https://amazon-app-mid8.onrender.com/api/auth/verify-otp",
        { input, otp },
        { withCredentials: true }
      );

      localStorage.setItem("userName", response.data.user.name);
      if (response.data.location && response.data.location.formatted) {
        localStorage.setItem("userLocation", response.data.location.formatted);
      } else {
        localStorage.removeItem("userLocation");
      }

      setBackendMessage(response.data.msg);
      setIsMessageError(false);
      window.location.href = "/";
    } catch (error) {
      console.error("OTP verification failed:", error);
      setBackendMessage(
        error.response?.data?.msg || "Invalid OTP. Please try again."
      );
      setIsMessageError(true);
      setErrors({ otp: error.response?.data?.msg || "Invalid OTP." });
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="border rounded-md p-6 w-full max-w-md shadow">
        <div className="flex justify-center mb-4">
          <img className="h-[70px] object-contain" src="/signIn-Logo.png" />
        </div>
        <div className="border rounded-md p-6">
          {backendMessage && (
            <p
              className={`text-sm text-center mb-4 ${
                isMessageError ? "text-red-500" : "text-green-500"
              }`}
            >
              {backendMessage}
            </p>
          )}

          {step === "start" && (
            <>
              <h2 className="text-lg font-semibold mb-2">
                Sign in or create account
              </h2>
              <input
                type="text"
                placeholder="Enter mobile number or email"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-1"
              />
              {errors.input && (
                <p className="text-red-500 text-xs mb-2">{errors.input}</p>
              )}
              <button
                onClick={handleContinue}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded"
              >
                Continue
              </button>
            </>
          )}

          {step === "login" && (
            <>
              <h2 className="text-lg font-semibold mb-2">Sign in</h2>
              <p className="text-sm mb-2">
                {input}{" "}
                <button
                  onClick={() => {
                    setStep("start");
                    setBackendMessage("");
                    setErrors({});
                  }}
                  className="text-blue-600 text-xs ml-2"
                >
                  Change
                </button>
              </p>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-1"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mb-2">{errors.password}</p>
              )}
              <button
                onClick={handleLoginSubmit}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded"
              >
                Sign in
              </button>
            </>
          )}

          {step === "signup" && (
            <>
              <h2 className="text-lg font-semibold mb-2">Create account</h2>
              <p className="text-sm mb-2">
                {input}{" "}
                <button
                  onClick={() => {
                    setStep("start");
                    setBackendMessage("");
                    setErrors({});
                  }}
                  className="text-blue-600 text-xs ml-2"
                >
                  Change
                </button>
              </p>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-1"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mb-2">{errors.name}</p>
              )}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-1"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mb-2">{errors.password}</p>
              )}
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-1"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mb-2">
                  {errors.confirmPassword}
                </p>
              )}
              <button
                onClick={handleSignupSubmit}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded"
              >
                Continue
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <h2 className="text-lg font-semibold mb-2">Verify OTP</h2>
              <p className="text-sm mb-2">OTP sent to: {input}</p>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-1"
              />
              {errors.otp && (
                <p className="text-red-500 text-xs mb-2">{errors.otp}</p>
              )}
              <button
                onClick={handleOtpSubmit}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded"
              >
                Verify & Proceed
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
