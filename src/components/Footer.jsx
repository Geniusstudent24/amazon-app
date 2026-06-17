import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const [showDropdown, setShowDropdown] = useState(false);
  const [countries, setCountries] = useState([]);
  const [showDropdownL, setShowDropdownL] = useState(false);

  const [selected, setSelected] = useState({
    name: "United States",
    code: "US",
    flag: "https://flagcdn.com/us.svg",
  });

  const language = [
    { label: "English - EN", code: "US", url: "#" },
    { label: "español - ES", code: "ES", url: "#" },
    { label: "العربية - AR", code: "SA", url: "#" },
    { label: "Deutsch - DE", code: "DE", url: "#" },
    { label: "עברית - HE", code: "IL", url: "#" },
  ];

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags")
      .then((res) => res.json())
      .then((data) => {
        const list = data.map((c) => ({
          name: c.name.common,
          code: c.cca2,
          flag: c.flags.svg,
        }));
        setCountries(list);
      });
  }, []);

  const first = [
    ["Amazon Music", "Stream millions of songs"],
    ["Amazon Ads", "Reach customers wherever they spend their time"],
    ["6pm", "Score deals on fashion brands"],
    ["AbeBooks", "Books, art & collectibles"],
    ["ACX", "Audiobook Publishing Made Easy"],
    ["Sell on Amazon", "Start a Selling Account"],
    ["Veeqo", "Shipping Software Inventory Management"],
  ];
  const sec = [
    ["Amazon Business", "Everything For Your Business"],
    ["AmazonGlobal", "Ship Orders Internationally"],
    ["Amazon Web Services", "Scalable Cloud Computing Services"],
    ["Audible", "Listen to Books & Original Audio Performances"],
    ["Box Office Mojo", "Find Movie Box Office Data"],
    ["Goodreads", "Book reviews & recommendations"],
    ["IMDb", "Movies, TV & Celebrities"],
  ];
  const the = [
    ["IMDbPro", "Get Info Entertainment Professionals Need"],
    ["Kindle Direct Publishing", "Indie Digital & Print Publishing Made Easy"],
    ["Prime Video Direct", "Video Distribution Made Easy"],
    ["Shopbop", "Designer Fashion Brands"],
    ["Woot!", "Deals and Shenanigans"],
    ["Zappos", "Shoes & Clothing"],
    ["Ring", "Smart Home Security Systems"],
  ];
  const four = [
    ["eero WiFi", "Stream 4K Video in Every Room"],
    ["Blink", "Smart Security for Every Home"],
    ["Neighbors App", "Real-Time Crime & Safety Alerts"],
    [
      "Amazon Subscription Boxes",
      "Top subscription boxes – right to your door",
    ],
    ["PillPack", "Pharmacy Simplified"],
  ];

  return (
    <>
      <footer className="bg-[#232F3E] text-white text-sm font-normal hidden md:block">
        {" "}
        <div
          className="bg-[#37475A] text-center py-4 cursor-pointer hover:brightness-110 transition"
          onClick={scrollToTop}
        >
          Back to top
        </div>
        <div className="max-w-[1200px] mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              title: "Get to Know Us",
              links: [
                "Careers",
                "Blog",
                "About Amazon",
                "Investor Relations",
                "Amazon Devices",
                "Amazon Science",
              ],
            },
            {
              title: "Make Money with Us",
              links: [
                "Sell products on Amazon",
                "Sell apps on Amazon",
                "Become an Affiliate",
                "Advertise Your Products",
                "Self-Publish with Us",
                "Host an Amazon Hub",
              ],
            },
            {
              title: "Amazon Payment Products",
              links: [
                "Amazon Business Card",
                "Shop with Points",
                "Reload Your Balance",
                "Amazon Currency Converter",
              ],
            },
            {
              title: "Let Us Help You",
              links: [
                "Your Account",
                "Your Orders",
                "Shipping Rates & Policies",
                "Returns & Replacements",
                "Manage Your Content",
                "Help",
              ],
            },
          ].map((section, idx) => (
            <div key={idx}>
              <h3 className="font-bold mb-2">{section.title}</h3>
              <ul className="space-y-1 text-[13px]">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="hover:underline">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-600 py-6 text-center text-xs text-gray-300">
          <div className="flex justify-center items-center gap-6 flex-wrap mb-4">
            <img
              src="/nav-logo.png"
              alt="logo"
              className="h-6 object-contain"
            />

            <div
              className="relative"
              onMouseEnter={() => setShowDropdownL(true)}
              onMouseLeave={() => setShowDropdownL(false)}
            >
              <div className="flex items-center border border-gray-500 px-3 py-1 rounded-sm cursor-pointer gap-1 hover:brightness-110">
                <i className="fa-solid fa-globe"></i>
                <span>English</span>
              </div>

              {showDropdownL && (
                <div className="absolute top-[40px] left-0 bg-white text-black shadow-lg rounded w-64 z-50 p-4">
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

            <div className="border border-gray-500 px-2 py-1 rounded-sm cursor-pointer hover:brightness-110">
              $ USD - U.S. Dollar
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center border border-gray-500 px-2 py-1 rounded-sm text-white cursor-pointer hover:brightness-110"
              >
                <img
                  src={selected.flag}
                  alt={selected.code}
                  className="w-5 h-4 mr-2"
                />
                {selected.name}
                <i className="fa-solid fa-caret-down ml-2"></i>
              </button>

              {showDropdown && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white text-black border border-gray-300 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                  {countries.slice(0, 6).map((c) => (
                    <div
                      key={c.code}
                      onClick={() => {
                        setSelected(c);
                        setShowDropdown(false);
                      }}
                      className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <img src={c.flag} alt="" className="w-5 h-4 mr-2" />
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-center">
            © 2025 Amazon Clone - Built for UI practice
          </p>
        </div>
        <div className="bg-[#131A22] text-[#DDD] text-[11px] py-[30px] mt-[30px] font-inter">
          <div className="max-w-[1120px] mx-auto px-4">
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-[26px] gap-y-[20px]">
              {first.map(([title, subtitle], i) => (
                <li key={i} className="w-full text-left">
                  <a href="#" className="hover:underline block">
                    <h5 className="text-white font-semibold text-[13px] leading-[16px] mb-[2px]">
                      {title}
                    </h5>
                    <span className="text-[#999] text-[11px] leading-[16px]">
                      {subtitle}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-[26px] gap-y-[20px] mt-[20px]">
              {sec.map(([title, subtitle], i) => (
                <li key={i} className="w-full text-left">
                  <a href="#" className="hover:underline block">
                    <h5 className="text-white font-semibold text-[13px] leading-[16px] mb-[2px]">
                      {title}
                    </h5>
                    <span className="text-[#999] text-[11px] leading-[16px]">
                      {subtitle}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-[26px] gap-y-[20px] mt-[20px]">
              {the.map(([title, subtitle], i) => (
                <li key={i} className="w-full text-left">
                  <a href="#" className="hover:underline block">
                    <h5 className="text-white font-semibold text-[13px] leading-[16px] mb-[2px]">
                      {title}
                    </h5>
                    <span className="text-[#999] text-[11px] leading-[16px]">
                      {subtitle}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <ul className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-x-[26px] gap-y-[20px] mt-[20px]">
              <li aria-hidden="true"></li>
              {four.map(([title, subtitle], i) => (
                <li key={i} className="w-full text-left">
                  <a href="#" className="hover:underline block">
                    <h5 className="text-white font-semibold text-[13px] leading-[16px] mb-[2px]">
                      {title}
                    </h5>
                    <span className="text-[#999] text-[11px] leading-[16px]">
                      {subtitle}
                    </span>
                  </a>
                </li>
              ))}
              <li aria-hidden="true"></li>
            </ul>
          </div>
          <div className="border-t border-gray-800 text-center py-4 mt-8">
            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-[#DDD] mb-1">
              <li>
                <a href="#" className="hover:underline">
                  Conditions of Use
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Privacy Notice
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Consumer Health Data Privacy Disclosure
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Your Ads Privacy Choices
                </a>
              </li>
            </ul>
            <p className="text-[#DDD]">
              © 1996-2025, Amazon.com, Inc. or its affiliates
            </p>
          </div>
        </div>
      </footer>

      <footer className="bg-[#0F1111] text-white text-[13px] font-normal md:hidden block">
        <div
          className="bg-[#323842]  pb-3 text-center text-xs text-white tracking-wide cursor-pointer"
          onClick={scrollToTop}
        >
          <i className="fa-solid fa-angle-up text-lg"></i>
          <div className="mt-1">TOP OF PAGE</div>
        </div>
        <div className="bg-[#232F3E] px-6 py-6">
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-[#DDD] text-[16px] leading-4 font-semibold">
            {[
              "Amazon.com",
              "Your Orders",
              "Your Lists",
              "Gift Cards",
              "Registry & Gift List",
              "Find a Gift",
              "Your Account",
              "Browsing History",
              "Sell products on Amazon",
              "Your Returns",
              "Recalls and Product Safety Alerts",
              "",
              "Customer Service",
            ].map((link, i) => (
              <a key={i} href="#" className="hover:underline">
                {link}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-[#3a4553] px-6 py-4 flex flex-col items-center gap-3 text-[#DDD] text-[13px]">
          <Link to="/languageSetting">
            <div className="flex items-center gap-y-8 gap-x-6 text-[15px]">
              <div className="">
                {" "}
                <i className="fa-solid fa-globe mr-[8px]"></i>
                <span>English</span>
              </div>
              <div>$ USD - U.S. Dollar</div>
            </div>
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center px-2 py-1 rounded-sm text-white cursor-pointer hover:brightness-110 text-[18px]"
            >
              <img
                src={selected.flag}
                alt={selected.code}
                className="w-5 h-4 mr-2"
              />
              {selected.name}
              <i className="fa-solid fa-caret-down ml-2"></i>
            </button>

            {showDropdown && (
              <div className="absolute left-0  bottom-full mt-2 w-48 bg-white text-black border border-gray-300 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {countries.slice(0, 6).map((c) => (
                  <div
                    key={c.code}
                    onClick={() => {
                      setSelected(c);
                      setShowDropdown(false);
                    }}
                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <img src={c.flag} alt={c.code} className="w-5 h-4 mr-2" />
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center px-6 py-4 text-sm text-white">
          Already a customer?{" "}
          <Link to="/login">
            <a href="#" className="text-[#00A8E1] hover:underline">
              Sign in
            </a>
          </Link>
        </div>

        <div className="border-t border-[#3a4553] text-center text-[11px] text-[#DDD] px-6 py-4">
          <div className="flex flex-wrap justify-center gap-3 mb-2">
            <a href="#" className="hover:underline">
              Conditions of Use
            </a>
            <a href="#" className="hover:underline">
              Privacy Notice
            </a>
            <a href="#" className="hover:underline">
              Consumer Health Data Privacy Disclosure
            </a>
            <a href="#" className="hover:underline">
              Your Ads Privacy Choices
            </a>
          </div>
          <p className="text-[#AAA]">
            © 1996-2025, Amazon.com, Inc. or its affiliates
          </p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
