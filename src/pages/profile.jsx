import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editZipCode, setEditZipCode] = useState("");
  const [editCountryCode, setEditCountryCode] = useState("in");
  const [editMessage, setEditMessage] = useState("");
  const [isEditMessageError, setIsEditMessageError] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "https://amazon-app-mid8.onrender.com/api/auth/profile",
          {
            withCredentials: true,
          }
        );
        const { user, location } = response.data;
        setUserData({ user: user, location: location });
        console.log("Profile.jsx: User data from backend:", user);
        console.log("Profile.jsx: Location data from backend:", location);

        setLoading(false);

        setEditName(user.name || "");
        setEditEmail(user.email || "");
        setEditPhone(user.phone || "");
        if (location) {
          setEditZipCode(location.zipcode || "");
        } else {
          setEditZipCode("");
          setEditCountryCode("in");
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError("Failed to load profile.  Please log in again.");
        setLoading(false);
        if (err.response && err.response.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleEdit = () => {
    setEditMode(true);
    setEditMessage("");
    setIsEditMessageError(false);

    if (userData) {
      setEditName(userData.user.name || "");
      setEditEmail(userData.user.email || "");
      setEditPhone(userData.user.phone || "");
      if (userData.location) {
        setEditZipCode(userData.location.zipcode || "");
      } else {
        setEditZipCode("");
        setEditCountryCode("in");
      }
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditMessage("");
    setIsEditMessageError(false);

    if (userData) {
      setEditName(userData.user.name || "");
      setEditEmail(userData.user.email || "");
      setEditPhone(userData.user.phone || "");
      if (userData.location) {
        setEditZipCode(userData.location.zipcode || "");
      } else {
        setEditZipCode("");
        setEditCountryCode("in");
      }
    }
  };

  const handleSave = async () => {
    setEditMessage("");
    setIsEditMessageError(false);

    if (!editName.trim()) {
      setEditMessage("Name is required.");
      setIsEditMessageError(true);
      return;
    }
    if (!editEmail.trim() && !editPhone.trim()) {
      setEditMessage("Either Email or Phone Number is required.");
      setIsEditMessageError(true);
      return;
    }

    try {
      const updatedData = {
        name: editName,
        email: editEmail.trim() === "" ? null : editEmail,
        phone: editPhone.trim() === "" ? null : editPhone,
        zipCode: editZipCode.trim(),
        countryCode: editCountryCode,
      };

      const response = await axios.put(
        "https://amazon-app-mid8.onrender.com/api/auth/profile",
        updatedData,
        { withCredentials: true }
      );

      setUserData({
        user: response.data.user,
        location: response.data.location,
      });
      setEditMode(false);
      setEditMessage("Profile updated successfully!");
      setIsEditMessageError(false);

      if (response.data.user.name) {
        localStorage.setItem("userName", response.data.user.name);
      }
    } catch (err) {
      console.error("Failed to update user profile:", err);
      setEditMessage(
        err.response?.data?.msg || "Failed to update profile. Please try again."
      );
      setIsEditMessageError(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-600 text-lg">No user data found.</p>
      </div>
    );
  }

  const defaultProfilePhoto = "/profile.png";

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Your Account</h1>
          {editMode ? (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md text-sm"
            >
              Edit Profile
            </button>
          )}
        </div>

        {editMessage && (
          <p
            className={`text-center text-sm mt-2 ${
              isEditMessageError ? "text-red-500" : "text-green-500"
            }`}
          >
            {editMessage}
          </p>
        )}

        <div className="flex flex-col md:flex-row p-6 space-y-6 md:space-y-0 md:space-x-8">
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-1/4">
            <img
              src={defaultProfilePhoto}
              alt="Profile Photo"
              className="w-24 h-24 rounded-full object-cover border-2 border-yellow-500 mb-4"
            />
            <p className="text-xl font-semibold text-gray-900 text-center">
              {userData.user.name}
            </p>
            <p className="text-sm text-gray-600 text-center">
              {userData.user.email || userData.user.phone}
            </p>
          </div>

          <div className="flex-grow w-full md:w-3/4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-600">Full Name</p>
                {editMode ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-1 border rounded text-gray-900"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">
                    {userData.user.name}
                  </p>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-600">Email</p>
                {editMode ? (
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-1 border rounded text-gray-900"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">
                    {userData.user.email || "Not Available"}
                  </p>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-600">
                  Phone Number
                </p>
                {editMode ? (
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-1 border rounded text-gray-900"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">
                    {userData.user.phone || "Not Available"}
                  </p>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-600">
                  Account Created
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(userData.user.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4 pb-2 border-b border-gray-200">
              Account Settings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 hover:bg-blue-100 rounded-md cursor-pointer flex items-center space-x-3">
                <i className="fa-solid fa-location-dot text-blue-600 text-xl"></i>
                <div>
                  <p className="text-md font-medium text-blue-800">
                    Your Address
                  </p>
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        placeholder="Zip Code"
                        value={editZipCode}
                        onChange={(e) => setEditZipCode(e.target.value)}
                        className="w-full p-1 border rounded text-gray-900 mb-1"
                      />
                    </>
                  ) : userData.location ? (
                    <p className="text-sm text-gray-600">
                      {userData.location.city}, {userData.location.state},{" "}
                      {userData.location.country} ({userData.location.zipcode})
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No address added yet.
                    </p>
                  )}
                </div>
              </div>
              <div className="p-4 bg-green-50 hover:bg-green-100 rounded-md cursor-pointer flex items-center space-x-3">
                <i className="fa-solid fa-credit-card text-green-600 text-xl"></i>
                <div>
                  <p className="text-md font-medium text-green-800">
                    Payment Options
                  </p>
                  <p className="text-sm text-gray-600">
                    Manage your payment methods
                  </p>
                </div>
              </div>
              <div className="p-4 bg-purple-50 hover:bg-purple-100 rounded-md cursor-pointer flex items-center space-x-3">
                <i className="fa-solid fa-box text-purple-600 text-xl"></i>
                <div>
                  <p className="text-md font-medium text-purple-800">
                    Your Orders
                  </p>
                  <p className="text-sm text-gray-600">
                    View and track your past orders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
