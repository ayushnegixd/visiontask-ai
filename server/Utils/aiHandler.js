const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const analyzeImage = async (filePath, mimeType) => {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_SECONDARY,
    process.env.GEMINI_API_KEY_THIRD
  ];

  for (const key of keys) {
    if (!key) continue;

    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: "application/json" }
      });

      const fileData = fs.readFileSync(filePath);
      const imagePart = {
        inlineData: {
          data: fileData.toString('base64'),
          mimeType: mimeType || 'image/jpeg',
        },
      };

      const prompt = `Identify all text or describe the image briefly. Return JSON: { title, content }`;

      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();

      const cleanedText = responseText.replace(/```json|```/g, '').trim();
      console.log('AI Raw Output:', cleanedText);

      return cleanedText;

    } catch (error) {
      if (error.status === 429 || error.message.includes('429')) {
        console.warn(`Key ending in ...${key.slice(-4)} hit quota. Rotating...`);
        continue;
      }
      console.error(`Key ending in ...${key.slice(-4)} failed:`, error.message);
    }
  }

  return JSON.stringify({
    title: "Quota Reached",
    extractedText: "AI is resting. Please try again in a few hours!"
  });
};

module.exports = analyzeImage;
