const Tesseract = require('tesseract.js');

const extractText = async (imagePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
    return text;
  } catch (error) {
    throw new Error('OCR Failed');
  }
};

module.exports = extractText;