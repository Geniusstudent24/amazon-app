import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import hero1 from "/sd1.jpg";
import hero2 from "/sd2.jpg";
import hero3 from "/sd3.jpg";
import hero4 from "/sd4.jpg";
import hero5 from "/sd5.jpg";
import Navbar from "../components/Navbar.jsx";
import Menu from "../components/Menu.jsx";
import Footer from "../components/Footer.jsx";
import { useProducts } from "../context/ProductContext";

function Home() {
  const navigate = useNavigate();
  const { allProducts, loading, error } = useProducts();
  const images = [hero1, hero2, hero3, hero4, hero5];
  const [current, setCurrent] = useState(0);
  const [categorizedProducts, setCategorizedProducts] = useState({});
  const [horizontalSections, setHorizontalSections] = useState([]);
  const [horizontalSections2, setHorizontalSections2] = useState([]);
  const [horizontalSections3, setHorizontalSections3] = useState([]);
  const [usedProductIds, setUsedProductIds] = useState(new Set());
  const [usedCategoriesInTopGrids, setUsedCategoriesInTopGrids] = useState(
    new Set()
  );

  const heroCategories = [
    "mobile-accessories",
    "kitchen-accessories",
    "womens-dresses",
    "home-decoration",
    "laptops",
  ];
  const heroMobileCategories = [
    "kitchen-accessories",
    "womens-dresses",
    "beauty",
    "home-decoration",
  ];
  const mobileHeroCards = [
    {
      id: 1,
      title: "Kitchen <br /> must-haves",
      image: "/img1.jpg",
    },
    {
      id: 2,
      title: "Start looking<br /> sharp",
      image: "/img2.jpg",
      link: "#",
    },
    { id: 3, title: "All things beauty", image: "/img3.jpg", link: "#" },
    { id: 4, title: "Toys for little ones", image: "/img4.jpg", link: "#" },
  ];

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [current]);

  useEffect(() => {
    if (allProducts.length > 0) {
      const grouped = {};
      const tempUsedCategories = new Set();
      const categoriesForTopGrids = [];

      for (const product of allProducts) {
        if (
          product.category === "groceries" ||
          ["mens-watches", "mobile-accessories"].includes(product.category)
        ) {
          continue;
        }

        if (!grouped[product.category]) {
          grouped[product.category] = [];
        }
        if (grouped[product.category].length < 4) {
          grouped[product.category].push(product);
          if (
            grouped[product.category].length === 4 &&
            !tempUsedCategories.has(product.category)
          ) {
            categoriesForTopGrids.push(product.category);
            tempUsedCategories.add(product.category);
          }
        }
      }

      for (const product of allProducts) {
        if (
          product.category === "groceries" ||
          tempUsedCategories.has(product.category)
        ) {
          continue;
        }
        if (!grouped[product.category]) {
          grouped[product.category] = [];
        }

        if (grouped[product.category].length < 4) {
          grouped[product.category].push(product);
        }
      }

      setCategorizedProducts(grouped);

      setUsedCategoriesInTopGrids(new Set(categoriesForTopGrids.slice(0, 11)));

      const getProductsForSection = (
        category,
        count,
        sourceArray,
        currentUsedProductIds
      ) => {
        const found = [];
        for (const p of sourceArray) {
          if (
            p.category === category &&
            found.length < count &&
            !currentUsedProductIds.has(p.id)
          ) {
            found.push(p);
            currentUsedProductIds.add(p.id);
          }
          if (found.length === count) break;
        }
        return found;
      };

      let productsSourceForHorizontal = [...allProducts];
      const combinedHorizontalProducts = [];
      const currentUsedProductIdsForHorizontal = new Set(usedProductIds);

      combinedHorizontalProducts.push(
        ...getProductsForSection(
          "mens-watches",
          5,
          productsSourceForHorizontal,
          currentUsedProductIdsForHorizontal
        )
      );
      const mobileAccessories = getProductsForSection(
        "mobile-accessories",
        3,
        productsSourceForHorizontal,
        currentUsedProductIdsForHorizontal
      );

      const laptops = getProductsForSection(
        "laptops",
        4,
        productsSourceForHorizontal,
        currentUsedProductIdsForHorizontal
      );

      let mixedProducts = [];
      let m = 0,
        n = 0;
      while (
        mixedProducts.length < 7 &&
        (m < mobileAccessories.length || n < laptops.length)
      ) {
        if (m < mobileAccessories.length) {
          mixedProducts.push(mobileAccessories[m++]);
        }
        if (n < laptops.length) {
          mixedProducts.push(laptops[n++]);
        }
      }

      combinedHorizontalProducts.push(...mixedProducts);

      combinedHorizontalProducts.push(
        ...getProductsForSection(
          "womens-watches",
          4,
          productsSourceForHorizontal,
          currentUsedProductIdsForHorizontal
        )
      );

      combinedHorizontalProducts.push(
        ...getProductsForSection(
          "sunglasses",
          3,
          productsSourceForHorizontal,
          currentUsedProductIdsForHorizontal
        )
      );

      setHorizontalSections([{ products: combinedHorizontalProducts }]);
      setUsedProductIds(currentUsedProductIdsForHorizontal);

      const combinedHorizontalProducts2 = [];
      const currentUsedProductIdsForHorizontal2 = new Set(usedProductIds);

      combinedHorizontalProducts2.push(
        ...getProductsForSection(
          "sports-accessories",
          3,
          allProducts,
          currentUsedProductIdsForHorizontal2
        )
      );
      combinedHorizontalProducts2.push(
        ...getProductsForSection(
          "sunglasses",
          2,
          allProducts,
          currentUsedProductIdsForHorizontal2
        )
      );
      combinedHorizontalProducts2.push(
        ...getProductsForSection(
          "tablets",
          5,
          allProducts,
          currentUsedProductIdsForHorizontal2
        )
      );
      combinedHorizontalProducts2.push(
        ...getProductsForSection(
          "tops",
          5,
          allProducts,
          currentUsedProductIdsForHorizontal2
        )
      );

      setHorizontalSections2([{ products: combinedHorizontalProducts2 }]);
      setUsedProductIds(currentUsedProductIdsForHorizontal2);

      const combinedHorizontalProducts3 = [];
      const currentUsedProductIdsForHorizontal3 = new Set(usedProductIds);

      combinedHorizontalProducts3.push(
        ...getProductsForSection(
          "beauty",
          3,
          allProducts,
          currentUsedProductIdsForHorizontal3
        )
      );
      combinedHorizontalProducts3.push(
        ...getProductsForSection(
          "mens-shirts",
          3,
          allProducts,
          currentUsedProductIdsForHorizontal3
        )
      );
      combinedHorizontalProducts3.push(
        ...getProductsForSection(
          "womens-dresses",
          5,
          allProducts,
          currentUsedProductIdsForHorizontal3
        )
      );

      setHorizontalSections3([{ products: combinedHorizontalProducts3 }]);
    }
  }, [allProducts]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="h-[60px] hidden md:block"></div>
        <Menu />
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
          {" "}
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
              Loading products...
            </p>{" "}
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
  const categoriesForGrids = Object.keys(categorizedProducts).filter(
    (categoryName) =>
      categoryName !== "groceries" &&
      categorizedProducts[categoryName] &&
      categorizedProducts[categoryName].length === 4
  );

  return (
    <>
      <Navbar />
      <div className="h-[60px]  hidden md:block"></div>
      <Menu />
      <div className="md:hidden w-full overflow-x-hidden">
        <div className="md:hidden w-full bg-white pt-4 pb-4">
          <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="flex space-x-4">
              {mobileHeroCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() =>
                    navigate(`/products/${heroMobileCategories[card.id]}`)
                  }
                  className="inline-block w-60 flex-shrink-0 bg-white p-4 shadow-md rounded-lg"
                >
                  <div className="relative flex flex-col items-center justify-center h-68 w-full">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover rounded-md"
                    />

                    <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b rounded-t-lg">
                      <h2
                        className="text-lg font-bold mb-2"
                        dangerouslySetInnerHTML={{ __html: card.title }}
                      ></h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:hidden w-full bg-[#262d3d] px-[50px] py-2 text-center shadow-md mb-4 relative z-10 mx-auto">
          <p className="text-sm sm:text-sm lg:text-base text-white text-center">
            You are on amazon.com. You can also shop on Amazon India for
            millions of products with fast local delivery.{" "}
            <a
              href="https://www.amazon.in"
              className="text-white hover:text-orange-500 underline"
            >
              Click here to go to amazon.in
            </a>
          </p>
        </div>
        <div className="relative z-10 pb-8 md:-mt-[200px] lg:-mt-[250px] xl:-mt-[300px]">
          <div className="max-w-[90rem] mx-auto py-4 grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
            <div
              key="manual-first-large-container"
              className="bg-white p-4 shadow-md flex flex-col justify-between h-full"
            >
              <h2 className="text-lg sm:text-xl font-bold mb-4">
                Get your gaming on
              </h2>{" "}
              <div className="flex flex-col items-center justify-center h-full w-full">
                <img
                  src={"/gaming.jpg"}
                  alt="Discover More"
                  className="w-full h-auto object-cover mb-4"
                  style={{ maxHeight: "350px" }}
                />
              </div>
              <a
                href="#"
                className="text-blue-700 hover:text-orange-500 text-sm mt-4 block"
              >
                Shop Gaming
              </a>
            </div>

            {categoriesForGrids
              .filter((categoryName) => categoryName !== "groceries")
              .slice(0, 3)
              .map((categoryName) => (
                <div
                  key={categoryName}
                  className="bg-white p-4 shadow-md flex flex-col justify-between h-full"
                >
                  <h2 className="text-lg sm:text-xl font-bold mb-4 capitalize">
                    Shop {categoryName.replace(/-/g, " ")}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {categorizedProducts[categoryName].map((product) => (
                      <div
                        key={product.id}
                        className="text-center cursor-pointer"
                        onClick={() =>
                          navigate(`/products/${product.category}`)
                        }
                      >
                        <div className="border border-gray-200 bg-gray-50 rounded-md p-2 transform transition-transform duration-200 hover:scale-105">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-full h-auto object-cover mb-2"
                          />
                        </div>
                        <p className="text-sm text-gray-700">{product.title}</p>
                      </div>
                    ))}
                  </div>
                  <a
                    onClick={() => navigate(`/products/${product.category}`)}
                    className="text-blue-700 hover:text-orange-500 text-sm mt-4 block"
                  >
                    Shop now
                  </a>
                </div>
              ))}
          </div>
        </div>
        {horizontalSections.length > 0 && (
          <div className="bg-white p-4 shadow-md mb-4 max-w-[90rem] mx-auto mt-4 px-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              Top picks for India
            </h2>{" "}
            <div className="overflow-x-auto whitespace-nowrap scrollbar-hide ">
              <div className="flex space-x-4 pb-4">
                {horizontalSections[0].products.map((product) => (
                  <div
                    key={product.id}
                    className="inline-block w-40 sm:w-48 md:w-60 text-left flex-shrink-0"
                  >
                    <div className="border border-gray-200 bg-gray-50 rounded-md p-2 transform transition-transform duration-200 hover:scale-105">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-auto object-cover"
                        style={{
                          maxHeight: "150px",
                        }}
                      />
                    </div>

                    <p className="text-sm font-semibold mt-2 overflow-hidden text-ellipsis whitespace-normal line-clamp-2">
                      {" "}
                      {product.title}
                    </p>
                    {product.price && (
                      <p className="text-base font-bold">
                        {" "}
                        ${product.price}
                        {product.list_price && (
                          <span className="text-xs text-gray-500 line-through ml-1">
                            ${product.list_price}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}{" "}
        <div className="max-w-[90rem] mx-auto py-4 grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
          {categoriesForGrids
            .filter((categoryName) => categoryName !== "groceries")
            .slice(3, 7)
            .map((categoryName) => (
              <div
                key={categoryName}
                className="bg-white p-4 shadow-md flex flex-col justify-between h-full"
              >
                <h2 className="text-lg sm:text-xl font-bold mb-4 capitalize">
                  Shop {categoryName.replace(/-/g, " ")}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {categorizedProducts[categoryName].map((product) => (
                    <div
                      key={product.id}
                      className="text-center cursor-pointer"
                      onClick={() => navigate(`/products/${product.category}`)}
                    >
                      <div className="border border-gray-200 bg-gray-50 rounded-md p-2 transform transition-transform duration-200 hover:scale-105">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-full h-auto object-cover mb-2"
                        />
                      </div>
                      <p className="text-sm text-gray-700">{product.title}</p>
                    </div>
                  ))}
                </div>
                <a
                  onClick={() => navigate(`/products/${product.category}`)}
                  className="text-blue-700 hover:text-orange-500 text-sm mt-4 block"
                >
                  Shop now
                </a>
              </div>
            ))}
        </div>
        {Object.keys(categorizedProducts).filter(
          (categoryName) =>
            categoryName !== "groceries" &&
            !usedCategoriesInTopGrids.has(categoryName)
        ).length > 0 && (
          <div className="max-w-[90rem] mx-auto py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.keys(categorizedProducts)
              .filter(
                (categoryName) =>
                  categoryName !== "groceries" &&
                  !usedCategoriesInTopGrids.has(categoryName)
              )
              .slice(0, 4)
              .map((categoryName) => (
                <div
                  key={categoryName}
                  className="bg-white p-4 shadow-md flex flex-col justify-between h-full"
                >
                  <h2 className="text-xl font-bold mb-4 capitalize">
                    Shop {categoryName.replace(/-/g, " ")}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {categorizedProducts[categoryName] &&
                      categorizedProducts[categoryName]
                        .slice(0, 4)
                        .map((product) => (
                          <div
                            key={product.id}
                            className="text-center cursor-pointer"
                            onClick={() =>
                              navigate(`/products/${product.category}`)
                            }
                          >
                            <div className="border border-gray-200 bg-gray-50 rounded-md p-2 transform transition-transform duration-200 hover:scale-105">
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                              />
                            </div>
                            <p className="text-sm text-gray-700">
                              {product.title}
                            </p>
                          </div>
                        ))}
                  </div>
                  <a
                    onClick={() => navigate(`/products/${product.category}`)}
                    className="text-blue-700 hover:text-orange-500 text-sm mt-4 block"
                  >
                    Shop now
                  </a>
                </div>
              ))}
          </div>
        )}
        {horizontalSections2.length > 0 && (
          <div className="bg-white p-4 shadow-md mb-4 max-w-[90rem] mx-auto mt-4 px-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              More products you might like
            </h2>{" "}
            <div className="overflow-x-auto whitespace-nowrap scrollbar-hide ">
              <div className="flex space-x-4 pb-4">
                {horizontalSections2[0].products.map((product) => (
                  <div
                    key={product.id}
                    className="inline-block w-40 sm:w-48 md:w-60 text-left flex-shrink-0"
                  >
                    {" "}
                    <div className="border border-gray-200 bg-gray-50 rounded-md p-2 transform transition-transform duration-200 hover:scale-105">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-auto object-cover"
                        style={{ maxHeight: "150px" }}
                      />
                    </div>
                    <p className="text-sm font-semibold mt-2 overflow-hidden text-ellipsis whitespace-normal line-clamp-2">
                      {product.title}
                    </p>
                    {product.price && (
                      <p className="text-base font-bold">
                        ${product.price}
                        {product.list_price && (
                          <span className="text-xs text-gray-500 line-through ml-1">
                            ${product.list_price}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {categoriesForGrids.slice(7, 11).length > 0 && (
          <div className="max-w-[90rem] mx-auto py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoriesForGrids.slice(7, 11).map((categoryName) => (
              <div
                key={categoryName}
                className="bg-white p-4 shadow-md flex flex-col justify-between h-full"
              >
                <h2 className="text-xl font-bold mb-4 capitalize">
                  Shop {categoryName.replace(/-/g, " ")}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {categorizedProducts[categoryName] &&
                    categorizedProducts[categoryName]
                      .slice(0, 4)
                      .map((product) => (
                        <div
                          key={product.id}
                          className="text-center cursor-pointer"
                          onClick={() =>
                            navigate(`/products/${product.category}`)
                          }
                        >
                          <div className="border border-gray-200 bg-gray-50 rounded-md p-2 transform transition-transform duration-200 hover:scale-105">
                            <img src={product.thumbnail} alt={product.title} />
                          </div>
                          <p className="text-sm text-gray-700">
                            {product.title}
                          </p>
                        </div>
                      ))}
                </div>
                <a
                  onClick={() => navigate(`/products/${product.category}`)}
                  className="text-blue-700 hover:text-orange-500 text-sm mt-4 block"
                >
                  Shop now
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-hidden hidden md:flex">
        <div className="w-full bg-[#e3e6e6] max-w-full overflow-hidden">
          <div className="relative w-full overflow-hidden h-[400px] sm:h-[500px] md:h-[600px]">
            <div
              className="flex transition-transform duration-1000 ease-in-out h-full"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`/products/${heroCategories[idx]}`)}
                  className="w-full h-full flex-shrink-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(to top, #e3e6e6 0%, transparent 50%), url(${img})`,
                  }}
                ></div>
              ))}
            </div>
            <button
              onClick={prevSlide}
              className="absolute top-[21%] -translate-y-1/2 left-0 text-black z-30 h-60 w-16 flex items-center outline-none justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-black active:outline active:outline-2 active:outline-black hover:bg-black/10 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-16 h-16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="absolute top-[21%] -translate-y-1/2 right-0 text-black z-30 h-60 w-16 flex items-center outline-none justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-black active:outline active:outline-2 active:outline-black hover:bg-black/10 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-16 h-16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
          <div
            className="absolute z-20 inset-x-0 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 text-center bg-[#f7fafa] py-2 sm:py-3 lg:py-3 shadow-md"
            style={{ bottom: "46%" }}
          >
            <p className="text-xs sm:text-sm lg:text-base text-gray-700">
              You are on amazon.com. You can also shop on Amazon India for
              millions of products with fast local delivery.{" "}
              <a
                href="https://www.amazon.in"
                className="text-blue-700 hover:text-orange-500 underline"
              >
                Click here to go to amazon.in
              </a>
            </p>
          </div>

          <div className="relative z-10 -mt-[120px] sm:-mt-[150px] md:-mt-[200px] lg:-mt-[250px] xl:-mt-[300px] pb-8">
            <div className="max-w-[90rem] mx-auto py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                key="manual-first-large-container"
                className="bg-white p-4 shadow-md flex flex-col justify-between h-full"
              >
                <h2 className="text-xl font-bold mb-4">Get your gaming on</h2>{" "}
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <img
                    src={"/gaming.jpg"}
                    alt="Discover More"
                    className="w-full h-auto object-cover mb-4"
                    style={{ maxHeight: "350px" }}
                  />
                </div>
                <a
                  href="#"
                  className="text-blue-700 hover:text-orange-500 text-sm mt-4 block"
                >
                  Shop Gaming
                </a>
              </div>
              {categoriesForGrids
                .filter((categoryName) => categoryName !== "groceries")
                .slice(0, 3)
                .map((categoryName) => (
                  <div
                    key={categoryName}
                    className="bg-white p-4  shadow-md flex flex-col justify-between h-full"
                  >
                    <h2 className="text-xl font-bold mb-4 capitalize">
                      Shop {categoryName.replace(/-/g, " ")}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {categorizedProducts[categoryName].map((product) => (
                        <div
                          key={product.id}
                          className="text-center cursor-pointer"
                          onClick={() =>
                            navigate(`/products/${product.category}`)
                          }
                        >
                          <div className="border border-gray-200 bg-gray-50 rounded-md p-2 transform transition-transform duration-200 hover:scale-105">
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="w-full h-auto object-cover mb-2"
                            />
                          </div>
                          <p className="text-sm text-gray-700">
                            {product.title}
                          </p>
                        </div>
                      ))}
                    </div>
                    <a
                      onClick={() => navigate(`/products/${product.category}`)}
                      className="text-blue-700 hover:text-orange-500 text-sm mt-4 block"
                    >
                      Shop now
                    </a>
                  </div>
                ))}
            </div>
            <div className="max-w-[90rem] mx-auto py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoriesForGrids
                .filter((categoryName) => categoryName !== "groceries")
                .slice(3, 7)
                .map((categoryName) => (
                  <div
                    key={categoryName}
                    className="bg-white p-4  shadow-md flex flex-col justify-between h-full"
                  >
                    <h2 className="text-xl font-bold mb-4 capitalize">
                      Shop {categoryName.replace(/-/g, " ")}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {categorizedProducts[categoryName].map((product) => (
                        <div
                          key={product.id}
                          className="text-center cursor-pointer"
                          onClick={() =>
                            navigate(`/products/${product.category}`)
                          }
                        >
                          <div className="border border-gray-200 bg-gray-50 rounded-md p-2 transform transition-transform duration-200 hover:scale-105">
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="w-full h-auto object-cover mb-2"
                            />
                          </div>
                          <p className="text-sm text-gray-700">
                            {product.title}
                          </p>
                        </div>
                      ))}
                    </div>
                    <a
                      onClick={() => navigate(`/products/${product.category}`)}
                      className="text-blue-700 hover:text-orange-500 text-sm mt-4 block"
                    >
                      Shop now
                    </a>
                  </div>
                ))}
            </div>
            {horizontalSections.length > 0 && (
              <div className="bg-white p-4 shadow-md mb-4 max-w-[90rem] mx-auto mt-4">
                <h2 className="text-3xl font-bold mb-4">Top picks for India</h2>
                <div className="overflow-x-auto whitespace-nowrap scrollbar-hide ">
                  <div className="flex space-x-4 pb-4">
                    {horizontalSections[0].products.map((product) => (
                      <div
                        key={product.id}
                        className="inline-block w-60 text-center flex-shrink-0"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {" "}
                        <div className="border border-gray-200 bg-gray-50 rounded-md p-2 transform transition-transform duration-200 hover:scale-105">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}{" "}
            {Object.keys(categorizedProducts).filter(
              (categoryName) =>
                categoryName !== "groceries" &&
                !usedCategoriesInTopGrids.has(categoryName)
            ).length > 0 && (
              <div className="max-w-[90rem] mx-auto py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.keys(categorizedProducts)
                  .filter(
                    (categoryName) =>
                      categoryName !== "groceries" &&
                      !usedCategoriesInTopGrids.has(categoryName)
                  )
                  .slice(0, 4)
                  .map((categoryName) => (
                    <div
                      key={categoryName}
                      className="bg-white p-4 shadow-md flex flex-col justify-between h-full"
                    >
                      <h2 className="text-xl font-bold mb-4 capitalize">
                        Shop {categoryName.replace(/-/g, " ")}
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        {categorizedProducts[categoryName] &&
                          categorizedProducts[categoryName]
                            .slice(0, 4)
                            .map((product) => (
                              <div
                                key={product.id}
                                className="text-center cursor-pointer"
                                onClick={() =>
                                  navigate(`/products/${product.category}`)
                                }
                              >
                                <div className="border border-gray-200 bg-gray-50 rounded-md p-2 transform transition-transform duration-200 hover:scale-105">
                                  <img
                                    src={product.thumbnail}
                                    alt={product.title}
                                  />
                                </div>
                                <p className="text-sm text-gray-700">
                                  {product.title}
                                </p>
                              </div>
                            ))}
                      </div>
                      <a
                        onClick={() =>
                          navigate(`/products/${product.category}`)
                        }
                        className="text-blue-700 hover:text-orange-500 text-sm mt-4 block"
                      >
                        Shop now
                      </a>
                    </div>
                  ))}
              </div>
            )}
            {horizontalSections2.length > 0 && (
              <div className="bg-white p-4 shadow-md mb-4 max-w-[90rem] mx-auto mt-4">
                <h2 className="text-3xl font-bold mb-4">
                  More products you might like
                </h2>{" "}
                <div className="overflow-x-auto whitespace-nowrap scrollbar-hide ">
                  <div className="flex space-x-4 pb-4">
                    {horizontalSections2[0].products.map((product) => (
                      <div
                        key={product.id}
                        className="inline-block w-60 text-center flex-shrink-0"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {" "}
                        <div className="border border-gray-200 bg-gray-50 rounded-md p-2 transform transition-transform duration-200 hover:scale-105">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}{" "}
            {horizontalSections3.length > 0 && (
              <div className="bg-white p-4 shadow-md mb-4 max-w-[90rem] mx-auto mt-4">
                <h2 className="text-3xl font-bold mb-4">
                  Even more to explore
                </h2>{" "}
                <div className="overflow-x-auto whitespace-nowrap scrollbar-hide ">
                  <div className="flex space-x-4 pb-4">
                    {horizontalSections3[0].products.map((product) => (
                      <div
                        key={product.id}
                        className="inline-block w-60 text-center flex-shrink-0"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {" "}
                        <div className="border border-gray-200 bg-gray-50 rounded-md p-2 transform transition-transform duration-200 hover:scale-105">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {categoriesForGrids.slice(7, 11).length > 0 && (
              <div className="max-w-[90rem] mx-auto py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categoriesForGrids.slice(7, 11).map((categoryName) => (
                  <div
                    key={categoryName}
                    className="bg-white p-4 shadow-md flex flex-col justify-between h-full"
                  >
                    <h2 className="text-xl font-bold mb-4 capitalize">
                      Shop {categoryName.replace(/-/g, " ")}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {categorizedProducts[categoryName] &&
                        categorizedProducts[categoryName]
                          .slice(0, 4)
                          .map((product) => (
                            <div
                              key={product.id}
                              className="text-center cursor-pointer"
                              onClick={() =>
                                navigate(`/products/${product.category}`)
                              }
                            >
                              <div className="border border-gray-200 bg-gray-50 rounded-md p-2 transform transition-transform duration-200 hover:scale-105">
                                <img
                                  src={product.thumbnail}
                                  alt={product.title}
                                />
                              </div>
                              <p className="text-sm text-gray-700">
                                {product.title}
                              </p>
                            </div>
                          ))}
                    </div>
                    <a
                      onClick={() => navigate(`/products/${product.category}`)}
                      className="text-blue-700 hover:text-orange-500 text-sm mt-4 block"
                    >
                      Shop now
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Home;
