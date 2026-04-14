require('dotenv').config({path: '../.env'});
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
console.log("Testing API key from .env:", apiKey);

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  try {
    const result = await model.generateContent("Hello, world!");
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Error connecting to Gemini:", err.message);
  }
}

run();
