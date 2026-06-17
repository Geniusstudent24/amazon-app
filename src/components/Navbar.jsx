import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const [userName, setUserName] = useState(null);
  const [zipCodeInput, setZipCodeInput] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [showNotification, setShowNotification] = useState(false);
  const [category, setCategory] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMiniSignIn, setShowMiniSignIn] = useState(true);
  const [hoverAccount, setHoverAccount] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const navigate = useNavigate();
  const [selectWidth, setSelectWidth] = useState("50px");
  const [showOverlay, setShowOverlay] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const [searchTerm, setSearchTerm] = useState("");
  const [allProductsForSearch, setAllProductsForSearch] = useState([]);
  const [allCategoriesForSearch, setAllCategoriesForSearch] = useState([]);
  const [searchDataLoading, setSearchDataLoading] = useState(true);
  const [searchDataError, setSearchDataError] = useState(null);
  const { cartItemCount } = useCart();
  const spanRef = useRef(null);

  const [languages] = useState([
    "English",
    "Hindi",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Russian",
    "Portuguese",
    "Arabic",
    "Italian",
    "Korean",
    "Bengali",
    "Turkish",
    "Urdu",
  ]);

  const language = [
    { label: "English - EN", code: "US", url: "#" },
    { label: "español - ES", code: "ES", url: "#" },
    { label: "العربية - AR", code: "SA", url: "#" },
    { label: "Deutsch - DE", code: "DE", url: "#" },
    { label: "עברית - HE", code: "IL", url: "#" },
  ];

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }

    const storedUserLocation = localStorage.getItem("userLocation");

    if (storedUserLocation) {
      setUserLocation(storedUserLocation);
    } else {
      setUserLocation("India");
    }

    const storedUserLanguage = localStorage.getItem("userLanguage");
    if (storedUserLanguage) {
      setSelectedLanguage(storedUserLanguage);
    }

    const openMenuFlag = localStorage.getItem("openLocationMenu");
    if (
      openMenuFlag === "true" &&
      window.innerWidth >= 768 &&
      (!storedUserLocation || storedUserLocation === "India")
    ) {
      setShowNotification(true);
      setShowOverlay(true);
      localStorage.removeItem("openLocationMenu");
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("https://amazon-app-mid8.onrender.com/api/auth/logout", {
        withCredentials: true,
      });

      localStorage.removeItem("userName");
      localStorage.removeItem("userLocation");
      localStorage.removeItem("userLanguage");
      setUserName(null);
      setUserLocation(null);
      setSelectedLanguage("English");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("userName");
      localStorage.removeItem("userLocation");
      localStorage.removeItem("userLanguage");
      setUserName(null);
      setUserLocation(null);
      setSelectedLanguage("English");
      navigate("/login");
    }
  };

  const handleApplyZipCode = async () => {
    if (!zipCodeInput.trim()) {
      alert("Please enter a zip code.");
      return;
    }

    try {
      const response = await axios.post(
        "https://amazon-app-mid8.onrender.com/api/auth/set-location",
        {
          zipCode: zipCodeInput,
          countryCode: "in",
          language: selectedLanguage,
        },
        { withCredentials: true }
      );

      if (response.data && response.data.location) {
        const cityOnly = response.data.location.city;
        localStorage.setItem("userLocation", cityOnly);
        setUserLocation(cityOnly);
        localStorage.setItem("userLanguage", selectedLanguage);

        setShowNotification(false);
        setShowOverlay(false);
        setZipCodeInput("");
        alert(`Delivery location set to: ${cityOnly}`);
      } else {
        alert("Failed to set location. Please try again.");
      }
    } catch (error) {
      console.error("Error setting location by zip code:", error);
      alert(
        error.response?.data?.msg || "Failed to set location. Please try again."
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMiniSignIn(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (spanRef.current) {
      const width = spanRef.current.offsetWidth + 30;
      setSelectWidth(`${width}px`);
    }
  }, [selectedCategory]);

  useEffect(() => {
    axios
      .get("https://amazon-app-mid8.onrender.com/api/categories")
      .then((response) => setCategory(response.data))
      .catch((error) => console.log("error fetching..", error));
  }, []);

  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowNavbar(false);
      } else if (currentScrollY < lastScrollY.current) {
        setShowNavbar(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchSearchData = async () => {
      setSearchDataLoading(true);
      setSearchDataError(null);
      try {
        const productsResponse = await axios.get(
          "https://amazon-app-mid8.onrender.com/api/products?_limit=194"
        );
        if (productsResponse.data && Array.isArray(productsResponse.data)) {
          setAllProductsForSearch(productsResponse.data);
        } else {
          throw new Error("Failed to load products for search.");
        }

        const categoriesResponse = await axios.get(
          "https://amazon-app-mid8.onrender.com/api/categories"
        );
        if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          setAllCategoriesForSearch(categoriesResponse.data);
        } else {
          throw new Error("Failed to load categories for search.");
        }
      } catch (err) {
        console.error("Error fetching search data:", err);
        setSearchDataError(err.message);
      } finally {
        setSearchDataLoading(false);
      }
    };
    fetchSearchData();
  }, []);

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();
    if (!trimmedSearchTerm) {
      return;
    }

    if (searchDataLoading || searchDataError) {
      alert(
        "Search data is still loading or an error occurred. Please try again in a moment."
      );
      return;
    }

    const matchedCategory = allCategoriesForSearch.find(
      (cat) => cat.slug && cat.slug.toLowerCase() === trimmedSearchTerm
    );

    if (matchedCategory) {
      navigate(`/products/${matchedCategory.slug}`);
      setSearchTerm("");
      return;
    }

    const matchedProductById = allProductsForSearch.find(
      (product) => product.id && product.id.toString() === trimmedSearchTerm
    );

    if (matchedProductById) {
      navigate(`/product/${matchedProductById.id}`);
      setSearchTerm("");
      return;
    }

    const matchedProductByTitle = allProductsForSearch.find(
      (product) =>
        product.title && product.title.toLowerCase() === trimmedSearchTerm
    );
    if (matchedProductByTitle) {
      navigate(`/product/${matchedProductByTitle.id}`);
      setSearchTerm("");
      return;
    }

    alert(
      "No exact product ID, title, or category found matching your search."
    );
    setSearchTerm("");
  };

  return (
    <>
      <div className="md:hidden bg-[#1d2c3d] text-white w-full">
        <div className="flex items-center gap-4 px-4 py-2">
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <i className="fa-solid fa-bars text-2xl"></i>
          </button>
          <img src="/nav-logo.png" alt="Logo" className="w-[90px]" />
          <div className="ml-auto flex gap-4 items-center">
            <Link
              to={userName ? "/profile" : "/login"}
              className="flex items-center gap-1 text-sm font-medium hover:underline"
            >
              <span className="flex items-center gap-1">
                {userName ? `Hello, ${userName.split(" ")[0]}` : "Sign in"}
                <i className="fa-solid fa-angle-right text-xs mt-[1px]"></i>
              </span>
              <i className="fa-regular fa-user text-xl"></i>
            </Link>
            <Link to="/cart" className="relative">
              <i className="fa-solid fa-cart-shopping text-2xl"></i>
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 -mt-2 -mr-3 bg-[#f08804] text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="px-4 pb-2">
          <div className="flex items-center bg-white rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="Search Amazon"
              className="flex-grow px-3 py-[10px] text-sm text-black outline-none"
              onFocus={() => {
                setIsFocused(true), setShowOverlay(true);
              }}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              onBlur={() => {
                setTimeout(
                  () => setIsFocused(false),
                  150,
                  setShowOverlay(false)
                );
              }}
              value={searchTerm}
            />
            <button
              className="bg-[#f2bc46] hover:bg-[#f8bd19] px-4 py-2 rounded-tl-md rounded-bl-md"
              onClick={handleSearch}
            >
              <i className="fa-solid fa-magnifying-glass text-white text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <button
          onClick={toggleMenu}
          className="fixed top-3 left-[325px] z-[60] w-10 h-10 bg-gray-300 rounded-full shadow flex items-center justify-center hover:scale-105 hover:shadow-lg"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      )}

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          <div className="fixed top-0 left-0 w-[80%] h-full bg-white z-50 shadow-lg flex flex-col">
            <div className="bg-[#232f3e] text-white px-4 pt-6 pb-4">
              <div className="flex justify-between items-start">
                <div className="mt-[50px]">
                  <p className="text-[15px]font-semibold text-gray-300">
                    Browse
                  </p>
                  <h2 className="text-[25px] font-bold leading-5">Amazon</h2>
                </div>
                {userName ? (
                  <Link to="/profile">
                    <button>
                      <div className="flex items-center text-sm text-white top-0">
                        <span className="text-[18px] font-normal mr-[10px]">
                          Hello, {userName.split(" ")[0]}
                        </span>
                        <i className="fa-regular fa-user text-xl mt-1"></i>
                      </div>
                    </button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <button>
                      <div className="flex items-center text-sm text-white top-0">
                        <span className="text-[18px] font-normal mr-[10px]">
                          Sign in
                        </span>
                        <i className="fa-regular fa-user text-xl mt-1"></i>
                      </div>
                    </button>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto text-sm text-black">
              <Link to="/">
                <div className="border-t border-b px-4 py-3 flex justify-between items-center font-bold text-[15px] hover:bg-gray-100">
                  Amazon Home
                  <i className="fa-solid fa-house text-base text-gray-600"></i>
                </div>
              </Link>

              <div className="border-b px-4 py-3">
                <h3 className="text-base font-bold mb-1 text-black">
                  Trending
                </h3>
                <a
                  href="#"
                  className="block text-[14px] text-gray-700 hover:underline hover:text-black"
                >
                  Movers & Shakers
                </a>
              </div>

              <div className="border-b px-4 py-3">
                <h3 className="text-base font-bold mb-1 text-black">
                  Top Departments
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="block text-[14px] text-black hover:text-black hover:underline"
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block text-[14px] text-black hover:text-black hover:underline"
                    >
                      Health & Household
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block text-[14px] text-black hover:text-black hover:underline"
                    >
                      Books
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block text-[14px] text-black hover:text-black hover:underline"
                    >
                      PC
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block flex items-center justify-between text-gray-600 hover:text-black"
                    >
                      See all
                      <i className="fa-solid fa-chevron-down text-xs"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {showOverlay && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => {
            setShowNotification(false);
            setShowOverlay(false);
            setShowDropdown(false);
            setHoverAccount(false);
          }}
        ></div>
      )}

      <div
        className={`hidden md:flex fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex w-full flex-nowrap overflow-x-auto bg-[#0F1111] text-white">
          <div className="min-w-[160px] w-[200px] flex-shrink-0 h-[60px] flex items-center">
            <div className="w-[114px] h-[60px] ml-2 pt-1">
              <a className="block w-full h-full px-2" href="/">
                <img
                  className="w-[100px] h-[50px] object-contain mx-auto border border-transparent hover:border-white transition-all"
                  src="/nav-logo.png"
                  alt="Amazon Logo"
                />
              </a>
            </div>
            <span className="w-[90.638px] h-[60px] flex items-center ml-[4px]">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (userName && userLocation && userLocation !== "India") {
                    navigate("/profile");
                  } else {
                    setShowNotification(true);
                    setShowOverlay(true);
                  }
                }}
                className="pr-[9px] pl-[9px] flex items-center h-[60px] border border-transparent hover:border-white transition-all duration-200 relative group"
              >
                <div className="mt-[5px] w-[20px] h-[25px] flex items-center justify-center">
                  <i className="fa-solid fa-location-dot text-white text-[14px]"></i>
                </div>
                <div className="flex flex-col justify-center leading-tight ml-[4px] mt-[5px]">
                  <span className="text-[#CCCCCC] text-[12px] leading-tight h-[14px] whitespace-nowrap">
                    Deliver to
                  </span>
                  <span className="text-[#FFFFFF] font-bold text-[14px] leading-tight h-[15px]">
                    {userLocation ? userLocation.split(" ")[0] : "India"}
                  </span>
                </div>
              </a>
            </span>
          </div>

          {showNotification && (
            <>
              <div className="fixed inset-0 bg-black mt-[400px] bg-opacity-50 flex justify-center items-center z-50">
                <div
                  className="bg-white rounded-lg p-6 w-[350px] relative 
                 shadow-[0_8px_24px_rgba(0,0,0,0.2)] shadow-inner"
                >
                  <button
                    className="absolute top-2 right-2 text-black text-xl"
                    onClick={() => {
                      setShowNotification(false);
                      setShowOverlay(false);
                    }}
                  >
                    &times;
                  </button>
                  <h2 className="text-lg font-semibold mb-2">
                    Choose Your Location
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Delivery options and delivery speeds may vary for different
                    locations
                  </p>
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded w-full mb-2">
                    {userName ? (
                      <Link to="/profile">
                        hello, {userName} click here to profile
                      </Link>
                    ) : (
                      <Link to="/login">Sign in to your address</Link>
                    )}
                  </button>
                  <input
                    type="text"
                    placeholder="or enter US zip code"
                    className="w-full p-2 border border-gray-300 rounded mb-2 text-black"
                    required
                    value={zipCodeInput}
                    onChange={(e) => setZipCodeInput(e.target.value)}
                  />
                  <button
                    className="w-full border border-gray-500 py-1 rounded mb-2 cursor-pointer bg-yellow-300 hover:bg-yellow-500 text-black"
                    onClick={handleApplyZipCode}
                  >
                    Apply
                  </button>
                  <select
                    className="w-full border border-gray-300 p-2 rounded mb-4 text-black"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <option value="" className="text-black">
                      ---- Select Language ----
                    </option>
                    {languages.map((lang, index) => (
                      <option key={index} value={lang} className="text-black">
                        {lang}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setShowNotification(false);
                      setShowOverlay(false);
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded w-full"
                  >
                    Done
                  </button>
                </div>
              </div>{" "}
            </>
          )}

          <div className="flex-grow min-w-0 h-[60px] flex items-center px-1 relative z-50">
            <div
              className={`flex w-full ${
                isFocused
                  ? "border-2 border-yellow-500 shadow-[0_0_0_2px_rgba(255,204,0,0.5)]"
                  : "border border-transparent"
              } rounded-md bg-white transition-all`}
            >
              <span
                ref={spanRef}
                className="absolute invisible whitespace-nowrap text-sm px-2 font-normal"
              >
                {selectedCategory}
              </span>
              <select
                style={{ width: selectWidth }}
                className="h-[38px] bg-[#EAEDED] hover:bg-[#D5DBDB] rounded-tl-md rounded-bl-md text-black bg-gray-200"
                value={selectedCategory}
                onChange={(e) => {
                  const selectedCategorySlug = e.target.value;
                  setSelectedCategory(selectedCategorySlug);

                  if (selectedCategorySlug === "All") {
                    navigate(`/`);
                  } else if (selectedCategorySlug) {
                    navigate(`/products/${selectedCategorySlug}`);
                  }
                }}
              >
                <option value="All" className="text-[12px] text-center">
                  All
                </option>
                {category.map((cat, idx) => (
                  <option key={idx} value={cat.slug} className="text-[12px]">
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                onFocus={() => {
                  setIsFocused(true), setShowOverlay(true);
                }}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                onBlur={() => {
                  setTimeout(
                    () => setIsFocused(false),
                    150,
                    setShowOverlay(false)
                  );
                }}
                className="flex-grow min-w-0 h-[38px] px-2 outline-none text-black"
                value={searchTerm}
                placeholder="Search Amazon"
              />
              <button
                className="w-[45px] h-[38px] bg-[#f2bc46] hover:bg-[#f8bd19] flex items-center justify-center rounded-tr-md rounded-br-md"
                onClick={handleSearch}
              >
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 h-[60px] pr-2 text-sm">
            <div
              onMouseEnter={() => {
                setShowDropdown(true), setShowOverlay(true);
              }}
              onMouseLeave={() => {
                setShowDropdown(false), setShowOverlay(false);
              }}
              className="px-3 py-2 flex items-center cursor-pointer"
            >
              <div className="relative">
                <Link
                  to="/languageSetting"
                  className="flex items-center px-2 py-[2px] rounded hover:border-white"
                >
                  <img
                    src="https://flagsapi.com/US/flat/24.png"
                    alt="flag"
                    className="w-5 h-4 object-cover"
                  />
                  <span className="ml-1 text-sm font-medium">EN</span>
                  <i className="fa-solid fa-caret-down text-xs ml-1"></i>
                </Link>

                {showDropdown && (
                  <div
                    className="fixed mt-[0px] ml-[0px] bg-white text-black shadow-lg rounded w-64 z-[9999] p-4"
                    style={{ top: "50px", left: "auto" }}
                  >
                    <h3 className="text-sm font-bold mb-2">Change language</h3>
                    <ul>
                      {language.map((lang, index) => (
                        <li key={index}>
                          <button
                            className="w-full text-left py-1 px-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                            onClick={() => (window.location.href = lang.url)}
                          >
                            <img
                              src={`https://flagsapi.com/${lang.code}/flat/24.png`}
                              alt={lang.code}
                              className="w-5 h-4"
                            />
                            {lang.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div
              className="relative ml-3 px-2 py-2"
              onMouseEnter={() => {
                setHoverAccount(true), setShowOverlay(true);
              }}
              onMouseLeave={() => {
                setHoverAccount(false), setShowOverlay(false);
              }}
            >
              <div className="px-2 py-1 hover:border hover:border-white rounded leading-none">
                <Link to={userName ? "/" : "/login"}>
                  <span className="text-[12px]">
                    {" "}
                    {userName ? `Hello, ${userName.split(" ")[0]}` : "Sign in"}
                  </span>
                  <span className="font-bold text-[14px] flex items-center">
                    Account & Lists
                    <i className="fa-solid fa-caret-down text-xs ml-1 mt-[1px]"></i>
                  </span>
                </Link>
              </div>
              {hoverAccount && (
                <div
                  className="fixed bg-white text-black shadow-lg w-[400px] z-[9999] p-4 rounded"
                  style={{
                    top: "60px",
                    left: "calc(100% - 450px)",
                  }}
                >
                  {userName ? (
                    <>
                      <button
                        onClick={handleLogout}
                        className="block bg-yellow-400 hover:bg-yellow-500 text-center font-bold py-2 rounded mb-4 w-full"
                      >
                        Sign Out
                      </button>
                      <p className="text-sm text-center mb-2">
                        Welcome back, {userName}!
                      </p>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block bg-yellow-400 hover:bg-yellow-500 text-center font-bold py-2 rounded mb-4"
                      >
                        Sign in
                      </Link>
                      <p className="text-sm text-center mb-2">
                        New customer?{" "}
                        <Link
                          to="/login"
                          className="text-blue-600 hover:underline"
                        >
                          Start here
                        </Link>
                      </p>
                    </>
                  )}
                  <hr className="my-3" />
                  <div className="grid grid-cols-2 gap-[60px] text-sm">
                    <div>
                      <p className="font-semibold mb-1">Your Lists</p>
                      <ul>
                        <li>
                          <a href="#" className="hover:underline">
                            Create a List
                          </a>
                        </li>
                        <li>
                          <a href="#" className="hover:underline">
                            Find a List or Registry
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Your Account</p>
                      {userName ? (
                        <>
                          <Link to="/profile" className="hover:underline">
                            Profile
                          </Link>{" "}
                          <br />
                          <Link to="#" className="hover:underline">
                            Orders{" "}
                          </Link>
                        </>
                      ) : (
                        <Link to="/login" className="hover:underline">
                          Sign in
                        </Link>
                      )}
                      <ul>
                        <li>
                          <a href="#" className="hover:underline">
                            Recommendations
                          </a>
                        </li>
                        <li>
                          <a
                            href="/browsing-history"
                            className="hover:underline"
                          >
                            Browsing History
                          </a>
                        </li>
                        <li>
                          <a href="#" className="hover:underline">
                            Watchlist
                          </a>
                        </li>
                        <li>
                          <a href="#" className="hover:underline">
                            Video Purchases & Rentals
                          </a>
                        </li>
                        <li>
                          <a href="#" className="hover:underline">
                            Content & Devices
                          </a>
                        </li>
                        <li>
                          <a href="#" className="hover:underline">
                            Subscribe & Save Items
                          </a>
                        </li>
                        <li>
                          <a href="#" className="hover:underline">
                            Memberships & Subscriptions
                          </a>
                        </li>
                        <li>
                          <a href="#" className="hover:underline">
                            Music Library
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>{" "}
                </div>
              )}
              {showMiniSignIn && !userName && (
                <div
                  className="fixed z-[9999]"
                  style={{
                    top: "65px",
                    left: "calc(100% - 420px)",
                  }}
                >
                  <div className="absolute top-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>

                  <div className="bg-white text-black shadow-lg w-64 p-4 rounded">
                    <Link
                      to="/login"
                      className="block bg-yellow-400 hover:bg-yellow-500 text-center font-bold py-2 rounded mb-2"
                    >
                      Sign in
                    </Link>
                    <p className="text-sm text-center">
                      New customer?{" "}
                      <Link
                        to="/login"
                        className="text-blue-600 hover:underline"
                      >
                        Start here
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-3 py-2 flex flex-col justify-center hover:border hover:border-white rounded">
              <span className="text-xs leading-tight">Returns</span>
              <span className="font-bold text-sm leading-tight whitespace-nowrap">
                & Orders
              </span>
            </div>

            <Link
              to="/cart"
              className="px-2 py-2 flex items-center relative hover:border hover:border-white rounded"
            >
              <div className="relative mr-1">
                <i className="fa-solid fa-cart-shopping text-2xl"></i>
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-2 -mr-3 bg-[#f08804] text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="font-bold text-sm mt-1">Cart</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
