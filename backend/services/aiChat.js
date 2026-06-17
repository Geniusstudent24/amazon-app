const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const possiblePaths = [
    path.join(process.cwd(), "data/db.json")
];

let db = { products: [] };
let dbFound = false;

for (const p of possiblePaths) {
    try {
        const raw = fs.readFileSync(p, "utf8");
        db = JSON.parse(raw);
        dbFound = true;
        break;
    } catch (err) {}
}

if (!dbFound) {
    console.error("db.json not found");
}

function extractKeywords(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(word => word.length > 1);
}

function getRelevantProducts(message) {
    const keywords = extractKeywords(message);

    return db.products
        .filter(product =>
            keywords.some(keyword =>
                product.title?.toLowerCase().includes(keyword) ||
                product.category?.toLowerCase().includes(keyword) ||
                product.brand?.toLowerCase().includes(keyword) ||
                (product.tags &&
                    product.tags.some(tag =>
                        tag.toLowerCase().includes(keyword)
                    ))
            )
        )
        .slice(0, 8);
}

function sanitizeHistory(history) {
    if (!Array.isArray(history)) return [];

    return history
        .filter(
            msg =>
                msg &&
                typeof msg.role === "string" &&
                Array.isArray(msg.parts)
        )
        .slice(-10); 
}

async function getAIResponse(userMessage, chatHistory = []) {
    const cleanHistory = sanitizeHistory(chatHistory);
    
    let relevantProducts = getRelevantProducts(userMessage);

    if (relevantProducts.length === 0 && cleanHistory.length > 0) {
        const lastUserMsg = cleanHistory.find(msg => msg.role === "user");
        if (lastUserMsg && lastUserMsg.parts && lastUserMsg.parts[0]) {
            relevantProducts = getRelevantProducts(lastUserMsg.parts[0].text);
        }
    }

    if (relevantProducts.length === 0 && cleanHistory.length === 0) {
        return "Maaf kijiye, ye product hamare paas abhi available nahi hai.";
    }

    const systemInstructionContent = `
Tum Meet ke Amazon Clone ke official AI Assistant ho.

RULES:
1. Sirf niche diye gaye products ki information do.
2. Kisi bhi external topic (news, coding, weather, politics, general knowledge) ka jawab mat do.
3. Agar product ya context available nahi ho to bolo: "Maaf kijiye, ye product hamare paas abhi available nahi hai."
4. Hamesha Hinglish mein jawab do.
5. Response short aur point-to-point rakho.
6. Price batate waqt $ symbol use karo.

AVAILABLE PRODUCTS:
${JSON.stringify(relevantProducts)}
`;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemInstructionContent,
    });

    const chat = model.startChat({
        history: cleanHistory,
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
}

module.exports = { getAIResponse };