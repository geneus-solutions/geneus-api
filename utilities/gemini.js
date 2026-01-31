import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


//  Vision: Detect food items from image

export const getGeminiVisionResult = async (imageBase64) => {
    const prompt = `
Identify all distinct food items in this image.
Return ONLY valid JSON in the following format:

{
  "items": ["Food name 1", "Food name 2"],
  "summary": "Short description of the meal"
}

If the image does not contain food, return:
{ "isFood": false }
`;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: imageBase64,
                mimeType: "image/jpeg"
            }
        }
    ]);

    const text = cleanJson(result.response.text());
    const data = JSON.parse(text);

    if (data.isFood === false) return null;

    return data;
};

// Nutrition: Get nutrition data for a food
export const getGeminiNutrition = async (foodName) => {
    const prompt = `
Provide nutritional information for "${foodName}" per standard serving.
Return ONLY valid JSON:

{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "servingSize": "string"
}
`;

    const result = await model.generateContent(prompt);
    const text = cleanJson(result.response.text());

    return JSON.parse(text);
};

//   Clean Gemini JSON responses

const cleanJson = (text) => {
    return text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
};
