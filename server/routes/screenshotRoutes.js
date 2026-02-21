const express = require('express');
const router = express.Router();
const { uploadImage, getHistory, deleteScreenshot, updateScreenshot } = require('../controllers/imageController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, upload.single('image'), uploadImage);
router.get('/history', protect, getHistory);
router.delete('/:id', protect, deleteScreenshot);
router.put('/:id', protect, updateScreenshot);

module.exports = router;