import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import Menu from "../components/Menu.jsx";
import Footer from "../components/Footer.jsx";
import { useParams, useNavigate } from "react-router-dom";

function ProductList() {
  const [loading, setLoading] = useState(true);
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortOrder, setSortOrder] = useState("");

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setMinPrice(minPriceInput);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [minPriceInput]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setMaxPrice(maxPriceInput);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [maxPriceInput]);

  useEffect(() => {
    const fetchAndFilterProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products?category=${categoryName}`
        );

        if (!response.data || !Array.isArray(response.data)) {
          console.warn(
            "API response for category was not an array or was empty:",
            response.data
          );
          setProducts([]);
          setFilteredProducts([]);
          setLoading(false);
          return;
        }
        let fetchedProducts = response.data;

        if (minPrice !== "") {
          fetchedProducts = fetchedProducts.filter(
            (p) => p.price >= parseFloat(minPrice)
          );
        }
        if (maxPrice !== "") {
          fetchedProducts = fetchedProducts.filter(
            (p) => p.price <= parseFloat(maxPrice)
          );
        }

        let sortedProducts = [...fetchedProducts];
        if (sortOrder === "price-asc") {
          sortedProducts.sort((a, b) => a.price - b.price);
        } else if (sortOrder === "price-desc") {
          sortedProducts.sort((a, b) => b.price - a.price);
        } else if (sortOrder === "rating-desc") {
          sortedProducts.sort((a, b) => b.rating - a.rating);
        }

        setProducts(fetchedProducts);
        setFilteredProducts(sortedProducts);
      } catch (error) {
        console.log("error fetching..", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchAndFilterProducts();
    }
  }, [categoryName, minPrice, maxPrice, sortOrder]);

  const truncateDescription = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="h-[60px] hidden md:block"></div>
        <Menu />
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="h-[60px] hidden md:block"></div>
        <Menu />
        <div className="w-full bg-[#e3e6e6] min-h-screen flex items-center justify-center">
          <p className="text-xl font-semibold text-red-600">Error: {error}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="h-[60px] hidden md:block"></div>
      <Menu />

      <div className="max-w-[100rem] mx-auto pt-4 px-4">
        <p className="text-xl font-bold text-gray-700 mb-4 border-b-2 border-gray-500 shadow-lg capitalize">
          Products of {categoryName.replace(/-/g, " ")}
        </p>
      </div>

      <div className="flex justify-around p-4 border-t border-b bg-white md:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex-1 py-2 text-blue-700 font-semibold border-r border-gray-300"
        >
          <i className="fa-solid fa-filter mr-2"></i> Filter
        </button>
        <button
          onClick={() => setShowSortOptions(true)}
          className="flex-1 py-2 text-blue-700 font-semibold"
        >
          <i className="fa-solid fa-sort mr-2"></i> Sort
        </button>
      </div>

      <div className="max-w-[90rem] mx-auto flex">
        <div className="w-60 flex-shrink-0 mr-6 hidden md:block">
          <div className="bg-white p-4 shadow-md mb-4">
            <h3 className="text-lg font-bold mb-3">Popular Shopping Ideas</h3>
            <ul>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  Plastic Drawer
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  Cooking
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  See more
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-white p-4 shadow-md mb-4">
            <h3 className="text-lg font-bold mb-3">Customer Reviews</h3>
            <div className="flex items-center mb-1">
              <span className="text-yellow-500 text-lg mr-1">
                &#9733;&#9733;&#9733;&#9733;&#9734;
              </span>{" "}
              <span className="text-sm text-black hover:underline cursor-pointer">
                & Up
              </span>
            </div>
            <div className="flex items-center mb-1">
              <span className="text-yellow-500 text-lg mr-1">
                &#9733;&#9733;&#9733;&#9734;&#9734;
              </span>{" "}
              <span className="text-sm text-black hover:underline cursor-pointer">
                & Up
              </span>
            </div>
            <div className="flex items-center mb-1">
              <span className="text-yellow-500 text-lg mr-1">
                &#9733;&#9733;&#9734;&#9734;&#9734;
              </span>{" "}
              <span className="text-sm text-black hover:underline cursor-pointer">
                & Up
              </span>
            </div>
            <div className="flex items-center mb-1">
              <span className="text-yellow-500 text-lg mr-1">
                &#9733;&#9734;&#9734;&#9734;&#9734;
              </span>{" "}
              <span className="text-sm text-black hover:underline cursor-pointer">
                & Up
              </span>
            </div>
          </div>

          <div className="bg-white p-4 shadow-md mb-4">
            <h3 className="text-lg font-bold mb-3">Price</h3>
            <ul>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  Under $25
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  $25 to $50
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  $50 to $100
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  $100 to $200
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  Over $200
                </a>
              </li>
            </ul>

            <div className="flex items-center mt-3">
              <input
                type="number"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-20 p-1 border border-gray-300 rounded text-sm mr-2"
              />
              <span className="text-gray-600">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-20 p-1 border border-gray-300 rounded text-sm ml-2"
              />
              <button className="ml-0 bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300">
                Go
              </button>
            </div>
          </div>

          <div className="bg-white p-4 shadow-md mb-4">
            <h3 className="text-lg font-bold mb-3">Department</h3>
            <ul>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  Home Storage & Organization
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-white p-4 shadow-md mb-4">
            <h3 className="text-lg font-bold mb-3">Sort By</h3>
            <ul className="text-base">
              <li
                className={`py-1 px-2 cursor-pointer hover:bg-gray-100 ${
                  sortOrder === "price-asc" ? "bg-blue-100 text-blue-700" : ""
                }`}
                onClick={() => setSortOrder("price-asc")}
              >
                Price: Low to High
              </li>
              <li
                className={`py-1 px-2 cursor-pointer hover:bg-gray-100 ${
                  sortOrder === "price-desc" ? "bg-blue-100 text-blue-700" : ""
                }`}
                onClick={() => setSortOrder("price-desc")}
              >
                Price: High to Low
              </li>
              <li
                className={`py-1 px-2 cursor-pointer hover:bg-gray-100 ${
                  sortOrder === "rating-desc" ? "bg-blue-100 text-blue-700" : ""
                }`}
                onClick={() => setSortOrder("rating-desc")}
              >
                Avg. Customer Review
              </li>
            </ul>
          </div>
        </div>

        <div className="flex-grow p-4 md:p-0">
          <h1 className="text-2xl font-semibold hidden md:block">Results</h1>
          <h3 className="text-lg mb-1 text-gray-700 hidden md:block">
            Check each product page for other buying options. Price and other
            details may vary based on product size and color.
          </h3>
          {filteredProducts.length === 0 && !loading && !error ? (
            <p className="text-lg text-gray-600 text-center md:text-left">
              No products found for "{categoryName.replace(/-/g, " ")}".
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => {
                const discountedPrice = (
                  product.price -
                  (product.price * product.discountPercentage) / 100
                ).toFixed(2);
                const originalPrice = product.price.toFixed(2);
                const updatedDateText = "in past month";

                return (
                  <div
                    key={product.id}
                    className="bg-white p-3 md:p-4 shadow-md rounded-lg flex flex-col items-start text-sm cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-24 md:h-48 object-contain mb-2 md:mb-4 rounded-md"
                    />
                    <p className="text-gray-500 mb-1 capitalize text-xs md:text-sm">
                      {product.brand}
                    </p>
                    <h3 className="text-sm md:text-base font-semibold mb-1 md:mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-gray-700 mb-1 md:mb-2 line-clamp-3 text-xs md:text-sm">
                      {truncateDescription(product.description, 60)}
                    </p>

                    <div className="flex items-center mb-1 md:mb-2">
                      {renderStars(product.rating)}
                      <span className="text-blue-600 hover:text-orange-500 cursor-pointer ml-1 text-xs">
                        (
                        {Array.isArray(product.reviews)
                          ? product.reviews.length
                          : product.reviews || 100}
                        )
                      </span>
                    </div>

                    <p className="text-gray-500 text-xs mb-1 md:mb-2">
                      {updatedDateText}
                    </p>

                    <div className="flex items-baseline mb-2 md:mb-3">
                      <span className="text-red-700 font-bold text-base md:text-lg mr-1 md:mr-2">
                        ${discountedPrice}
                      </span>
                      <span className="text-gray-500 line-through text-xs md:text-sm">
                        ${originalPrice}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                      }}
                      className="mt-auto w-full bg-gray-100 text-blue-700 border border-gray-300 py-1 md:py-2 px-2 md:px-4 rounded-md hover:bg-gray-200 text-xs md:text-sm"
                    >
                      See options
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 bg-white z-40 p-4 overflow-y-auto md:hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Filters</h2>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>

          <div className="bg-white p-4 shadow-md mb-4 border rounded-lg">
            <h3 className="text-lg font-bold mb-3">Popular Shopping Ideas</h3>
            <ul>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  Plastic Drawer
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  Cooking
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  See more
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-white p-4 shadow-md mb-4 border rounded-lg">
            <h3 className="text-lg font-bold mb-3">Customer Reviews</h3>
            <div className="flex flex-col">
              <div className="flex items-center mb-1">
                <span className="text-yellow-500 text-lg mr-1">
                  &#9733;&#9733;&#9733;&#9733;&#9734;
                </span>{" "}
                <span className="text-sm text-black hover:underline cursor-pointer">
                  & Up
                </span>
              </div>
              <div className="flex items-center mb-1">
                <span className="text-yellow-500 text-lg mr-1">
                  &#9733;&#9733;&#9733;&#9734;&#9734;
                </span>{" "}
                <span className="text-sm text-black hover:underline cursor-pointer">
                  & Up
                </span>
              </div>
              <div className="flex items-center mb-1">
                <span className="text-yellow-500 text-lg mr-1">
                  &#9733;&#9733;&#9734;&#9734;&#9734;
                </span>{" "}
                <span className="text-sm text-black hover:underline cursor-pointer">
                  & Up
                </span>
              </div>
              <div className="flex items-center mb-1">
                <span className="text-yellow-500 text-lg mr-1">
                  &#9733;&#9734;&#9734;&#9734;&#9734;
                </span>{" "}
                <span className="text-sm text-black hover:underline cursor-pointer">
                  & Up
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 shadow-md mb-4 border rounded-lg">
            <h3 className="text-lg font-bold mb-3">Price</h3>
            <ul>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  Under $25
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  $25 to $50
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  $50 to $100
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  $100 to $200
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  Over $200
                </a>
              </li>
            </ul>

            <div className="flex items-center mt-3">
              <input
                type="number"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-20 p-1 border border-gray-300 rounded text-sm mr-2"
              />
              <span className="text-gray-600">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-20 p-1 border border-gray-300 rounded text-sm ml-2"
              />
              <button className="ml-0 bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300">
                Go
              </button>
            </div>
          </div>

          <div className="bg-white p-4 shadow-md mb-4 border rounded-lg">
            <h3 className="text-lg font-bold mb-3">Department</h3>
            <ul>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-black hover:text-orange-500 text-sm"
                >
                  Home Storage & Organization
                </a>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setShowMobileFilters(false)}
            className="w-full bg-blue-700 text-white py-3 rounded-md text-lg font-semibold mt-4"
          >
            Apply Filters
          </button>
        </div>
      )}

      {showSortOptions && (
        <div className="fixed inset-0 bg-white z-40 p-4 md:hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Sort By</h2>
            <button
              onClick={() => setShowSortOptions(false)}
              className="text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
          <ul className="text-lg">
            <li
              className={`py-2 px-3 cursor-pointer hover:bg-gray-100 ${
                sortOrder === "price-asc" ? "bg-blue-100 text-blue-700" : ""
              }`}
              onClick={() => {
                setSortOrder("price-asc");
                setShowSortOptions(false);
              }}
            >
              Price: Low to High
            </li>
            <li
              className={`py-2 px-3 cursor-pointer hover:bg-gray-100 ${
                sortOrder === "price-desc" ? "bg-blue-100 text-blue-700" : ""
              }`}
              onClick={() => {
                setSortOrder("price-desc");
                setShowSortOptions(false);
              }}
            >
              Price: High to Low
            </li>
            <li
              className={`py-2 px-3 cursor-pointer hover:bg-gray-100 ${
                sortOrder === "rating-desc" ? "bg-blue-100 text-blue-700" : ""
              }`}
              onClick={() => {
                setSortOrder("rating-desc");
                setShowSortOptions(false);
              }}
            >
              Avg. Customer Review
            </li>
          </ul>
        </div>
      )}

      <Footer />
    </>
  );
}

export default ProductList;
