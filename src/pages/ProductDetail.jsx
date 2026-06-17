import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import Menu from "../components/Menu.jsx";
import Footer from "../components/Footer.jsx";
import { useCart } from "../context/CartContext";

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart, cartItemCount } = useCart();

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

  const truncateDescription = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate("/checkout");
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      setCurrentImageIndex(0);
      try {
        const productResponse = await axios.get(
          `http://localhost:5000/api/products/${productId}`
        );
        if (!productResponse.data) {
          throw new Error("Product not found");
        }
        setProduct(productResponse.data);

        const storedHistory =
          JSON.parse(localStorage.getItem("browsingHistory")) || [];
        const newHistory = [
          productId,
          ...storedHistory.filter((id) => id !== productId),
        ].slice(0, 10);
        localStorage.setItem("browsingHistory", JSON.stringify(newHistory));

        const categoryResponse = await axios.get(
          `http://localhost:5000/api/products?category=${productResponse.data.category}`
        );
        if (categoryResponse.data && Array.isArray(categoryResponse.data)) {
          const filteredRelated = categoryResponse.data.filter(
            (p) => p.id !== productResponse.data.id
          );
          setRelatedProducts(filteredRelated);
        } else {
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="h-[60px] hidden md:block"></div>
        <Menu />
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div
              className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p className="text-white text-lg mt-4 font-semibold">
              Loading product details...
            </p>
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

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="h-[60px] hidden md:block"></div>
        <Menu />
        <div className="w-full bg-[#e3e6e6] min-h-screen flex items-center justify-center">
          <p className="text-xl font-semibold text-gray-600">
            Product not found.
          </p>
        </div>
        <Footer />
      </>
    );
  }

  const discountedPrice = (
    product.price -
    (product.price * product.discountPercentage) / 100
  ).toFixed(2);
  const originalPrice = product.price.toFixed(2);

  return (
    <>
      <Navbar />
      <div className="h-[60px] hidden md:block"></div>
      <Menu />

      <div className="max-w-[90rem] mx-auto p-4 md:p-8 bg-white shadow-lg rounded-lg my-8">
        <div className="md:hidden">
          <h1 className="text-2xl font-bold mb-1">{product.title}</h1>
          <p className="text-gray-600 text-sm mb-2">
            {truncateDescription(product.description, 100)}
          </p>
          <div className="flex items-center mb-4">
            {renderStars(product.rating)}
            <span className="text-blue-600 hover:underline cursor-pointer ml-2 text-sm">
              (
              {product.reviews && Array.isArray(product.reviews)
                ? product.reviews.length
                : 0}{" "}
              reviews)
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col items-center">
            <div className="flex flex-col md:flex-row gap-4 items-start w-full">
              <div className="hidden md:flex flex-col gap-2 overflow-y-auto max-h-[700px] p-1 w-20">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-16 h-16 object-contain border-2 rounded-md cursor-pointer ${
                      index === currentImageIndex
                        ? "border-blue-500"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>

              <div className="flex-1 max-h-[700px] shadow-md rounded-lg overflow-hidden flex items-center justify-center relative w-full md:w-auto">
                <div className="md:hidden relative w-full">
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.title}
                    className="w-full h-80 object-contain"
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={goToPreviousImage}
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full ml-2"
                      >
                        &#10094;
                      </button>
                      <button
                        onClick={goToNextImage}
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full mr-2"
                      >
                        &#10095;
                      </button>
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                        {product.images.map((_, idx) => (
                          <span
                            key={idx}
                            className={`block w-2 h-2 rounded-full ${
                              idx === currentImageIndex
                                ? "bg-blue-500"
                                : "bg-gray-400"
                            }`}
                            onClick={() => setCurrentImageIndex(idx)}
                          ></span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <img
                  src={product.images[currentImageIndex]}
                  alt={product.title}
                  className="max-w-full max-h-full object-contain hidden md:block"
                />
              </div>
            </div>

            <div className="md:hidden flex justify-around w-full mt-4 border-t border-b py-2">
              <button className="text-blue-700 flex items-center">
                <i className="fa-solid fa-share-nodes mr-2"></i> Share
              </button>
              <button className="text-red-500 flex items-center">
                <i className="fa-solid fa-heart mr-2"></i> Like
              </button>
            </div>
          </div>

          <div className="w-full md:w-1/2 lg:w-2/5 p-4 pt-0 md:pt-4">
            <div className="hidden md:block">
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-gray-600 text-lg mb-4">
                {product.description}
              </p>
              <div className="flex items-center mb-2">
                {renderStars(product.rating)}
                <span className="text-blue-600 hover:underline cursor-pointer ml-2">
                  (
                  {product.reviews && Array.isArray(product.reviews)
                    ? product.reviews.length
                    : 0}{" "}
                  reviews)
                </span>
              </div>
              <p className="text-2xl font-bold text-red-700 mb-4">
                ${discountedPrice}
                {product.discountPercentage > 0 && (
                  <span className="text-gray-500 line-through text-lg ml-3">
                    ${originalPrice}
                  </span>
                )}
              </p>
              {product.discountPercentage > 0 && (
                <p className="text-green-600 text-sm mb-4">
                  {product.discountPercentage}% off
                </p>
              )}
            </div>

            <div className="md:hidden mt-4">
              <h2 className="text-xl font-bold mb-2">Product Details</h2>
              <p className="text-gray-700 mb-4">{product.description}</p>
              <p className="text-2xl font-bold text-red-700 mb-2">
                ${discountedPrice}
                {product.discountPercentage > 0 && (
                  <span className="text-gray-500 line-through text-lg ml-3">
                    ${originalPrice}
                  </span>
                )}
              </p>
              {product.discountPercentage > 0 && (
                <p className="text-green-600 text-sm mb-4">
                  {product.discountPercentage}% off
                </p>
              )}
              <div className="flex flex-col gap-3 mb-8">
                <button
                  className="w-full bg-[#FFD814] text-black py-2 px-5 rounded-full text-lg font-semibold hover:bg-[#F7CA00] transition-colors shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                    alert(
                      `Product added! Your cart now has ${
                        cartItemCount + 1
                      } items.`
                    );
                  }}
                >
                  Add to Cart
                </button>
                <button
                  className="w-full bg-[#FFA41C] text-black py-2 px-5 rounded-full text-lg font-semibold hover:bg-[#FBBD73] transition-colors shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyNow();
                  }}
                >
                  Buy Now
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-bold mb-2">Specifications</h3>
                <p className="text-gray-700 mb-2 text-sm md:text-base">
                  <span className="font-semibold">Brand:</span> {product.brand}
                </p>
                <p className="text-gray-700 mb-2 text-sm md:text-base">
                  <span className="font-semibold">Category:</span>{" "}
                  {product.category}
                </p>
                <p className="text-gray-700 mb-2 text-sm md:text-base">
                  <span className="font-semibold">Stock:</span>{" "}
                  {product.stock > 0 ? (
                    <span className="text-green-600">
                      {product.stock} In Stock
                    </span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </p>
                <p className="text-gray-700 mb-2 text-sm md:text-base">
                  <span className="font-semibold">Availability:</span>{" "}
                  {product.availabilityStatus}
                </p>
                <p className="text-gray-700 mb-2 text-sm md:text-base">
                  <span className="font-semibold">SKU:</span> {product.sku}
                </p>
                <p className="text-gray-700 mb-2 text-sm md:text-base">
                  <span className="font-semibold">Weight:</span>{" "}
                  {product.weight} kg
                </p>
                <p className="text-gray-700 mb-0 text-sm md:text-base">
                  <span className="font-semibold">Dimensions:</span>{" "}
                  {product.dimensions.width}x{product.dimensions.height}x
                  {product.dimensions.depth} cm
                </p>
              </div>

              <div className="flex-1 border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-bold mb-2">Policies</h3>
                <p className="text-gray-700 mb-2 text-sm md:text-base">
                  <span className="font-semibold">Warranty:</span>{" "}
                  {product.warrantyInformation}
                </p>
                <p className="text-gray-700 mb-2 text-sm md:text-base">
                  <span className="font-semibold">Shipping:</span>{" "}
                  {product.shippingInformation}
                </p>
                <p className="text-gray-700 mb-2 text-sm md:text-base">
                  <span className="font-semibold">Return Policy:</span>{" "}
                  {product.returnPolicy}
                </p>
                <p className="text-gray-700 mb-2 text-sm md:text-base">
                  <span className="font-semibold">Minimum Order:</span>{" "}
                  {product.minimumOrderQuantity}
                </p>
                <p className="text-gray-700 mb-4 text-sm md:text-base">
                  <span className="font-semibold">Tags:</span>{" "}
                  {product.tags.join(", ")}
                </p>

                <div className="hidden md:flex flex-col gap-3 mt-4">
                  <button
                    className="w-full bg-[#FFD814] text-black py-2 px-5 rounded-full text-lg font-semibold hover:bg-[#F7CA00] transition-colors shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                      alert(
                        `Product added! Your cart now has ${
                          cartItemCount + 1
                        } items.`
                      );
                    }}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="w-full bg-[#FFA41C] text-black py-2 px-5 rounded-full text-lg font-semibold hover:bg-[#FBBD73] transition-colors shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyNow();
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {Array.isArray(product.reviews) && product.reviews.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
            {product.reviews.map((review, index) => (
              <div
                key={index}
                className="mb-4 p-4 border rounded-md bg-gray-50"
              >
                <div className="flex items-center mb-2">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-gray-700 font-semibold text-sm">
                    {review.reviewerName}
                  </span>
                </div>
                <p className="text-gray-700 mb-1 text-sm">"{review.comment}"</p>
                <p className="text-gray-500 text-xs">
                  Reviewed on {new Date(review.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <div className="max-w-[90rem] mx-auto p-4 md:p-8 bg-white shadow-lg rounded-lg my-8">
          <h2 className="text-2xl font-bold mb-6 border-b-2 pb-2">
            Related Products from "{product.category}"
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => {
              const relatedDiscountedPrice = (
                relatedProduct.price -
                (relatedProduct.price * relatedProduct.discountPercentage) / 100
              ).toFixed(2);
              const relatedOriginalPrice = relatedProduct.price.toFixed(2);

              return (
                <div
                  key={relatedProduct.id}
                  className="bg-white p-4 shadow-md rounded-lg flex flex-col items-start text-sm cursor-pointer"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <img
                    src={relatedProduct.thumbnail}
                    alt={relatedProduct.title}
                    className="w-full h-48 object-contain mb-4 rounded-md"
                  />
                  <p className="text-gray-500 mb-1 capitalize">
                    {relatedProduct.brand}
                  </p>
                  <h3 className="text-base font-semibold mb-2 line-clamp-2">
                    {relatedProduct.title}
                  </h3>
                  <p className="text-gray-700 mb-2 line-clamp-3">
                    {truncateDescription(relatedProduct.description, 90)}
                  </p>

                  <div className="flex items-center mb-2">
                    {renderStars(relatedProduct.rating)}
                    <span className="text-blue-600 hover:text-orange-500 cursor-pointer ml-1 text-xs">
                      (
                      {Array.isArray(relatedProduct.reviews)
                        ? relatedProduct.reviews.length
                        : 0}{" "}
                      )
                    </span>
                  </div>

                  <div className="flex items-baseline mb-3">
                    <span className="text-red-700 font-bold text-lg mr-2">
                      ${relatedDiscountedPrice}
                    </span>
                    <span className="text-gray-500 line-through text-sm">
                      ${relatedOriginalPrice}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${relatedProduct.id}`);
                    }}
                    className="mt-auto w-full bg-gray-100 text-blue-700 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-200 text-sm"
                  >
                    See options
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default ProductDetail;
