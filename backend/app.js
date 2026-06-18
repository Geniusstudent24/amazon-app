const express = require("express");
const app = express();
require("dotenv").config();
const mongodb = require("./connection");
const cors = require("cors");
const authRouter = require("./services/auth.jsx");
const cookieParser = require("cookie-parser");
const orderRouter = require("./services/order.jsx");
const { getAIResponse } = require("./services/aiChat");
const productsData = require("./routes/productRoutes.js");

const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: "https://amazon-app-meet.vercel.app/",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
mongodb();

app.use("/api/auth", authRouter);
app.use("/api/orders", orderRouter);
app.use("/api", productsData);

app.post("/api/chat", async (req, res) => {
    try {
        const { message, history } = req.body;
        const aiReply = await getAIResponse(message, history || []);
        res.json({ reply: aiReply });
    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({
            error: "Assistant abhi busy hai, baad mein try karein."
        });
    }
});

app.listen(PORT, () => console.log(`server is started on ${PORT}...`));
