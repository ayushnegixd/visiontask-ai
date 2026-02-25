const Screenshot = require('../models/Screenshot');
const analyzeImage = require('../Utils/aiHandler');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const localFilePath = req.file.path;

    // 1. Upload to Cloudinary first
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: 'screenshot-saas',
    });

    const imageUrl = result.secure_url;
    const publicId = result.public_id;

    // 2. Analyze image with AI
    let aiData = {
      description: '',
      title: 'New Screenshot',
    };

    try {
      const mimeType = req.file.mimetype;
      const jsonResponse = await analyzeImage(localFilePath, mimeType);
      const parsed = JSON.parse(jsonResponse);
      console.log('Parsed AI Data:', parsed); // Debug logging

      aiData = {
        description: parsed.content || parsed.description || parsed.text || parsed.summary || parsed.extractedText || 'No description available',
        title: parsed.title || 'New Screenshot',
      };
    } catch (aiError) {
      console.error('AI Controller Error:', aiError);
      aiData.description = 'AI Analysis Failed';
      aiData.title = 'New Screenshot';
    }

    // 3. Clear local storage immediately
    fs.unlinkSync(localFilePath);

    // 4. Create and Save Document
    const screenshot = new Screenshot({
      imageUrl: imageUrl,
      extractedText: aiData.description,
      title: aiData.title,
      user: req.user._id,
      publicId: publicId,
    });

    const savedScreenshot = await screenshot.save();

    // 5. Send Response
    res.status(201).json(savedScreenshot);
  } catch (error) {
    console.error(error);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const screenshots = await Screenshot.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(screenshots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteScreenshot = async (req, res) => {
  try {
    const screenshot = await Screenshot.findById(req.params.id);

    if (!screenshot) {
      return res.status(404).json({ message: 'Screenshot not found' });
    }

    if (screenshot.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    if (screenshot.publicId) {
      await cloudinary.uploader.destroy(screenshot.publicId);
    } else {
      console.log('Cloudinary Info: publicId undefined for screenshot', screenshot._id);
    }

    await screenshot.deleteOne();

    res.json({ message: 'Screenshot removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updateScreenshot = async (req, res) => {
  try {
    const screenshot = await Screenshot.findById(req.params.id);

    if (!screenshot) {
      return res.status(404).json({ message: 'Screenshot not found' });
    }

    if (screenshot.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    screenshot.status = req.body.status !== undefined ? req.body.status : screenshot.status;
    screenshot.isPinned = req.body.isPinned !== undefined ? req.body.isPinned : screenshot.isPinned;
    screenshot.reminderDate = req.body.reminderDate !== undefined ? req.body.reminderDate : screenshot.reminderDate;

    const updatedScreenshot = await screenshot.save();
    res.json(updatedScreenshot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadImage, getHistory, deleteScreenshot, updateScreenshot };