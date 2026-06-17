import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Menu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  return (
    <>
      <div className="w-full bg-[#232F3E] px-3 text-white md:hidden">
        <div className="h-[36px] flex items-center gap-3 text-sm font-medium overflow-x-auto whitespace-nowrap scrollbar-hide pl-1">
          <a
            href="#"
            className="hover:border hover:border-white px-2 py-1 rounded"
          >
            Today's Deals
          </a>
          <a
            href="#"
            className="hover:border hover:border-white px-2 py-1 rounded"
          >
            Registry
          </a>
          <a
            href="#"
            className="hover:border hover:border-white px-2 py-1 rounded"
          >
            Prime Video
          </a>
          <a
            href="#"
            className="hover:border hover:border-white px-2 py-1 rounded"
          >
            Gift Cards
          </a>
          <a
            href="#"
            className="hover:border hover:border-white px-2 py-1 rounded"
          >
            Customer Service
          </a>
          <a
            href="#"
            className="hover:border hover:border-white px-2 py-1 rounded"
          >
            Sell
          </a>
        </div>
      </div>
      <div className="w-full bg-[#232F3E] px-4 text-white hidden md:flex">
        <div className="max-w-[1400px]  h-[36px] flex items-center gap-3 text-sm font-medium">
          <div
            className="flex items-center gap-1 cursor-pointer hover:border hover:border-white px-2 py-1 rounded"
            onClick={toggleMenu}
          >
            <i className="fa-solid fa-bars text-[14px]"></i>
            <span>All</span>
          </div>

          <div className="flex gap-2 whitespace-nowrap overflow-x-auto scrollbar-hide">
            <a
              href="#"
              className="hover:border hover:border-white px-2 py-1 rounded"
            >
              Today's Deals
            </a>
            <a
              href="#"
              className="hover:border hover:border-white px-2 py-1 rounded"
            >
              Registry
            </a>
            <a
              href="#"
              className="hover:border hover:border-white px-2 py-1 rounded"
            >
              Prime Video
            </a>
            <a
              href="#"
              className="hover:border hover:border-white px-2 py-1 rounded"
            >
              Gift Cards
            </a>
            <a
              href="#"
              className="hover:border hover:border-white px-2 py-1 rounded"
            >
              Customer Service
            </a>
            <a
              href="#"
              className="hover:border hover:border-white px-2 py-1 rounded"
            >
              Sell
            </a>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <button
          onClick={toggleMenu}
          className="fixed top-3 left-[325px] z-[60] w-10 h-10 bg-gray-300 rounded-full shadow flex items-center justify-center hover:scale-105 hover:shadow-lg"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      )}
      <div
        className={`fixed top-0 left-0 h-full w-[320px] bg-white z-50 shadow-lg transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b bg-[#232F3E] text-white">
          <div className="flex items-center gap-2 text-lg font-bold">
            <Link to={userName ? "/" : "/login"}>
              <i className="fa-solid fa-user text-xl"></i> Hello,{" "}
              {userName ? userName : "sign in"}
            </Link>
          </div>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-60px)] text-sm space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Digital Content & Devices</h4>
            <ul className="space-y-1">
              <li className="flex justify-between hover:bg-gray-100 px-2 py-1 cursor-pointer">
                Prime Video{" "}
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </li>
              <li className="flex justify-between hover:bg-gray-100 px-2 py-1 cursor-pointer">
                Amazon Music{" "}
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </li>
              <li className="flex justify-between hover:bg-gray-100 px-2 py-1 cursor-pointer">
                Kindle E-readers & Books{" "}
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </li>
              <li className="flex justify-between hover:bg-gray-100 px-2 py-1 cursor-pointer">
                Amazon Appstore{" "}
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Shop by Department</h4>
            <ul className="space-y-1">
              <li className="flex justify-between hover:bg-gray-100 px-2 py-1 cursor-pointer">
                Electronics{" "}
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </li>
              <li className="flex justify-between hover:bg-gray-100 px-2 py-1 cursor-pointer">
                Computers <i className="fa-solid fa-chevron-right text-xs"></i>
              </li>
              <li className="flex justify-between hover:bg-gray-100 px-2 py-1 cursor-pointer">
                Smart Home <i className="fa-solid fa-chevron-right text-xs"></i>
              </li>
              <li className="flex justify-between hover:bg-gray-100 px-2 py-1 cursor-pointer">
                Arts & Crafts{" "}
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Programs & Features</h4>
            <ul className="space-y-1">
              <li className="flex justify-between hover:bg-gray-100 px-2 py-1 cursor-pointer">
                Gift Cards <i className="fa-solid fa-chevron-right text-xs"></i>
              </li>
              <li className="flex justify-between hover:bg-gray-100 px-2 py-1 cursor-pointer">
                Shop By intrest
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </li>
              <li className="flex justify-between hover:bg-gray-100 px-2 py-1 cursor-pointer">
                Amazon Live
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </li>
              <li className="flex justify-between hover:bg-gray-100 px-2 py-1 cursor-pointer">
                International Shopping
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Menu;
