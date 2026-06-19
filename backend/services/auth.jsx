const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user.jsx");
const authmidle = require("../midleware/auth.jsx");
const Location = require("../model/Location.jsx");
const axios = require("axios");
const CartModel = require("../model/Cart.jsx");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (email, otp) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Amazon Clone OTP Verification",
      html: `<h1>Your OTP is: ${otp}</h1>`,
    });
    console.log("Email sent successfully via Resend");
  } catch (err) {
    console.error("RESEND ERROR:", err);
    throw err;
  }
};

router.post("/check-user", async (req, res) => {
  const { input } = req.body;
  try {
    let user;
    if (input.includes("@")) {
      user = await User.findOne({ email: input });
    } else {
      user = await User.findOne({ phone: input });
    }

    if (user) {
      return res.json({
        userExists: true,
        msg: "User found. Please enter your password.",
      });
    } else {
      return res.json({
        userExists: false,
        msg: "User not found. Please create a new account.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error..." });
  }
});

router.get("/status", authmidle, (req, res) => {
  res.status(200).json({ isUserSignedIn: true, msg: "User is logged in." });
});

router.post("/login", async (req, res) => {
  const { input, password } = req.body;
  try {
    let user;
    if (input.includes("@")) {
      user = await User.findOne({ email: input });
    } else {
      user = await User.findOne({ phone: input });
    }
    console.log("User found");
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password matched");
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password." });
    }

    if (!user.email) {
      return res
        .status(400)
        .json({ msg: "Please login with your email to receive OTP." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("OTP generated");

    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    console.log("User saved");
    await sendOtpEmail(user.email, otp);
    console.log("Email sent");
    res.json({ msg: "OTP sent to your email. Please verify." });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).send("Server Error");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logged out successfully." });
});

router.post("/signup", async (req, res) => {
  const { input, password, name } = req.body;

  try {
    const isEmail = input.includes("@");

    let user;
    if (isEmail) {
      user = await User.findOne({ email: input });
    } else {
      user = await User.findOne({ phone: input });
    }

    if (user) {
      return res
        .status(400)
        .json({ msg: "User already exists. Please sign in." });
    }

    if (!isEmail) {
      return res.status(400).json({
        msg: "For signup, please use an email address to receive OTP.",
      });
    }
    const newUser = new User({
      email: input.includes("@") ? input : null,
      phone: input.includes("@") ? null : input,
      password,
      name,
    });
    console.log(password);
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    console.log(salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    newUser.otp = otp;
    newUser.otpExpiry = Date.now() + 10 * 60 * 1000;

    await newUser.save();

    await sendOtpEmail(newUser.email, otp);
    res.json({ msg: "Account created successfully. OTP sent to your email." });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.post("/verify-otp", async (req, res) => {
  const { input, otp } = req.body;

  try {
    let user;
    if (input.includes("@")) {
      user = await User.findOne({ email: input });
    } else {
      user = await User.findOne({ phone: input });
    }

    if (!user) {
      return res.status(400).json({ msg: "Invalid user." });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP." });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, async (err, token) => {
      if (err) throw err;
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      const userLocation = await Location.findOne({ userId: user.id });
      res.json({
        msg: "OTP verified successfully. You are now logged in.",
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        location: userLocation
          ? {
              city: userLocation.city,
              state: userLocation.state,
              country: userLocation.country,
              formatted: userLocation.city,
            }
          : null,
      });
    });
  } catch (error) {
    console.error("OTP verification failed:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/profile", authmidle, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const userLocation = await Location.findOne({ userId: req.user.id });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      location: userLocation
        ? {
            zipcode: userLocation.zipcode,
            city: userLocation.city,
            state: userLocation.state,
            country: userLocation.country,
            formatted: `${userLocation.city}, ${userLocation.country}`,
          }
        : null,
    });
  } catch (err) {
    console.error("Error in /profile route:", err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/profile", authmidle, async (req, res) => {
  const { name, email, phone, zipCode, countryCode = "in" } = req.body;

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.name = name || user.name;
    user.email = email === null ? null : email || user.email;
    user.phone = phone === null ? null : phone || user.phone;

    if (email && email !== user.email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser && existingEmailUser.id !== user.id) {
        return res.status(400).json({ msg: "Email already in use." });
      }
    }
    if (phone && phone !== user.phone) {
      const existingPhoneUser = await User.findOne({ phone });
      if (existingPhoneUser && existingPhoneUser.id !== user.id) {
        return res.status(400).json({ msg: "Phone number already in use." });
      }
    }

    await user.save();

    let userLocation = null;

    if (zipCode && zipCode.trim() !== "") {
      const apiResponse = await axios.get(
        `http://api.zippopotam.us/${countryCode}/${zipCode}`
      );

      if (
        !apiResponse.data ||
        !apiResponse.data.places ||
        apiResponse.data.places.length === 0
      ) {
        return res
          .status(400)
          .json({ msg: "Invalid zip code or location not found by API." });
      }

      const placeData = apiResponse.data.places[0];
      const { "place name": city, state } = placeData;
      const country = apiResponse.data.country;

      userLocation = await Location.findOne({ userId: req.user.id });

      if (userLocation) {
        userLocation.zipCode = zipCode;
        userLocation.city = city;
        userLocation.state = state;
        userLocation.country = country;
        await userLocation.save();
      } else {
        userLocation = new Location({
          userId: req.user.id,
          zipcode: zipCode,
          city,
          state,
          country,
          language: "en",
        });
        await userLocation.save();
      }
    } else if (zipCode === "") {
      await Location.deleteOne({ userId: req.user.id });
      userLocation = null;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      location: userLocation
        ? {
            zipcode: userLocation.zipCode,
            city: userLocation.city,
            state: userLocation.state,
            country: userLocation.country,
            formatted: `${userLocation.city}, ${userLocation.country}`,
          }
        : null,
    });
  } catch (err) {
    console.error("Error updating profile:", err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/set-location", authmidle, async (req, res) => {
  const { zipCode, countryCode = "in" } = req.body;
  console.log("Received zipCode:", zipCode);
  if (!zipCode) {
    return res.status(400).json({ msg: "Zip code is required" });
  }

  try {
    const apiResponse = await axios.get(
      `http://api.zippopotam.us/${countryCode}/${zipCode}`
    );
    if (
      !apiResponse.data ||
      !apiResponse.data.places ||
      apiResponse.data.places.length === 0
    ) {
      return res
        .status(404)
        .json({ msg: "Location not found for this zip code." });
    }

    const placeData = apiResponse.data.places[0];
    const { "place name": city, state } = placeData;
    const country = apiResponse.data.country;

    let location = await Location.findOne({ userId: req.user.id });

    if (location) {
      location.zipCode = zipCode;
      location.city = city;
      location.state = state;
      location.country = country;
      await location.save();
    } else {
      location = new Location({
        userId: req.user.id,
        zipCode,
        city,
        state,
        country,
      });
      await location.save();
    }

    res.json({
      msg: "Location updated successfully",
      location: {
        city: location.city,
        state: location.state,
        country: location.country,
        formatted: `${location.city}, ${location.country}`,
      },
    });
  } catch (error) {
    console.error("Error in set-location route:", error.message);
    if (error.response && error.response.status === 404) {
      return res
        .status(400)
        .json({ msg: "Invalid zip code or location not found by API." });
    }
    res.status(500).send("Server Error");
  }
});

router.get("/cart", authmidle, async (req, res) => {
  try {
    const cart = await CartModel.findOne({ userId: req.user.id });
    if (!cart) {
      return res.json({ items: [] });
    }
    res.json({ items: cart.items });
  } catch (err) {
    console.error("Error fetching cart:", err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/cart/add", authmidle, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  try {
    let cart = await CartModel.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new CartModel({ userId: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.json({ msg: "Item added to cart successfully.", cart: cart.items });
  } catch (err) {
    console.error("Error adding item to cart:", err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/cart/update", authmidle, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const cart = await CartModel.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found." });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.json({ msg: "Cart updated successfully.", cart: cart.items });
    } else {
      res.status(404).json({ msg: "Item not found in cart." });
    }
  } catch (err) {
    console.error("Error updating cart:", err.message);
    res.status(500).send("Server Error");
  }
});

router.delete("/cart/remove", authmidle, async (req, res) => {
  const { productId } = req.body;
  try {
    const cart = await CartModel.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found." });
    }

    const originalLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId !== productId);

    if (cart.items.length < originalLength) {
      await cart.save();
      res.json({
        msg: "Item removed from cart successfully.",
        cart: cart.items,
      });
    } else {
      res.status(404).json({ msg: "Item not found in cart." });
    }
  } catch (err) {
    console.error("Error removing item from cart:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Amazon Clone OTP Verification",
      html: `<h1>Your OTP is: ${otp}</h1>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (err) {
    console.error("MAIL ERROR:", err);
    throw err;
  }
};

router.post("/check-user", async (req, res) => {
  const { input } = req.body;
  try {
    let user;
    if (input.includes("@")) {
      user = await User.findOne({ email: input });
    } else {
      user = await User.findOne({ phone: input });
    }

    if (user) {
      return res.json({
        userExists: true,
        msg: "User found. Please enter your password.",
      });
    } else {
      return res.json({
        userExists: false,
        msg: "User not found. Please create a new account.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error..." });
  }
});

router.get("/status", authmidle, (req, res) => {
  res.status(200).json({ isUserSignedIn: true, msg: "User is logged in." });
});

router.post("/login", async (req, res) => {
  const { input, password } = req.body;
  try {
    let user;
    if (input.includes("@")) {
      user = await User.findOne({ email: input });
    } else {
      user = await User.findOne({ phone: input });
    }
    console.log("User found");
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password matched");
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password." });
    }

    if (!user.email) {
      return res
        .status(400)
        .json({ msg: "Please login with your email to receive OTP." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("OTP generated");

    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    console.log("User saved");
    await sendOtpEmail(user.email, otp);
    console.log("Email sent");
    res.json({ msg: "OTP sent to your email. Please verify." });
  } catch (err) {
    // console.error(err.message);
    console.error("LOGIN ERROR:", err);
    res.status(500).send("Server Error");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logged out successfully." });
});

router.post("/signup", async (req, res) => {
  const { input, password, name } = req.body;

  try {
    const isEmail = input.includes("@");

    let user;
    if (isEmail) {
      user = await User.findOne({ email: input });
    } else {
      user = await User.findOne({ phone: input });
    }

    if (user) {
      return res
        .status(400)
        .json({ msg: "User already exists. Please sign in." });
    }

    if (!isEmail) {
      return res.status(400).json({
        msg: "For signup, please use an email address to receive OTP.",
      });
    }
    const newUser = new User({
      email: input.includes("@") ? input : null,
      phone: input.includes("@") ? null : input,
      password,
      name,
    });
    console.log(password);
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    console.log(salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    newUser.otp = otp;
    newUser.otpExpiry = Date.now() + 10 * 60 * 1000;

    await newUser.save();

    await sendOtpEmail(newUser.email, otp);
    res.json({ msg: "Account created successfully. OTP sent to your email." });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.post("/verify-otp", async (req, res) => {
  const { input, otp } = req.body;

  try {
    let user;
    if (input.includes("@")) {
      user = await User.findOne({ email: input });
    } else {
      user = await User.findOne({ phone: input });
    }

    if (!user) {
      return res.status(400).json({ msg: "Invalid user." });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP." });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, async (err, token) => {
      if (err) throw err;
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      const userLocation = await Location.findOne({ userId: user.id });
      res.json({
        msg: "OTP verified successfully. You are now logged in.",
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        location: userLocation
          ? {
              city: userLocation.city,
              state: userLocation.state,
              country: userLocation.country,
              formatted: userLocation.city,
            }
          : null,
      });
    });
  } catch (error) {
    console.error("OTP verification failed:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/profile", authmidle, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const userLocation = await Location.findOne({ userId: req.user.id });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      location: userLocation
        ? {
            zipcode: userLocation.zipcode,
            city: userLocation.city,
            state: userLocation.state,
            country: userLocation.country,
            formatted: `${userLocation.city}, ${userLocation.country}`,
          }
        : null,
    });
  } catch (err) {
    console.error("Error in /profile route:", err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/profile", authmidle, async (req, res) => {
  const { name, email, phone, zipCode, countryCode = "in" } = req.body;

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.name = name || user.name;
    user.email = email === null ? null : email || user.email;
    user.phone = phone === null ? null : phone || user.phone;

    if (email && email !== user.email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser && existingEmailUser.id !== user.id) {
        return res.status(400).json({ msg: "Email already in use." });
      }
    }
    if (phone && phone !== user.phone) {
      const existingPhoneUser = await User.findOne({ phone });
      if (existingPhoneUser && existingPhoneUser.id !== user.id) {
        return res.status(400).json({ msg: "Phone number already in use." });
      }
    }

    await user.save();

    let userLocation = null;

    if (zipCode && zipCode.trim() !== "") {
      const apiResponse = await axios.get(
        `http://api.zippopotam.us/${countryCode}/${zipCode}`
      );

      if (
        !apiResponse.data ||
        !apiResponse.data.places ||
        apiResponse.data.places.length === 0
      ) {
        return res
          .status(400)
          .json({ msg: "Invalid zip code or location not found by API." });
      }

      const placeData = apiResponse.data.places[0];
      const { "place name": city, state } = placeData;
      const country = apiResponse.data.country;

      userLocation = await Location.findOne({ userId: req.user.id });

      if (userLocation) {
        userLocation.zipCode = zipCode;
        userLocation.city = city;
        userLocation.state = state;
        userLocation.country = country;
        userLocation.language = userLocation.language;
        await userLocation.save();
      } else {
        userLocation = new Location({
          userId: req.user.id,
          zipcode: zipCode,
          city,
          state,
          country,
          language: "en",
        });
        await userLocation.save();
      }
    } else if (zipCode === "") {
      await Location.deleteOne({ userId: req.user.id });
      userLocation = null;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      location: userLocation
        ? {
            zipcode: userLocation.zipCode,
            city: userLocation.city,
            state: userLocation.state,
            country: userLocation.country,
            formatted: `${userLocation.city}, ${userLocation.country}`,
          }
        : null,
    });
  } catch (err) {
    console.error("Error updating profile:", err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/set-location", authmidle, async (req, res) => {
  const { zipCode, countryCode = "in" } = req.body;
  console.log("Received zipCode:", zipCode);
  if (!zipCode) {
    return res.status(400).json({ msg: "Zip code is required" });
  }

  try {
    const apiResponse = await axios.get(
      `http://api.zippopotam.us/${countryCode}/${zipCode}`
    );
    if (
      !apiResponse.data ||
      !apiResponse.data.places ||
      apiResponse.data.places.length === 0
    ) {
      return res
        .status(404)
        .json({ msg: "Location not found for this zip code." });
    }

    const placeData = apiResponse.data.places[0];
    const { "place name": city, state } = placeData;
    const country = apiResponse.data.country;

    let location = await Location.findOne({ userId: req.user.id });

    if (location) {
      location.zipCode = zipCode;
      location.city = city;
      location.state = state;
      location.country = country;
      await location.save();
    } else {
      location = new Location({
        userId: req.user.id,
        zipCode,
        city,
        state,
        country,
      });
      await location.save();
    }

    res.json({
      msg: "Location updated successfully",
      location: {
        city: location.city,
        state: location.state,
        country: location.country,
        formatted: `${location.city}, ${location.country}`,
      },
    });
  } catch (error) {
    console.error("Error in set-location route:", error.message);
    if (error.response && error.response.status === 404) {
      return res
        .status(400)
        .json({ msg: "Invalid zip code or location not found by API." });
    }
    res.status(500).send("Server Error");
  }
});

router.get("/cart", authmidle, async (req, res) => {
  try {
    const cart = await CartModel.findOne({ userId: req.user.id });
    if (!cart) {
      return res.json({ items: [] });
    }
    res.json({ items: cart.items });
  } catch (err) {
    console.error("Error fetching cart:", err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/cart/add", authmidle, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  try {
    let cart = await CartModel.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new CartModel({ userId: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.json({ msg: "Item added to cart successfully.", cart: cart.items });
  } catch (err) {
    console.error("Error adding item to cart:", err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/cart/update", authmidle, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const cart = await CartModel.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found." });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.json({ msg: "Cart updated successfully.", cart: cart.items });
    } else {
      res.status(404).json({ msg: "Item not found in cart." });
    }
  } catch (err) {
    console.error("Error updating cart:", err.message);
    res.status(500).send("Server Error");
  }
});

router.delete("/cart/remove", authmidle, async (req, res) => {
  const { productId } = req.body;
  try {
    const cart = await CartModel.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found." });
    }

    const originalLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId !== productId);

    if (cart.items.length < originalLength) {
      await cart.save();
      res.json({
        msg: "Item removed from cart successfully.",
        cart: cart.items,
      });
    } else {
      res.status(404).json({ msg: "Item not found in cart." });
    }
  } catch (err) {
    console.error("Error removing item from cart:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
